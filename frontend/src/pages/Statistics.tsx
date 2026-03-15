import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import PommeSprite from '../components/PommeSprite/PommeSprite';
import styles from './Statistics.module.css';
import bg from '../assets/backgrounds/pomme_room.png';

import menuIcon       from '../assets/icons/homeMenu.png';
import pomodoroIcon   from '../assets/icons/pomoTimerLogo.png';
import todoIcon       from '../assets/icons/toDo.png';
import cutsceneIcon   from '../assets/icons/dateLogo.png';
import settingsIcon   from '../assets/icons/settingsLogo.png';

const NAV_ITEMS = [
  { label: 'Home',       path: '/menu',       icon: menuIcon       },
  { label: 'Pomodoro',   path: '/pomodoro',   icon: pomodoroIcon   },
  { label: 'To Do',      path: '/todo',        icon: todoIcon       },
  { label: 'Cutscenes',  path: '/cutscenes',  icon: cutsceneIcon   },
  { label: 'Settings',   path: '/settings',   icon: settingsIcon   },
];

function StatsNav() {
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

interface Stats {
  username: { username: string };
  pomodoro: {
    totalSeconds: number;
    studySessionsComplete: number;
    total_sessions: number;
  };
  toDo: {
    totalToDoMade: number;
    toDoComplete: number;
  };
  relationship: {
    affection_lvl: number;
    points: number;
  } | null;
}

export default function Statistics() {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [forceDialogue, setForceDialogue] = useState<any>(null);
  const [open, setOpen]       = useState(true);
  const [pos, setPos]         = useState({ x: 120, y: 0 });
  const [initialized, setInitialized] = useState(false);
  const dragging   = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!initialized) {
      setPos({ x: 120, y: window.innerHeight / 2 - 200 });
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    apiFetch('/user/statistics')
      .then(res => { if (!res.ok) throw new Error('Failed to load statistics'); return res.json(); })
      .then(setStats)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));

    setTimeout(() => {
      setForceDialogue({
        speaker: 'Pomme',
        text: "What's on your mind?",
        choices: [
          { label: "Write about today's progress.", onSelect: () => {
            setForceDialogue({ speaker: 'Pomme', text: "Will you include me too?", onAdvance: () => setForceDialogue(null) });
          }},
          { label: "Write about how I'm feeling.", onSelect: () => {
            setForceDialogue({ speaker: 'Pomme', text: "That's good. Reflecting is a good way of tracking.", onAdvance: () => setForceDialogue(null) });
          }},
        ],
      });
    }, 800);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const onMouseUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const hrs  = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className={styles.page}>
      <img src={bg} alt="background" className={styles.bg} />
      <div className={styles.overlay} />

      <StatsNav />

      {!open && (
        <button className={styles.reopenBtn} onClick={() => setOpen(true)}>
          📊 Statistics
        </button>
      )}

      {open && (
        <div
          className={styles.panel}
          style={{ left: pos.x, top: pos.y, transform: 'none' }}
        >
          <div className={styles.dragHandle} onMouseDown={onMouseDown}>
            <span className={styles.dragTitle}>
              {loading ? 'Statistics' : `${stats?.username?.username}'s Stats`}
            </span>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {loading && <p className={styles.label}>Loading...</p>}

          {!loading && stats && (
            <>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>🍅 Pomodoro</h2>
                <div className={styles.statRow}>
                  <span>Study time</span>
                  <span className={styles.statVal}>{formatTime(stats.pomodoro.totalSeconds)}</span>
                </div>
                <div className={styles.statRow}>
                  <span>Pomodoros done</span>
                  <span className={styles.statVal}>{stats.pomodoro.studySessionsComplete}</span>
                </div>
                <div className={styles.statRow}>
                  <span>Total sessions</span>
                  <span className={styles.statVal}>{stats.pomodoro.total_sessions}</span>
                </div>
              </div>

              <div className={styles.card}>
                <h2 className={styles.cardTitle}>✅ To Do</h2>
                <div className={styles.statRow}>
                  <span>Tasks created</span>
                  <span className={styles.statVal}>{stats.toDo.totalToDoMade}</span>
                </div>
                <div className={styles.statRow}>
                  <span>Tasks completed</span>
                  <span className={styles.statVal}>{stats.toDo.toDoComplete}</span>
                </div>
              </div>

              {stats.relationship && (
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>🍎 Relationship</h2>
                  <div className={styles.statRow}>
                    <span>Affection level</span>
                    <span className={styles.statVal}>{stats.relationship.affection_lvl}</span>
                  </div>
                  <div className={styles.statRow}>
                    <span>Points</span>
                    <span className={styles.statVal}>{stats.relationship.points}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <PommeSprite
        forceDialogue={forceDialogue}
        onDialogueDone={() => setForceDialogue(null)}
      />
    </div>
  );
}