import { useEffect, useRef, useState } from 'react';
import styles from './PommeSprite.module.css';
import { sprites } from '../../assets/sprites/index';
import DialogueBox, { type Choice } from '../DialogueBox/DialogueBox';

interface DialogueState {
  speaker: string;
  text: string;
  choices?: Choice[];
  onAdvance?: () => void;
}

interface Props {
  forceDialogue?: DialogueState | null;
  onDialogueDone?: () => void;
  currentSprite?: string;
  disableBuiltinDialogue?: boolean;
}

export default function PommeSprite({ forceDialogue, onDialogueDone, currentSprite, disableBuiltinDialogue }: Props) {
  const [localSprite, setLocalSprite]   = useState('neutral');
  const [tempOverride, setTempOverride] = useState<string | null>(null);
  const [dialogue, setDialogue]         = useState<DialogueState | null>(null);
  const clickCountRef                   = useRef(0);
  const idleTimerRef                    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tempTimerRef                    = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdleTimer = () => {
    if (disableBuiltinDialogue) return;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (!dialogue) {
        setLocalSprite('teasing');
        setDialogue({
          speaker: 'Pomme',
          text: "You haven't fallen asleep, right?",
          choices: [
            { label: '[…] We can start now.', onSelect: () => {
              setLocalSprite('happy');
              setDialogue({ speaker: 'Pomme', text: "Of course.", onAdvance: clearDialogue });
            }},
            { label: 'Maybe some other time.', onSelect: () => {
              setLocalSprite('neutral');
              setDialogue({ speaker: 'Pomme', text: "That's perfectly fine.", onAdvance: clearDialogue });
            }},
          ],
        });
      }
    }, 2 * 60 * 1000);
  };

  useEffect(() => {
    resetIdleTimer();
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
    };
  }, [dialogue, disableBuiltinDialogue]);

  useEffect(() => {
    if (forceDialogue) setDialogue(forceDialogue);
  }, [forceDialogue]);

  useEffect(() => {
    if (currentSprite) setLocalSprite(currentSprite);
  }, [currentSprite]);

  const clearDialogue = () => {
    setDialogue(null);
    setLocalSprite('neutral');
    onDialogueDone?.();
  };

  const showLine = (
    speaker: string,
    text: string,
    spriteKey: string,
    onAdvance: () => void
  ) => {
    setLocalSprite(spriteKey);
    setDialogue({ speaker, text, onAdvance });
  };

  const handleClick = () => {
    if (dialogue) return;
    if (disableBuiltinDialogue) return;
    clickCountRef.current += 1;

    if (clickCountRef.current % 5 === 0) {
      setLocalSprite('curious');
      setDialogue({
        speaker: 'Pomme',
        text: 'How are you feeling today?',
        choices: [
          {
            label: "I'm ready to power through!",
            onSelect: () => showLine('Pomme', "Glad to hear it.", 'happy', clearDialogue),
          },
          {
            label: "There's too many things to cover…",
            onSelect: () => showLine('Pomme', "That's normal. Don't overwork yourself, okay?", 'sad', () =>
              showLine('Pomme', "Let me know when you're ready.", 'sad', clearDialogue)
            ),
          },
        ],
      });
    } else {
      const peek = Math.random() > 0.5 ? 'curious' : 'teasing';
      setTempOverride(peek);
      if (tempTimerRef.current) clearTimeout(tempTimerRef.current);
      tempTimerRef.current = setTimeout(() => setTempOverride(null), 800);
    }
  };

  const displaySprite = tempOverride ?? localSprite;
  const src = sprites[displaySprite] ?? sprites['neutral'];

  return (
    <>
      <div className={styles.wrapper} onClick={handleClick}>
        <img src={src} alt="Pomme" className={styles.sprite} draggable={false} />
      </div>

      {dialogue && (
        <DialogueBox
          speaker={dialogue.speaker}
          text={dialogue.text}
          choices={dialogue.choices}
          onAdvance={dialogue.onAdvance}
          onDismiss={clearDialogue}
        />
      )}
    </>
  );
}