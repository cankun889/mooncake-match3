import { SmartDeviceModel } from '@ray-js/panel-sdk';
import { createDpKit } from '@ray-js/panel-sdk/lib/sdm/interceptors/dp-kit';
import { getLaunchOptionsSync } from '@ray-js/ray';
import { deviceSchema, deviceSchemaMap } from './schema';

type SmartDeviceSchema = typeof deviceSchema;

// dpKit is the protocol bridge used to translate raw DP events into the
// device model. Initialised in app.tsx via dpKit.init(device) once the
// SmartDeviceModel reports its first onInitialized callback.
export const dpKit = createDpKit<SmartDeviceSchema>({ protocols: {} });

// Single main-device model. Wrap the app with <SdmProvider value={devices.common}>
// so panel-sdk hooks (useProps, useActions, etc.) can resolve this instance.
export const devices = {
  common: new SmartDeviceModel<SmartDeviceSchema>({
    interceptors: dpKit.interceptors,
  }),
};

export type DeviceCommon = typeof devices.common;

// Detect whether we're running against a real Tuya device (on-device debug,
// production, or Tuya MiniApp IDE with a paired device). If the launch query
// carries a `deviceId` or `groupId`, a real device session is in progress and
// the production cloud path should run unchanged. Without either key, we're
// in TuyaOpen IDE preview mode (offline) and should use the local loopback.
function hasRealDevice(): boolean {
  try {
    const launch: any = getLaunchOptionsSync() || {};
    const query = launch.query || {};
    return !!(query.deviceId || query.groupId);
  } catch {
    return false;
  }
}

export function isOfflinePreview(): boolean {
  return !hasRealDevice();
}

