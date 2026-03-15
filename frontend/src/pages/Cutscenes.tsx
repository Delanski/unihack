import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PommeSprite from '../components/PommeSprite/PommeSprite';
import styles from './Cutscenes.module.css';
import bg from '../assets/backgrounds/pomme_room.png';

import menuIcon       from '../assets/icons/homeMenu.png';
import pomodoroIcon   from '../assets/icons/pomoTimerLogo.png';
import todoIcon       from '../assets/icons/toDo.png';
import statisticsIcon from '../assets/icons/statsLogo.png';
import settingsIcon   from '../assets/icons/settingsLogo.png';

const NAV_ITEMS = [
  { label: 'Home',       path: '/menu',       icon: menuIcon       },
  { label: 'Pomodoro',   path: '/pomodoro',   icon: pomodoroIcon   },
  { label: 'To Do',      path: '/todo',        icon: todoIcon       },
  { label: 'Statistics', path: '/statistics', icon: statisticsIcon },
  { label: 'Settings',   path: '/settings',   icon: settingsIcon   },
];

function CutscenesNav() {
  const navigate = useNavigate();
  return (
    <div className={styles.topNav}>
      {NAV_ITEMS.map(item => (
        <button key={item.path} className={styles.navBtn} onClick={() => navigate(item.path)}>
          <img src={item.icon} alt={item.label} className={styles.navIcon} />
          <span className={styles.navTooltip}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function Cutscenes() {
  const [forceDialogue, setForceDialogue] = useState<any>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);

  const dialogues = [
    {
      speaker: 'Pomme',
      text: 'Oh, so you want to go out with me?',
      choices: [
        { label: 'Um, yeah!', onSelect: () => {
          setForceDialogue({
            speaker: 'Pomme',
            text: "Ahahaha! Don't you have a test coming up?",
            onAdvance: () => setForceDialogue(null),
          });
        }},
        { label: "No? Why would you think that...", onSelect: () => {
          setForceDialogue({
            speaker: 'Pomme',
            text: "Seriously? It's not like I wanted to spend time with you or anything....",
            onAdvance: () => setForceDialogue(null),
          });
        }},
      ],
    },
    {
      speaker: 'Pomme',
      text: "I know what you're here for...",
      choices: [
        { label: "Let's go out!", onSelect: () => {
          setForceDialogue({
            speaker: 'Pomme',
            text: "The only thing going out is your grades. Out with a Bang.",
            onAdvance: () => setForceDialogue(null),
          });
        }},
        { label: "I know I should be working but...", onSelect: () => {
          setForceDialogue({
            speaker: 'Pomme',
            text: "It's okay! Just a little more work, and I know the perfect place for us!",
            onAdvance: () => setForceDialogue(null),
          });
        }},
      ],
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setForceDialogue(dialogues[0]);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleDialogueDone = () => {
    setForceDialogue(null);
    const next = (dialogueIndex + 1) % dialogues.length;
    setDialogueIndex(next);
    // trigger next dialogue after a short pause
    setTimeout(() => {
      setForceDialogue(dialogues[next]);
    }, 1200);
  };

  return (
    <div className={styles.page}>
      <img src={bg} alt="background" className={styles.bg} />
      <div className={styles.overlay} />

      <CutscenesNav />

      <div className={styles.welcome}>
        <h1 className={styles.title}>Coming Soon</h1>
        <p className={styles.subtitle}>Dates with Pomme are on their way...</p>
      </div>

      <PommeSprite
        forceDialogue={forceDialogue}
        onDialogueDone={handleDialogueDone}
        disableBuiltinDialogue={true}
      />
    </div>
  );
}