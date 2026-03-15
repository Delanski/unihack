import { useEffect, useState } from 'react';
import styles from './SplashScreen.module.css';

interface Props {
  onDone: () => void;
  image: string;
}

export default function SplashScreen({ onDone, image }: Props) {
  const [phase, setPhase] = useState<'in' | 'show' | 'out'>('in');

  useEffect(() => {
    const showTimer = setTimeout(() => setPhase('show'), 600);  // was 1000
    const outTimer  = setTimeout(() => setPhase('out'), 3000);  // was 4000
    const doneTimer = setTimeout(() => onDone(), 3000);         // was 5000
    return () => {
      clearTimeout(showTimer);
      clearTimeout(outTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div className={`${styles.wrapper} ${styles[phase]}`}>
      <img src={image} alt="splash" className={styles.image} />
    </div>
  );
}