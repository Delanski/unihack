import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import PommeSprite from '../components/PommeSprite/PommeSprite';
import styles from './Todo.module.css';
import bg from '../assets/backgrounds/pomme_room.png';

import menuIcon       from '../assets/icons/homeMenu.png';
import pomodoroIcon   from '../assets/icons/pomoTimerLogo.png';
import cutsceneIcon   from '../assets/icons/dateLogo.png';
import statisticsIcon from '../assets/icons/statsLogo.png';
import settingsIcon   from '../assets/icons/settingsLogo.png';

const NAV_ITEMS = [
  { label: 'Home',       path: '/menu',       icon: menuIcon       },
  { label: 'Pomodoro',   path: '/pomodoro',   icon: pomodoroIcon   },
  { label: 'Cutscenes',  path: '/cutscenes',  icon: cutsceneIcon   },
  { label: 'Statistics', path: '/statistics', icon: statisticsIcon },
  { label: 'Settings',   path: '/settings',   icon: settingsIcon   },
];

function TodoNav() {
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

interface Task {
  id: number;
  task: string;
  isCompleted: 0 | 1;
}

export default function Todo() {
  const [tasks, setTasks]           = useState<Task[]>([]);
  const [input, setInput]           = useState('');
  const [error, setError]           = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  const [forceDialogue, setForceDialogue] = useState<any>(null);
  const [open, setOpen]             = useState(true);
  const [pos, setPos]               = useState({ x: 120, y: 0 });
  const [initialized, setInitialized] = useState(false);
  const dragging   = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!initialized) {
      setPos({ x: 120, y: window.innerHeight / 2 - 220 });
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    apiFetch('/todo/get')
      .then(res => { if (!res.ok) throw new Error('Failed to load tasks'); return res.json(); })
      .then(setTasks)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));

    setTimeout(() => {
      setForceDialogue({
        speaker: 'Pomme',
        text: "What's on the agenda?",
        choices: [
          { label: 'Add a task.', onSelect: () => {
            setForceDialogue({ speaker: 'Pomme', text: "Don't over do it.", onAdvance: () => setForceDialogue(null) });
          }},
          { label: 'Just looking.', onSelect: () => {
            setForceDialogue({ speaker: 'Pomme', text: "Glad you found something to look at besides me.", onAdvance: () => setForceDialogue(null) });
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

  const createTask = async () => {
    if (!input.trim()) return;
    setError(null);
    try {
      const res = await apiFetch('/todo/create', {
        method: 'POST',
        body: JSON.stringify({ task: input.trim() }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message ?? 'Failed to create task'); }
      const updated = await apiFetch('/todo/get').then(r => r.json());
      setTasks(updated);
      setInput('');
    } catch (err: any) { setError(err.message); }
  };

  const completeTask = async (id: number) => {
    setError(null);
    try {
      const res = await apiFetch(`/todo/complete/${id}`, { method: 'PUT' });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message ?? 'Failed to complete task'); }
      setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: 1 } : t));
    } catch (err: any) { setError(err.message); }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') createTask();
  };

  const incomplete = tasks.filter(t => t.isCompleted === 0);
  const complete   = tasks.filter(t => t.isCompleted === 1);

  return (
    <div className={styles.page}>
      <img src={bg} alt="background" className={styles.bg} />
      <div className={styles.overlay} />

      <TodoNav />

      {!open && (
        <button className={styles.reopenBtn} onClick={() => setOpen(true)}>
          ✅ To Do
        </button>
      )}

      {open && (
        <div
          className={styles.panel}
          style={{ left: pos.x, top: pos.y, transform: 'none' }}
        >
          <div className={styles.dragHandle} onMouseDown={onMouseDown}>
            <span className={styles.dragTitle}>To Do</span>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className={styles.inputRow}>
            <input
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a task..."
              maxLength={100}
            />
            <button className={styles.btn} onClick={createTask}>Add</button>
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {loading && <p className={styles.label}>Loading...</p>}

          {incomplete.length > 0 && (
            <ul className={styles.list}>
              {incomplete.map(t => (
                <li key={t.id} className={styles.taskItem}>
                  <span className={styles.taskText}>{t.task}</span>
                  <button className={styles.completeBtn} onClick={() => completeTask(t.id)}>✓</button>
                </li>
              ))}
            </ul>
          )}

          {complete.length > 0 && (
            <>
              <div className={styles.sectionRow}>
                <h2 className={styles.sectionTitle}>Completed</h2>
                <button className={styles.toggleBtn} onClick={() => setShowCompleted(s => !s)}>
                  {showCompleted ? 'Hide' : 'Show'}
                </button>
              </div>
              {showCompleted && (
                <ul className={styles.list}>
                  {complete.map(t => (
                    <li key={t.id} className={`${styles.taskItem} ${styles.done}`}>
                      <span className={styles.taskText}>{t.task}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {tasks.length === 0 && !loading && <p className={styles.label}>No tasks yet!</p>}
        </div>
      )}

      <PommeSprite
        forceDialogue={forceDialogue}
        onDialogueDone={() => setForceDialogue(null)}
      />
    </div>
  );
}