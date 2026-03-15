import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { apiFetch } from '../../utils/api';
import PommeSprite from '../../components/PommeSprite/PommeSprite';
import TimerBar from '../../components/TimerBar/TimerBar';
import styles from './Pomodoro.module.css';
import bg from '../../assets/backgrounds/pomme_room.png';

import menuIcon       from '../../assets/icons/homeMenu.png';
import todoIcon       from '../../assets/icons/toDo.png';
import cutsceneIcon   from '../../assets/icons/dateLogo.png';
import statisticsIcon from '../../assets/icons/statsLogo.png';
import settingsIcon   from '../../assets/icons/settingsLogo.png';

const NAV_ITEMS = [
  { label: 'Menu',       path: '/menu',       icon: menuIcon       },
  { label: 'To Do',      path: '/todo',        icon: todoIcon       },
  { label: 'Cutscenes',  path: '/cutscenes',   icon: cutsceneIcon   },
  { label: 'Statistics', path: '/statistics',  icon: statisticsIcon },
  { label: 'Settings',   path: '/settings',    icon: settingsIcon   },
];


type PomodoroState = 'Studying' | 'On Break';

interface TickData {
  state: PomodoroState;
  timeRemaining: number;
  elapsedTime: number;
}

const STUDY_TIME = 25 * 60 * 1000;
const BREAK_TIME = 5  * 60 * 1000;
const TOO_LONG   = 2  * 60 * 60 * 1000;
const TOO_SHORT  = 5  * 60 * 1000;

let socket: Socket | null = null;

