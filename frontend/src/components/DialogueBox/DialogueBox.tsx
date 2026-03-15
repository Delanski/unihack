import { useEffect, useState } from 'react';
import styles from './DialogueBox.module.css';

export interface Choice {
  label: string;
  onSelect: () => void;
}

interface Props {
  speaker: string;
  text: string;
  choices?: Choice[];
  onAdvance?: () => void;
  onDismiss?: () => void;
}

export default function DialogueBox({ speaker, text, choices, onAdvance, onDismiss }: Props) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  const isTyping = displayed.length < text.length;

  const handleClick = () => {
    if (isTyping) { setDisplayed(text); return; }
    if (!choices && onAdvance) onAdvance();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.box} onClick={handleClick}>
        <div className={styles.topRow}>
          <div className={styles.nameplate}>{speaker}</div>
          <button
            className={styles.dismissBtn}
            onClick={(e) => { e.stopPropagation(); onDismiss?.(); }}
          >✕</button>
        </div>
        <p className={styles.text}>{displayed}</p>
        {!isTyping && choices && (
          <div className={styles.choices}>
            {choices.map((c, i) => (
              <button key={i} className={styles.choiceBtn} onClick={(e) => {
                e.stopPropagation();
                c.onSelect();
              }}>
                {c.label}
              </button>
            ))}
          </div>
        )}
        {!isTyping && !choices && onAdvance && (
          <p className={styles.continueHint}>click to continue ▸</p>
        )}
      </div>
    </div>
  );
}