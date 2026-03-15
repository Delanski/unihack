import styles from './TimerBar.module.css';

interface Props {
  timeRemaining: number;
  totalTime: number;
  mode: 'study' | 'break';
}

export default function TimerBar({ timeRemaining, totalTime, mode }: Props) {
  const pct = Math.min(100, Math.max(0, (timeRemaining / totalTime) * 100));

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>{mode === 'study' ? 'Focus' : 'Break'}</span>
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${styles[mode]}`}
          style={{ height: `${pct}%` }}
        />
      </div>
    </div>
  );
}