import validator from 'validator';
import bcrypt from 'bcryptjs';
import { Database } from 'sqlite';
import { nanoid } from 'nanoid';
import { ServerError } from '../errors';
import * as Sessions from './sessions';

export async function authLogin(db:Database, loginForm:string, password:string){
    const info = await db.get("SELECT * from users WHERE (email = ? OR username = ?)", [loginForm, loginForm]);//idk what to do about here 
    if (!info){
        throw new Error ("User not found");
    }
    const isPasswordValid = await bcrypt.compare(password, info.password);
    if (!isPasswordValid) {
        throw new Error("Invalid password");
    }
    return info.id;
}

export async function authRegister(db:Database, password:string, username:string, email:string){
    if (!validator.isEmail(email)){
        throw new Error("Invalid email address");
    }
    // preventing duplicate emails because of case sensitivity
    const emailLower = email.toLowerCase(); 
    // validate da username
    const usernameRegex = /^[A-Za-z0-9]+$/;
    const minUsernameLength = 3; 
    if (!usernameRegex.test(username) || username.length < minUsernameLength) {
        throw new Error(`Username must be at least ${minUsernameLength} characters and alphanumeric only.`);
    }
    // validate the password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{9,}$/;
    if (!passwordRegex.test(password)) {
        throw new Error("Password must be at least 9 characters, with 1 uppercase, 1 lowercase, and 1 number.");
    }
    // check to make sure the email doesnt alr exist
    const existingEmail = await db.get("SELECT email FROM users WHERE email = ?", [emailLower]);
    if (existingEmail) {
        throw new Error("Email is already in use.");
    }
    const existingUsername = await db.get("SELECT username FROM users WHERE username = ?", [username]);
    if (existingUsername) {
        throw new Error("Username is already in use.");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = nanoid();

    await db.run("INSERT INTO users (id, username, email, password) VALUES (?,?,?,?)", [userId, username, emailLower, hashedPassword])
    return userId;
}

export async function newPassword(db:Database, id:string, oldPassword: string, newPassword:string) {
   // get the old password from the database
    const currPassword = await db.get("SELECT password FROM users WHERE id = ?", [id]);
    const isPasswordValid = await bcrypt.compare(oldPassword, currPassword.password);
    if (!isPasswordValid) {
        throw new Error("Invalid password");
    }
 
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{9,}$/;
    if (!passwordRegex.test(newPassword)) {
        throw new Error("Password must be at least 9 characters, with 1 uppercase, 1 lowercase, and 1 number.");
    }
   //update the password 
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.run("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, id]);
    return {};
}

export async function newEmail(db:Database, id:string, email:string) {
    // validate the email
    if (!validator.isEmail(email)){
        throw new Error("Invalid email address");
    }
    const emailLower = email.toLowerCase();
    await db.run("UPDATE users SET password = ? WHERE id = ?",[email,id]);
    return {};
}

export async function newUsername(db:Database, username:string, id: string) {
    // get the current username
    const currUsername = await db.get("SELECT username FROM users WHERE id = ?", [id]);
    if (!currUsername) {
        throw new Error ("User not found");
    }
 
    const usernameRegex = /^[A-Za-z0-9]+$/;
    const minUsernameLength = 3; 
    if (!usernameRegex.test(username) || username.length < minUsernameLength) {
        throw new Error(`Username must be at least ${minUsernameLength} characters and alphanumeric only.`);
    }
    const existingUsername = await db.get("SELECT username FROM users WHERE username = ?", [username]);
    if (existingUsername) {
        throw new Error("Username is already in use.");
    }
    await db.run("UPDATE users SET username = ? WHERE id = ?", [username, id]);
    return {};
}
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
