import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

interface Task {
  id: number;
  task: string;
  isCompleted: 0 | 1;
}

export default function Todo() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // fetch tasks on mount
  useEffect(() => {
    apiFetch('/todo/get')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load tasks');
        return res.json();
      })
      .then(setTasks)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const createTask = async () => {
    if (!input.trim()) return;
    setError(null);
    try {
      const res = await apiFetch('/todo/create', {
        method: 'POST',
        body: JSON.stringify({ task: input.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Failed to create task');
      }
      // refetch so we get the real id back from db
      const updated = await apiFetch('/todo/get').then(r => r.json());
      setTasks(updated);
      setInput('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const completeTask = async (id: number) => {
    setError(null);
    try {
      const res = await apiFetch(`/todo/complete/${id}`, { method: 'PUT' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Failed to complete task');
      }
      // optimistically update UI
      setTasks(prev =>
        prev.map(t => t.id === id ? { ...t, isCompleted: 1 } : t)
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') createTask();
  };

  if (loading) return <p>Loading...</p>;

  const incomplete = tasks.filter(t => t.isCompleted === 0);
  const complete   = tasks.filter(t => t.isCompleted === 1);

  return (
    <div>
      <h1>To Do</h1>

      {/* Create task */}
      <div>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a task..."
          maxLength={100}
        />
        <button onClick={createTask}>Add</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Incomplete tasks */}
      <ul>
        {incomplete.map(t => (
          <li key={t.id}>
            <span>{t.task}</span>
            <button onClick={() => completeTask(t.id)}>Complete</button>
          </li>
        ))}
      </ul>

      {/* Completed tasks */}
      {complete.length > 0 && (
        <>
          <h2>Completed</h2>
          <ul>
            {complete.map(t => (
              <li key={t.id} style={{ textDecoration: 'line-through', opacity: 0.5 }}>
                {t.task}
              </li>
            ))}
          </ul>
        </>
      )}

      {tasks.length === 0 && <p>No tasks yet!</p>}
    </div>
  );
}