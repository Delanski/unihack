import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

const DB_NAME = "./prayers.db"

initDatabase();

export async function openDatabase() {
    return open({
        filename: DB_NAME,
        driver: sqlite3.Database
    })
}

export async function initDatabase(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
    const db = await openDatabase();

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            romance_character_id INTEGER,
            total_study TIME DEFAULT 0,
            FOREIGN KEY (romance_character_id) references chars(id)
        );

        CREATE TABLE IF NOT EXISTS chars (
            id INTEGER PRIMARY KEY,
            name TEXT,
            description TEXT
        );

        CREATE TABLE IF NOT EXISTS  relationship (
            user_id INTEGER,
            char_id INTEGER,
            points INTEGER,
            affection_lvl INTEGER,
            PRIMARY KEY(user_id, char_id),
            FOREIGN KEY (user_id) references users(id),
            FOREIGN KEY (char_id) references chars(id)
        );

        CREATE TABLE IF NOT EXISTS  pomodoro_session (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            start_time TIME,
            end_time TIME,
            pomodoro_complete INTEGER, -- default 0
            state TEXT, -- work, break, long break - deafult 25, 5, 15 - complete
            FOREIGN KEY (user_id) references users(id)
        );

        CREATE TABLE IF NOT EXISTS  timers (
            timer_id INTEGER PRIMARY KEY, -- i think it is idk
            user_id INTEGER,
            FOREIGN KEY (user_id) references users(id)
        );
    `)

    await db.exec(`
        INSERT INTO chars (id, name, description) VALUES (1, 'apple', 'placeholder')
    `)

    return db;
}