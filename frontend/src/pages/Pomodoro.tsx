
import { io, Socket } from 'socket.io-client';
import { apiFetch } from '../utils/api';
import { useState, useEffect } from 'react';

type PomodoroState = 'Studying' | 'On Break';

interface TickData {
  state: PomodoroState;
  timeRemaining: number;
  elapsedTime: number;
}

let socket: Socket | null = null;

export default function Pomodoro() {
  const [active, setActive] = useState(false);
  const [tick, setTick] = useState<TickData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // connect socket
    socket = io('http://127.0.0.1:3200', {
      extraHeaders: {
        session: localStorage.getItem('session') ?? '',
      },
    });

    socket.on('connect', () => {
      socket?.emit('pomodoro:join');
    });

    socket.on('pomodoro:tick', (data: TickData) => {
      setTick(data);
      setActive(true);
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, []);

  const start = async () => {
    setError(null);
    try {
      const res = await apiFetch('/pomodoro/start', { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Failed to start');
      }
      setActive(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const stop = async () => {
    setError(null);
    try {
      const res = await apiFetch('/pomodoro/stop', { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Failed to stop');
      }
      setActive(false);
      setTick(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatTime = (ms: number) => {
    const totalSecs = Math.max(0, Math.floor(ms / 1000));
    const mins = String(Math.floor(totalSecs / 60)).padStart(2, '0');
    const secs = String(totalSecs % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div>
      <h1>Pomodoro</h1>

      {tick && (
        <div>
          <h2>{tick.state}</h2>
          <h1>{formatTime(tick.timeRemaining)}</h1>
          <p>Elapsed: {formatTime(tick.elapsedTime)}</p>
        </div>
      )}

      {!active && !tick && <p>Ready to focus?</p>}

      <div>
        {!active ? (
          <button onClick={start}>Start</button>
        ) : (
          <button onClick={stop}>Stop</button>
        )}
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}