import validator from 'validator';
import bcrypt from 'bcryptjs';
import { Database } from 'sqlite';
import { nanoid } from 'nanoid';


async function authLogin(db:Database, username:string, email:string, password:string){
    const info = await db.get("SELECT * from users WHERE (email = ? OR username = ?)", [email, username]);
    if (!info){
        throw new Error ("User not found");
    }
    const isPasswordValid = await bcrypt.compare(password, info.password);
    if (!isPasswordValid) {
        throw new Error("Invalid password");
    }
    return info.id;
}

async function authRegister(db:Database, password:string, username:string, email:string){
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

async function newPassword(db:Database, id:string, oldPassword: string, newPassword:string) {
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

async function newEmail(db:Database, id:string, email:string) {
    // validate the email
    if (!validator.isEmail(email)){
        throw new Error("Invalid email address");
    }
    const emailLower = email.toLowerCase();
    await db.run("UPDATE users SET password = ? WHERE id = ?",[email,id]);
    return {};
}

async function newUsername(db:Database, username:string, id: string) {
    // get the current username
    const currUsername = await db.get("SELECT username FROM users WHERE id = ?", [id]);
    if (!currUsername) {
        throw new Error ("User not found");
    }
    // check the new username against criteria
    const usernameRegex = /^[A-Za-z0-9]+$/;
    const minUsernameLength = 3; 
    if (!usernameRegex.test(username) || username.length < minUsernameLength) {
        throw new Error(`Username must be at least ${minUsernameLength} characters and alphanumeric only.`);
    }
    const existingUsername = await db.get("SELECT username FROM users WHERE username = ?", [username]);
    if (existingUsername) {
        throw new Error("Username is already in use.");
    }
    await db.run("UPDATE users SET username = ? WHERE id = ?", [username, id])
    return {};
}