// The TuyaOpen IDE webview hosts a chassis "Virtual Device" panel that pushes DPs
// via the `tymp` postMessage protocol. The webview also relays the host's
// `device.dpChange` events back through the same channel.
//
// AMD closure parameter shadowing — the minipack bundler wraps the entire bundle
// in an AMD-style IIFE:
//
//   !function($$setCurrentPath, define, require, __lazyCode__) {
//     define("main.js", function(require, module, exports, ty, Promise, global,
//                                window, top, document, frames, self, ...) {
//       // bundle body — `window` is the closure parameter here
//     });
//   }
//
// Mothra's service.html runtime calls the factory with only 2 extra args
// (getAppApi result and window.Promise). All remaining parameters — including
// `window`, `top`, `document`, `frames`, `self` — are left undefined. The
// production code's `typeof window === 'undefined'` guard therefore ALWAYS
// fires in service.html and the bridge was never installed.
//
// FIX: `globalThis` is NOT in the AMD closure parameter list, so it refers to
// the real JS global of the execution context. In service.html (a real browser
// iframe) `globalThis` IS the iframe's Window object, which has `.parent`,
// `.addEventListener`, etc. We resolve the real window through `globalThis`
// and use it instead of the closure-shadowed `window` parameter.
//
// If `globalThis` itself lacks `addEventListener` (e.g. a headless worker
// sandbox with no DOM at all), we bail out silently — the bridge is pointless
// in that context.
let installOfflineBridgeAttempts = 0;
export function installOfflineBridge(): void {
  // Resolve the real window object. In TuyaOpen IDE service.html, the bundle
  // runs inside a minipack AMD closure that shadows `window` as a parameter,
  // but `globalThis` is NOT a closure parameter so it always refers to the
  // real execution-context global (the iframe Window in Electron/Chromium).
  // Modern Chromium (v71+) supports globalThis natively, so no polyfill
  // rewrite occurs and this check reliably resolves to the iframe Window.
  const isWindowLike = (w: any): w is Window =>
    !!w && typeof w.addEventListener === 'function' && typeof w.postMessage === 'function';
  const realWindow: (Window & typeof globalThis) | undefined = (() => {
    // 1. window — available in /view/ scope and in real Tuya App runtime.
    if (typeof window !== 'undefined' && isWindowLike(window)) {
      return window as Window & typeof globalThis;
    }
    // 2. globalThis — not a closure param; resolves to real iframe Window
    //    in TuyaOpen IDE service.html (Electron Chromium, native globalThis).
    if (typeof globalThis !== 'undefined' && isWindowLike(globalThis)) {
      return globalThis as Window & typeof globalThis;
    }
    // No window-like context available (headless worker, etc.) — bridge is
    // not needed here.
    return undefined;
  })();
  if (!realWindow) {
    if (installOfflineBridgeAttempts === 0) {
      // eslint-disable-next-line no-console
      console.log('[offline-preview] bridge install skipped — no window in this context');
    }
    installOfflineBridgeAttempts += 1;
    return;
  }
  const dev = devices.common as any;
  if (dev.__offlinePreviewBridgeInstalled__) return;

  const TYMP_NS = 'tymp';
  let tympToken: string | null = null;
  let tympInvokeSeq = 0;

  // Detect whether realWindow is a Web Worker scope. Mothra's view.js spawns
  // service.js + main.js into a `new Worker(...)`, NOT an iframe — so even
  // though `globalThis` looks Window-like (it has addEventListener and
  // postMessage), it has no `.top` / `.parent` and posting up to chassis must
  // go through `self.postMessage(msg)` which delivers to the spawning page-
  // frame's `worker.onmessage` handler. The page-frame's INJECTED_SHIM relay
  // (see proxy injection in src/miniappPocPreview.ts) catches that and
  // forwards to chassis. Conversely, chassis-→panel events arrive here as
  // `message` events on `self` after the relay calls `worker.postMessage(...)`.
  const isWorkerScope = typeof (realWindow as any).document === 'undefined'
    && typeof (realWindow as any).top === 'undefined'
    && typeof (realWindow as any).parent === 'undefined';

  const sendUp = (msg: any) => {
    if (isWorkerScope) {
      // Worker → spawner. The page-frame relay (Worker constructor patch in
      // INJECTED_SHIM) listens for `{ns:'tymp'}` here and re-posts to top.
      try { (realWindow as any).postMessage(msg); } catch { /* spawner gone */ }
      return;
    }
    // Iframe path. The bundle runs in /service.html nested inside a webview:
    //   VS Code main window (vscode-app://, OUTSIDE webview sandbox)
    //     └─ chassis (vscode-webview://)
    //          └─ user iframe (proxy URL)
    //               └─ page-frame
    //                    └─ service.html (bundle here when not in Worker mode)
    //
    // `window.top` from inside the webview reaches the VS Code main window —
    // that frame is outside the webview sandbox and postMessage to it is
    // silently dropped. Only `window.parent` is a reachable upward target.
    // INJECTED_SHIM's tymp relay running in each intermediate HTML frame
    // chains the message up via per-layer `parent.postMessage`.
    try {
      const parentWin = (realWindow as any).parent;
      if (parentWin && parentWin !== (realWindow as any)) {
        parentWin.postMessage(msg, '*');
      }
    } catch {
      /* parent gone */
    }
  };

  // Resolve schema-derived id/code maps lazily at message-receive time. The
  // bridge installs at module-eval; __devInfo__ may not be populated until
  // initOfflinePreview's offline-init block runs, so reading these eagerly
  // would freeze them to empty maps.
  const dispatchToSdm = (incoming: Record<string, any>) => {
    if (!incoming || typeof incoming !== 'object' || Object.keys(incoming).length === 0) return;
    const devInfo = dev.__devInfo__ || {};
    const idCodesRef: Record<string, string> = devInfo.idCodes || {};
    const codeIdsRef: Record<string, number> = devInfo.codeIds || {};
    const devId: string = devInfo.devId || 'preview-offline';
    const dpsById: Record<string, any> = {};
    for (const key of Object.keys(incoming)) {
      if (Object.prototype.hasOwnProperty.call(idCodesRef, key)) {
        dpsById[key] = incoming[key];
      } else if (Object.prototype.hasOwnProperty.call(codeIdsRef, key)) {
        dpsById[String(codeIdsRef[key])] = incoming[key];
      } else {
        dpsById[key] = incoming[key];
      }
    }
    try {
      // eslint-disable-next-line no-console
      console.log('[offline-preview] inbound dp', dpsById, 'devId=', devId);
      dev.__dpDataChangeHandler__({ deviceId: devId, dps: dpsById, __from__: 'dp-kit' });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[offline-preview] inbound dispatch error', err);
    }
  };

  realWindow.addEventListener('message', (ev: MessageEvent) => {
    const m: any = ev?.data;
    if (!m || m.ns !== TYMP_NS) return;
    if (m.kind === 'init' && typeof m.token === 'string') {
      // Capture the token; do NOT re-send hello — chassis replies `init` to
      // every `hello`, so re-sending here would create a hello/init ping-pong
      // (the chassis log floods with `bridge.hello: totalShims:1` and the
      // message queue saturates, slowing every panel⇄chassis round-trip).
      // The initial bootstrap hello below is enough to register this shim;
      // subsequent inits (e.g. chassis broadcastInit race or token refresh)
      // are silent token updates.
      tympToken = m.token;
      // eslint-disable-next-line no-console
      console.log('[offline-preview] bridge init token captured');
      return;
    }
    if (m.kind === 'event' && m.topic === 'device.dpChange') {
      const payload = m.payload || {};
      const incoming = payload.dps || {};
      // Skip echoes we just published — chassis tags them with `source: 'shim'`.
      const src = payload.options && payload.options.source;
      if (src === 'shim') return;
      dispatchToSdm(incoming);
      return;
    }
  });

  // Reach out in case the parent's broadcastInitToDescendants ran before this
  // listener was attached — webview will reply with `init` on iframeLoad.
  sendUp({ ns: TYMP_NS, kind: 'hello' });
  // eslint-disable-next-line no-console
  console.log('[offline-preview] bridge installed; awaiting init token');

  // Expose an upstream-publish hook for offlinePublish to call without needing
  // closure access to tympToken/tympInvokeSeq.
  (dev as any).__offlinePreviewSendInvoke__ = (dpsById: Record<string, any>, devId: string) => {
    if (!tympToken) return false;
    tympInvokeSeq += 1;
    const id = 'panel-' + Date.now().toString(36) + '-' + tympInvokeSeq;
    sendUp({
      ns: TYMP_NS,
      kind: 'invoke',
      id,
      api: 'device.publishDps',
      args: [{ deviceId: devId, dps: dpsById }],
      token: tympToken,
    });
    return true;
  };

  dev.__offlinePreviewBridgeInstalled__ = true;
}

