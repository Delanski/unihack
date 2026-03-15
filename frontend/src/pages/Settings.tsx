import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import PommeSprite from '../components/PommeSprite/PommeSprite';
import styles from './Settings.module.css';
import bg from '../assets/backgrounds/pomme_room.png';

import menuIcon       from '../assets/icons/homeMenu.png';
import pomodoroIcon   from '../assets/icons/pomoTimerLogo.png';
import todoIcon       from '../assets/icons/toDo.png';
import cutsceneIcon   from '../assets/icons/dateLogo.png';
import statisticsIcon from '../assets/icons/statsLogo.png';

const NAV_ITEMS = [
  { label: 'Menu',       path: '/menu',       icon: menuIcon       },
  { label: 'Pomodoro',   path: '/pomodoro',   icon: pomodoroIcon   },
  { label: 'To Do',      path: '/todo',        icon: todoIcon       },
  { label: 'Cutscenes',  path: '/cutscenes',  icon: cutsceneIcon   },
  { label: 'Statistics', path: '/statistics', icon: statisticsIcon },
];

function SettingsNav() {
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

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const [status, setStatus]         = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [forceDialogue, setForceDialogue] = useState<any>(null);
  const [open, setOpen]             = useState(true);
  const navigate                    = useNavigate();

  // drag state
  const panelRef   = useRef<HTMLDivElement>(null);
  const dragging   = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState({ x: 120, y: 0 }); // initial left position
  const [initialized, setInitialized] = useState(false);

  // set initial centered vertical position once mounted
  useEffect(() => {
    if (!initialized) {
      setPos({ x: 120, y: window.innerHeight / 2 - 200 });
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setForceDialogue({
        speaker: 'Pomme',
        text: "You wanted to let me know...?",
        choices: [
          { label: "Yes, I'm changing some details.", onSelect: () => {
            setForceDialogue({
              speaker: 'Pomme',
              text: "Okay, I'll make sure to remember that. Like you should remember your notes- Just kidding, just kidding!",
              onAdvance: () => setForceDialogue(null),
            });
          }},
          { label: "Oh, not this time.", onSelect: () => {
            setForceDialogue({
              speaker: 'Pomme',
              text: "Oh okay! Just so you know, you CAN tell me anything~",
              onAdvance: () => setForceDialogue(null),
            });
          }},
        ],
      });
    }, 800);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };
    const onMouseUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const handle = (endpoint: string, body: object, optimistic?: Partial<typeof user>) =>
    async (e: React.SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      setStatus(null);
      setError(null);
      try {
        const res = await apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(body) });
        if (!res.ok) { const err = await res.json(); throw new Error(err.message ?? 'Update failed'); }
        if (optimistic) updateUser(optimistic);
        setStatus('Updated successfully!');
      } catch (err: any) { setError(err.message); }
    };

  return (
    <div className={styles.page}>
      <img src={bg} alt="background" className={styles.bg} />
      <div className={styles.overlay} />

      <SettingsNav />

      {/* reopen button when closed */}
      {!open && (
        <button
          className={styles.reopenBtn}
          onClick={() => setOpen(true)}
        >
          ⚙ Settings
        </button>
      )}

      {open && (
        <div
          ref={panelRef}
          className={styles.panel}
          style={{ left: pos.x, top: pos.y, transform: 'none' }}
        >
          {/* drag handle */}
          <div className={styles.dragHandle} onMouseDown={onMouseDown}>
            <span className={styles.dragTitle}>Settings</span>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Username</h2>
            <form className={styles.form} onSubmit={(e) => {
              const username = (e.currentTarget.elements.namedItem('username') as HTMLInputElement).value;
              handle('/user/update/username', { username }, { username })(e);
            }}>
              <input className={styles.input} name="username" placeholder="New username" defaultValue={user?.username} required />
              <button className={styles.btn} type="submit">Save</button>
            </form>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Email</h2>
            <form className={styles.form} onSubmit={(e) => {
              const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
              handle('/user/update/email', { email }, { email })(e);
            }}>
              <input className={styles.input} name="email" type="email" placeholder="New email" defaultValue={user?.email} required />
              <button className={styles.btn} type="submit">Save</button>
            </form>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Password</h2>
            <form className={styles.formStack} onSubmit={(e) => {
              const oldPassword = (e.currentTarget.elements.namedItem('oldPassword') as HTMLInputElement).value;
              const newPassword = (e.currentTarget.elements.namedItem('newPassword') as HTMLInputElement).value;
              handle('/user/update/password', { oldPassword, newPassword })(e);
            }}>
              <input className={styles.input} name="oldPassword" type="password" placeholder="Current password" required />
              <input className={styles.input} name="newPassword" type="password" placeholder="New password" required />
              <button className={styles.btn} type="submit">Save</button>
            </form>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Account</h2>
            <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>
              Log Out
            </button>
          </div>

          {status && <p className={styles.success}>{status}</p>}
          {error  && <p className={styles.error}>{error}</p>}
        </div>
      )}

      <PommeSprite
        forceDialogue={forceDialogue}
        onDialogueDone={() => setForceDialogue(null)}
      />
    </div>
  );
}