function PomodoroNav() {
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

export default function Pomodoro() {
  const navigate                          = useNavigate();
  const [active, setActive]               = useState(false);
  const [tick, setTick]                   = useState<TickData | null>(null);
  const [error, setError]                 = useState<string | null>(null);
  const [forceDialogue, setForceDialogue] = useState<any>(null);
  const [pommeSprite, setPommeSprite]     = useState('neutral');
  const prevState                         = useRef<PomodoroState | null>(null);
  const tooLongTimer                      = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    socket = io('http://127.0.0.1:3200', {
      extraHeaders: { session: localStorage.getItem('session') ?? '' },
    });
    socket.on('connect', () => socket?.emit('pomodoro:join'));
    socket.on('pomodoro:tick', (data: TickData) => {
      setTick(data);
      setActive(true);
      if (prevState.current === 'On Break' && data.state === 'Studying') {
        triggerScene3();
      }
      prevState.current = data.state;
    });
    return () => { socket?.disconnect(); socket = null; };
  }, []);

  const startTooLongTimer = () => {
    if (tooLongTimer.current) clearTimeout(tooLongTimer.current);
    tooLongTimer.current = setTimeout(() => {
      setPommeSprite('sad');
      setForceDialogue({
        speaker: 'Pomme',
        text: "You've been studying for a while.",
        choices: [
          { label: 'I need to finish this.', onSelect: () => {
            setPommeSprite('sad');
            setForceDialogue({ speaker: 'Pomme', text: 'If you say so...', onAdvance: () => setForceDialogue(null) });
          }},
          { label: 'I could do with a break now…', onSelect: () => {
            setPommeSprite('happy');
            setForceDialogue({ speaker: 'Pomme', text: 'A quick break will help.', onAdvance: () => setForceDialogue(null) });
          }},
        ],
      });
    }, TOO_LONG);
  };

  const start = async () => {
    setError(null);
    try {
      const res = await apiFetch('/pomodoro/start', { method: 'POST' });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      setActive(true);
      startTooLongTimer();
      setPommeSprite('neutral');
      setForceDialogue({
        speaker: 'Pomme',
        text: "I've started the timer.",
        choices: [
          { label: "Thanks. Now, don't distract me.", onSelect: () => {
            setPommeSprite('teasing');
            setForceDialogue({ speaker: 'Pomme', text: "Wouldn't dream of it.", onAdvance: () => setForceDialogue(null) });
          }},
          { label: "Actually, I changed my mind.", onSelect: () => {
            setPommeSprite('sad');
            setForceDialogue({ speaker: 'Pomme', text: "Oh…", onAdvance: () =>
              setForceDialogue({ speaker: 'Pomme', text: "That's alright.", onAdvance: () =>
                setForceDialogue({ speaker: 'Pomme', text: "Take care.", onAdvance: () => {
                  setForceDialogue(null);
                  stop(true);
                  navigate('/menu');
                }})
              })
            });
          }},
        ],
      });
    } catch (err: any) { setError(err.message); }
  };

  const stop = async (skipScene = false) => {
    if (tooLongTimer.current) clearTimeout(tooLongTimer.current);
    if (!skipScene && tick && tick.elapsedTime < TOO_SHORT) {
      setPommeSprite('teasing');
      setForceDialogue({
        speaker: 'Pomme',
        text: 'Giving up already?',
        choices: [
          { label: "Sorry, let's continue", onSelect: () => setForceDialogue(null) },
          { label: "I really can't focus today.", onSelect: async () => {
            setPommeSprite('sad');
            setForceDialogue({ speaker: 'Pomme', text: "Alright, I'll be waiting for you when you're ready.", onAdvance: async () => {
              await apiFetch('/pomodoro/stop', { method: 'POST' });
              setActive(false); setTick(null); setForceDialogue(null);
            }});
          }},
        ],
      });
      return;
    }
    await apiFetch('/pomodoro/stop', { method: 'POST' });
    setActive(false);
    setTick(null);
  };

  useEffect(() => {
    if (tick?.state === 'On Break' && prevState.current === 'Studying') {
      setPommeSprite('neutral');
      setForceDialogue({
        speaker: 'Pomme',
        text: "The timer's over.",
        onAdvance: () => {
          setPommeSprite('curious');
          setForceDialogue({
            speaker: 'Pomme',
            text: 'Wanna take a break?',
            choices: [
              { label: 'I need caffeine….', onSelect: () => {
                setPommeSprite('teasing');
                setForceDialogue({ speaker: 'Pomme', text: "Perfect. You're paying right?", onAdvance: () => setForceDialogue(null) });
              }},
              { label: "Let's keep studying.", onSelect: () => {
                setPommeSprite('curious');
                setForceDialogue({ speaker: 'Pomme', text: "I wish I was motivated like you…", onAdvance: () => setForceDialogue(null) });
              }},
            ],
          });
        },
      });
    }
  }, [tick?.state]);

  const triggerScene3 = () => {
    setPommeSprite('curious');
    setForceDialogue({
      speaker: 'Pomme',
      text: "Think you're ready to continue?",
      choices: [
        { label: 'Yes.', onSelect: () => {
          setPommeSprite('teasing');
          setForceDialogue({ speaker: 'Pomme', text: "Don't get distracted by me.", onAdvance: () => setForceDialogue(null) });
        }},
        { label: "I think we should call it here.", onSelect: async () => {
          setPommeSprite('neutral');
          const summary = tick ? `You studied for ${Math.floor(tick.elapsedTime / 60000)} minutes.` : '';
          setForceDialogue({ speaker: 'Pomme', text: `Of course. You did a lot today. ${summary}`, onAdvance: async () => {
            await apiFetch('/pomodoro/stop', { method: 'POST' });
            setActive(false); setTick(null); setForceDialogue(null);
          }});
        }},
      ],
    });
  };

  const formatTime = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  const totalTime = tick?.state === 'On Break' ? BREAK_TIME : STUDY_TIME;

  return (
    <div className={styles.page}>
      <img src={bg} alt="background" className={styles.bg} />
      <div className={styles.overlay} />

      <PomodoroNav />

      <div className={styles.timerArea}>
        {tick && (
          <>
            <h1 className={styles.time}>{formatTime(tick.timeRemaining)}</h1>
            <h2 className={styles.state}>{tick.state}</h2>
            <TimerBar
              timeRemaining={tick.timeRemaining}
              totalTime={totalTime}
              mode={tick.state === 'Studying' ? 'study' : 'break'}
            />
          </>
        )}
        {!active && <p className={styles.idle}>Ready to focus?</p>}
        <div className={styles.controls}>
          {!active
            ? <button className={styles.btn} onClick={start}>Start</button>
            : <button className={styles.btn} onClick={() => stop()}>Stop</button>
          }
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </div>

      <PommeSprite
        forceDialogue={forceDialogue}
        onDialogueDone={() => setForceDialogue(null)}
        currentSprite={pommeSprite}
      />
    </div>
  );
}