// In TuyaOpen IDE preview, the iframe loads with no `deviceId` in its launch
// query, so SmartDeviceModel.init() throws and SdmProvider renders null
// (panel-sdk gates children on `device.initialized`). To let the panel render
// AND respond to user input against the cloud-synced schema, we:
//   1. Pre-populate the internal state from the schema and flip `initialized = true`
//   2. Override `__publishDps__` so writes loop back into local state, simulating
//      a closed-loop DP roundtrip — the user can drive the slider and watch the
//      value update without a real device.
// When a real deviceId arrives (e.g. running inside Tuya MiniApp IDE simulator
// or against a bound device), this function returns early and the production
// cloud path runs unchanged.
export function initOfflinePreview(): void {
  if (hasRealDevice()) return;

  // Bridge install is independent of offline-state install — see comment on
  // installOfflineBridge for why this order matters.
  installOfflineBridge();

  const dev = devices.common as any;
  if (dev.__offlinePreviewInstalled__) return;

  const dps: Record<string, any> = {};
  const idCodes: Record<string, string> = {};
  const codeIds: Record<string, number> = {};
  for (const item of deviceSchema as readonly any[]) {
    idCodes[String(item.id)] = item.code;
    codeIds[item.code] = item.id;
    const property = item.property || {};
    if (property.type === 'bool') dps[String(item.id)] = false;
    else if (property.type === 'value')
      dps[String(item.id)] = typeof property.min === 'number' ? property.min : 0;
    else if (property.type === 'enum')
      dps[String(item.id)] = Array.isArray(property.range) ? property.range[0] : '';
    else if (property.type === 'string') dps[String(item.id)] = '';
    else if (property.type === 'bitmap') dps[String(item.id)] = 0;
  }
  const dpState: Record<string, any> = {};
  for (const item of deviceSchema as readonly any[]) dpState[item.code] = dps[String(item.id)];

  if (!dev.initialized) {
    dev.__dpSchema__ = deviceSchemaMap;
    dev.__dpState__ = dpState;
    dev.__devInfo__ = {
      devId: 'preview-offline',
      deviceId: 'preview-offline',
      schema: deviceSchema,
      dps,
      idCodes,
      codeIds,
      isOnline: true,
      name: 'Preview Device',
      productId: 'preview',
    };
    dev.initialized = true;

    const listeners = dev.initializedListeners || {};
    for (const id of Object.keys(listeners)) {
      const listener = listeners[id];
      if (typeof listener === 'function') {
        try {
          listener(dev);
        } catch {
          /* listener error — non-fatal in preview */
        }
      }
    }
  }

  // Override the cloud roundtrip with a local one. `actions.<code>.set(v)`
  // bottoms out at __publishDps__, and the public `publishDps` arrow has its
  // `this` baked in by the SDM's class field initializer — replacing both
  // properties keeps the offline impl reachable from either entry point.
  // We dispatch through `__dpDataChangeHandler__` with `__from__: 'dp-kit'`
  // because dp-kit's onDpDataChange interceptor blocks any other origin
  // marker (the production loopback uses the same trick via
  // triggerDpStateHandler in the dp-kit interceptor). Mode is ignored on
  // purpose: in preview the user must be able to drive read-only DPs to
  // inspect the UI's response curves.
  const codeIdsRef: Record<string, number> = dev.__devInfo__?.codeIds || codeIds;
  const devId: string = dev.__devInfo__?.devId || 'preview-offline';

  const offlinePublish = (data: Record<string, any>) => {
    if (!data || typeof data !== 'object') return Promise.resolve(false);
    const dpsById: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      if (Object.prototype.hasOwnProperty.call(codeIdsRef, key)) {
        dpsById[String(codeIdsRef[key])] = data[key];
      } else {
        dpsById[key] = data[key];
      }
    }
    if (Object.keys(dpsById).length === 0) return Promise.resolve(false);
    // Surfacing the publish into the console is the only feedback the
    // developer gets in offline preview — without it a stuck event handler
    // is indistinguishable from a working one.
    // eslint-disable-next-line no-console
    console.log('[offline-preview] publishDps', data, '→ dpsById', dpsById);
    try {
      dev.__dpDataChangeHandler__({ deviceId: devId, dps: dpsById, __from__: 'dp-kit' });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[offline-preview] handler error', err);
    }
    // Forward to chassis virtual device via the bridge hook installed by
    // installOfflineBridge(). If the bridge token hasn't arrived yet (parent
    // never sent `init`), the hook is a no-op — local loop above already
    // handled the UI.
    const sendInvoke = (dev as any).__offlinePreviewSendInvoke__;
    if (typeof sendInvoke === 'function') sendInvoke(dpsById, devId);
    return Promise.resolve(true);
  };
  dev.publishDps = offlinePublish;
  dev.__publishDps__ = offlinePublish;

  dev.__offlinePreviewInstalled__ = true;
}
