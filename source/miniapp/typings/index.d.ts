declare module '*.png';
import { getDeviceInfo, getDeviceThingModelInfo } from '@ray-js/ray';

declare module '*.module.less' {
  const classes: {
    readonly [key: string]: string;
  };
  export default classes;
  declare module '*.less';
}

declare global {
  interface Window {
    devToolsExtension?: () => any;
    __DEV__: boolean;
  }
}

type DpValue = boolean | number | string;
interface DpState {
  [dpCode: string]: DpValue;
}

/// 一些 TTT 通用工具泛型 ///
type GetTTTAllParams<Fn> = Parameters<Fn>['0'];
type GetTTTParams<Fn> = Omit<GetTTTAllParams<Fn>, 'complete' | 'success' | 'fail'>;
type GetTTTCompleteData<Fn> = Parameters<GetTTTAllParams<Fn>['complete']>['0'];
type GetTTTSuccessData<Fn> = Parameters<GetTTTAllParams<Fn>['success']>['0'];
type GetTTTFailData<Fn> = Parameters<GetTTTAllParams<Fn>['fail']>['0'];
///                   ///

/**
 * TTT 方法统一错误码
 */
type TTTCommonErrorCode = GetTTTFailData<typeof getDeviceInfo>;

/**
 * 设备信息
 */
type DevInfo = DeviceInfo & { state: DpState };

/**
 * 设备物模型信息
 */
type ThingModelInfo = GetTTTSuccessData<typeof getDeviceThingModelInfo>;

type AtLeastOne<T extends Record<string, any>> = keyof T extends infer K
  ? K extends string
    ? Pick<T, K & keyof T> & Partial<T>
    : never
  : never;

