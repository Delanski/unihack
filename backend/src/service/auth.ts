import validator from 'validator';
import bcrypt from 'bcryptjs';
import { Database } from 'sqlite';
import { nanoid } from 'nanoid';

// time in pomodoroTimer
async function getTotalTime(userId: string, db: Database) {
  const time = await db.get(`
    SELECT 
      SUM(strftime('%s', end_time) - strftime('%s', start_time)) AS total_seconds,
      SUM(pomodoro_complete) * 25 AS total_mins_studied,
      COUNT(*) AS total_sessions
    FROM pomodoro_session WHERE user_id = ? AND end_time IS NOT NULL
  `, [userId]);

  // returns OBJ 
  /**
   * {
   *    total_seconds
   *    total_min_studied
   *    total_sessions
   * } 
   */
}