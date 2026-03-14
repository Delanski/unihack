import validator from 'validator';
import bcrypt from 'bcryptjs';
import { Database } from 'sqlite';
import { nanoid } from 'nanoid';
import { ServerError } from '../errors';
import * as Sessions from './sessions';

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

export async function deleteAccount(db: Database, userId: string, password: string) {
  const user = await db.get('SELECT id, password FROM users WHERE id = ?', [userId]);

  if (!user) throw new ServerError('INAVLID_ACCOUNT_ID', 'No account found for this id');

  if (await !bcrypt.compare(password, user.password)) throw new ServerError('INVALID_CREDENTIAL', 'Password is incorrect');

  Sessions.removeAllForUser(userId);
  await db.run('DELETE FROM users WHERE id = ?', [userId]);

  return {};
}

export async function logoutSession(sessionId?: string) {
  Sessions.returnInfo(sessionId);

  Sessions.remove(sessionId as string);

  return {};
}
