import React, { useEffect, useState } from 'react';
import { View, Text, Button } from '@ray-js/ray';
import { checkOta, OtaInfo } from '@/utils/ota';
import styles from './index.module.less';

declare const ty: any;

type OtaState = 'idle' | 'available' | 'upgrading' | 'done' | 'error';

export default function OtaCard({ onUpgradingChange }: { onUpgradingChange?: (v: boolean) => void }) {
  const [state, setState] = useState<OtaState>('idle');
  const [otaInfo, setOtaInfo] = useState<OtaInfo | null>(null);
  const [progress, setProgress] = useState(0);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    checkOta().then(info => {
      if (info) { setOtaInfo(info); setState('available'); }
    });
  }, []);

  const handleUpgrade = async () => {
    if (!otaInfo) return;
    setState('upgrading');
    onUpgradingChange?.(true);
    setProgress(0);
    try {
      await otaInfo.upgrade(pct => setProgress(pct));
      setState('done');
      onUpgradingChange?.(false);
      if (typeof ty !== 'undefined' && ty.showToast) {
        ty.showToast({ title: 'Update succeeded', icon: 'success' });
      }
    } catch (e: any) {
      setState('error');
      onUpgradingChange?.(false);
      const msg = String(e?.message ?? 'Update failed');
      setErrMsg(msg);
      if (typeof ty !== 'undefined' && ty.showToast) {
        ty.showToast({ title: msg, icon: 'error' });
      }
    }
  };

  if (state === 'idle' || state === 'done') return null;

  return (
    <View className={styles.otaCard}>
      <Text className={styles.otaTitle}>Firmware Update Available</Text>
      <Text className={styles.otaMeta}>
        v{otaInfo?.targetVersion ?? '–'}
        {otaInfo?.firmwareSize ? `  ·  ${(otaInfo.firmwareSize / 1024).toFixed(0)} KB` : ''}
      </Text>
      {state === 'upgrading' && (
        <View className={styles.otaProgressBar}>
          <View className={styles.otaProgressFill} style={{ width: `${progress}%` }} />
        </View>
      )}
      {state === 'error' && (
        <Text className={styles.otaMeta}>{errMsg}</Text>
      )}
      <Button
        className={`${styles.otaBtn} ${state === 'upgrading' ? styles.otaBtnDisabled : ''}`}
        disabled={state === 'upgrading'}
        onClick={handleUpgrade}
      >
        {state === 'upgrading' ? `Updating ${progress}%` : state === 'error' ? 'Retry' : 'Update Now'}
      </Button>
    </View>
  );
}
