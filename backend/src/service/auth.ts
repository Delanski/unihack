import validator from 'validator';
import bcrypt from 'bcryptjs';
import { Database } from 'sqlite';
import { nanoid } from 'nanoid';
import { ServerError } from '../errors';
import * as Sessions from './sessions';

export async function authLogin(db: Database, loginForm: string, password: string) {
  const info = await db.get('SELECT * from users WHERE (email = ? OR username = ?)', [loginForm, loginForm]);// idk what to do about here
  if (!info) {
    throw new ServerError('', 'User not found');
  }
  const isPasswordValid = await bcrypt.compare(password, info.password);
  if (!isPasswordValid) {
    throw new ServerError('', 'Invalid password');
  }
  return info.id;
}

export async function authRegister(db: Database, password: string, username: string, email: string) {
  if (!validator.isEmail(email)) {
    throw new ServerError('', 'Invalid email address');
  }
  // preventing duplicate emails because of case sensitivity
  const emailLower = email.toLowerCase();
  // validate da username
  const usernameRegex = /^[A-Za-z0-9]+$/;
  const minUsernameLength = 3;
  if (!usernameRegex.test(username) || username.length < minUsernameLength) {
    throw new ServerError('', `Username must be at least ${minUsernameLength} characters and alphanumeric only.`);
  }
  // validate the password
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{9,}$/;
  if (!passwordRegex.test(password)) {
    throw new ServerError('', 'Password must be at least 9 characters, with 1 uppercase, 1 lowercase, and 1 number.');
  }
  // check to make sure the email doesnt alr exist
  const existingEmail = await db.get('SELECT email FROM users WHERE email = ?', [emailLower]);
  if (existingEmail) {
    throw new ServerError('', 'Email is already in use.');
  }
  const existingUsername = await db.get('SELECT username FROM users WHERE username = ?', [username]);
  if (existingUsername) {
    throw new ServerError('', 'Username is already in use.');
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const userId = nanoid();

  await db.run('INSERT INTO users (id, username, email, password) VALUES (?,?,?,?)', [userId, username, emailLower, hashedPassword]);
  await initalisePomme(db, userId);
  return userId;
}

export async function newPassword(db: Database, id: string, oldPassword: string, newPassword: string) {
  // get the old password from the database
  const currPassword = await db.get('SELECT password FROM users WHERE id = ?', [id]);
  const isPasswordValid = await bcrypt.compare(oldPassword, currPassword.password);
  if (!isPasswordValid) {
    throw new ServerError('', 'Invalid password');
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{9,}$/;
  if (!passwordRegex.test(newPassword)) {
    throw new ServerError('', 'Password must be at least 9 characters, with 1 uppercase, 1 lowercase, and 1 number.');
  }
  // update the password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
  return {};
}

export async function newEmail(db: Database, id: string, email: string) {
  // validate the email
  if (!validator.isEmail(email)) {
    throw new ServerError('', 'Invalid email address');
  }
  const emailLower = email.toLowerCase();
  await db.run('UPDATE users SET email = ? WHERE id = ?', [emailLower, id]);
  return {};
}

export async function newUsername(db: Database, username: string, id: string) {
  // get the current username
  const currUsername = await db.get('SELECT username FROM users WHERE id = ?', [id]);
  if (!currUsername) {
    throw new ServerError('', 'User not found');
  }

  const usernameRegex = /^[A-Za-z0-9]+$/;
  const minUsernameLength = 3;
  if (!usernameRegex.test(username) || username.length < minUsernameLength) {
    throw new ServerError('', `Username must be at least ${minUsernameLength} characters and alphanumeric only.`);
  }
  const existingUsername = await db.get('SELECT username FROM users WHERE username = ? AND id != ?', [username, id]);
  if (existingUsername) {
    throw new ServerError('', 'Username is already in use.');
  }
  await db.run('UPDATE users SET username = ? WHERE id = ?', [username, id]);
  return {};
}

export async function getUserStatistics(db: Database, userId: string) {
  const pomodoro = await db.get(`
    SELECT 
      IFNULL(SUM(strftime('%s', end_time) - strftime('%s', start_time)),0) AS totalSeconds,
      IFNULL(SUM(pomodoro_complete),0) AS studySessionsComplete, -- 25 mins
      COUNT(*) AS total_sessions -- overall
    FROM pomodoro_session WHERE user_id = ? AND end_time IS NOT NULL
  `, [userId]);

  const todo = await db.get(`
    SELECT
      COUNT(*) as totalToDoMade,
      SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) as toDoComplete
    FROM to_do WHERE created_by = ?
  `, [userId]);

  const relationship = await db.get(`
    SELECT
      affection_lvl, points
    FROM relationship
    WHERE char_id = (SELECT romance_character_id FROM users WHERE id = ?)
    AND user_id = ?
  `, [userId, userId]);

  const username = await db.get('SELECT username FROM users WHERE id = ?', [userId]);

  return { username: username, pomodoro: pomodoro, toDo: todo, relationship: relationship };
}

export async function deleteAccount(db: Database, userId: string, password: string) {
  const user = await db.get('SELECT id, password FROM users WHERE id = ?', [userId]);

  if (!user) throw new ServerError('INAVLID_ACCOUNT_ID', 'No account found for this id');

  if (!(await bcrypt.compare(password, user.password))) throw new ServerError('INVALID_CREDENTIAL', 'Password is incorrect');

  Sessions.removeAllForUser(userId);
  await db.run('DELETE FROM users WHERE id = ?', [userId]);

  return {};
}

export async function logoutSession(sessionId?: string) {
  Sessions.returnInfo(sessionId);

  Sessions.remove(sessionId as string);

  return {};
}

async function initalisePomme(db: Database, userId: string) {
  await db.run('INSERT INTO relationship (user_id, char_id) VALUES (?, \'pomme_tutorial\')', [userId]);
  await db.run('UPDATE users SET romance_character_id = \'pomme_tutorial\' WHERE id = ?', [userId]);
  // set to lvl 1 automatically
  // await db.run(`UPDATE relationship SET points = 500 WHERE user_id = ? AND char_id = 'pomme_tutorial'`, [userId])
}
