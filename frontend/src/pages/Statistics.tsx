import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

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
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/user/statistics')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load statistics');
        return res.json();
      })
      .then(setStats)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (seconds: number) => {
    const hrs  = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  if (loading) return <p>Loading...</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;
  if (!stats)  return null;

  return (
    <div>
      <h1>{stats.username?.username}'s Statistics</h1>

      <section>
        <h2>Pomodoro</h2>
        <p>Total study time: {formatTime(stats.pomodoro.totalSeconds)}</p>
        <p>Pomodoros completed: {stats.pomodoro.studySessionsComplete}</p>
        <p>Total sessions: {stats.pomodoro.total_sessions}</p>
      </section>

      <section>
        <h2>To Do</h2>
        <p>Tasks created: {stats.toDo.totalToDoMade}</p>
        <p>Tasks completed: {stats.toDo.toDoComplete}</p>
      </section>

      {stats.relationship && (
        <section>
          <h2>Relationship</h2>
          <p>Affection level: {stats.relationship.affection_lvl}</p>
          <p>Points: {stats.relationship.points}</p>
        </section>
      )}
    </div>
  );
}