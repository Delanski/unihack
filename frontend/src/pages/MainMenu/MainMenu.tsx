import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PommeSprite from '../../components/PommeSprite/PommeSprite';
import styles from './MainMenu.module.css';
import bg from '../../assets/backgrounds/pomme_room.png';

import menuIcon from '../../assets/icons/homeMenu.png';
import pomodoroIcon   from '../../assets/icons/pomoTimerLogo.png';
import todoIcon       from '../../assets/icons/toDo.png';
import cutsceneIcon   from '../../assets/icons/dateLogo.png';
import statisticsIcon from '../../assets/icons/statsLogo.png';
import settingsIcon   from '../../assets/icons/settingsLogo.png';

const NAV_ITEMS = [
  { label: 'Home',       path: '/menu',       icon: menuIcon       },
  { label: 'Pomodoro',   path: '/pomodoro',   icon: pomodoroIcon   },
  { label: 'To Do',      path: '/todo',        icon: todoIcon       },
  { label: 'Cutscenes',  path: '/cutscenes',  icon: cutsceneIcon   },
  { label: 'Statistics', path: '/statistics', icon: statisticsIcon },
  { label: 'Settings',   path: '/settings',   icon: settingsIcon   },
];

function MenuNav() {
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

export default function MainMenu() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [forceDialogue, setForceDialogue] = useState<any>(null);
  const clickGroupRef = useRef(0);

  // greeting dialogue on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceDialogue({
        speaker: 'Pomme',
        text: 'Wanna study?',
        choices: [
          {
            label: 'Yes.',
            onSelect: () => {
              setForceDialogue({
                speaker: 'Pomme',
                text: 'Great! Let me get ready.',
                onAdvance: () => {
                  setForceDialogue(null);
                  navigate('/pomodoro');
                },
              });
            },
          },
          {
            label: 'No.',
            onSelect: () => {
              setForceDialogue({
                speaker: 'Pomme',
                text: 'Okay…',
                onAdvance: () => {
                  setForceDialogue({
                    speaker: 'Pomme',
                    text: 'See you later, I guess.',
                    onAdvance: () => setForceDialogue(null),
                  });
                },
              });
            },
          },
        ],
      });
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // every 5 clicks on Pomme cycle through extra dialogues
  const handleDialogueDone = () => {
    setForceDialogue(null);
  };

  const getClickGroupDialogue = () => {
    useEffect(() => {
    // preload dialogue groups
    getClickGroupDialogue();
  }, []);
    clickGroupRef.current += 1;
    const group = clickGroupRef.current % 3;

    if (group === 1) {
      // dialogue set 1
      return {
        speaker: 'Pomme',
        text: 'Wanna take a break?',
        choices: [
          { label: 'I need caffeine….', onSelect: () => {
            setForceDialogue({ speaker: 'Pomme', text: "Perfect. You're paying right?", onAdvance: () => setForceDialogue(null) });
          }},
          { label: "Let's keep studying.", onSelect: () => {
            setForceDialogue({ speaker: 'Pomme', text: "I wish I was motivated like you…", onAdvance: () => setForceDialogue(null) });
          }},
        ],
      };
    } else if (group === 2) {
      // dialogue set 2
      return {
        speaker: 'Pomme',
        text: 'Think you\'re ready to continue?',
        choices: [
          { label: 'Yes.', onSelect: () => {
            setForceDialogue({ speaker: 'Pomme', text: "Don't get distracted by me.", onAdvance: () => setForceDialogue(null) });
          }},
          { label: "I think we should call it here.", onSelect: () => {
            setForceDialogue({ speaker: 'Pomme', text: "Of course. You did a lot today.", onAdvance: () => setForceDialogue(null) });
          }},
        ],
      };
    } else {
      // dialogue set 3 — streak
      return {
        speaker: 'Pomme',
        text: 'You really are hardworking.',
        onAdvance: () => {
          setForceDialogue({
            speaker: 'Pomme',
            text: "That's what I like about you.",
            choices: [
              { label: "I'm proud of my streak.", onSelect: () => {
                setForceDialogue({ speaker: 'Pomme', text: "Be proud of yourself.", onAdvance: () =>
                  setForceDialogue({ speaker: 'Pomme', text: "I know I am.", onAdvance: () => setForceDialogue(null) })
                });
              }},
              { label: "Let's keep it up tomorrow.", onSelect: () => {
                setForceDialogue({ speaker: 'Pomme', text: "I would hate to see you lose it.", onAdvance: () => setForceDialogue(null) });
              }},
            ],
          });
        },
      };
    }
  };

  return (
    <div className={styles.page}>
      <img src={bg} alt="background" className={styles.bg} />
      <div className={styles.overlay} />

      <MenuNav />

      <div className={styles.welcome}>
        <h1 className={styles.title}>Welcome Back!</h1>
        <p className={styles.username}>{user?.username}</p>
      </div>

      <PommeSprite
        forceDialogue={forceDialogue}
        onDialogueDone={handleDialogueDone}
      />
    </div>
  );
}

