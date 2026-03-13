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
            id STRING PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            romance_character_id STRING,
            total_study TIME DEFAULT 0,
            FOREIGN KEY (romance_character_id) references chars(id)
        );

        CREATE TABLE IF NOT EXISTS chars (
            id STRING PRIMARY KEY,
            name VARCHAR(255),
            description VARCHAR(255)
        );

        CREATE TABLE IF NOT EXISTS  relationship (
            user_id STRING,
            char_id STRING,
            points INTEGER,
            affection_lvl INTEGER,
            PRIMARY KEY(user_id, char_id),
            FOREIGN KEY (user_id) references users(id),
            FOREIGN KEY (char_id) references chars(id)
        );

        CREATE TABLE IF NOT EXISTS  pomodoro_session (
            id STRING PRIMARY KEY,
            user_id STRING,
            start_time TIME,
            end_time TIME,
            pomodoro_complete INTEGER, -- default 0
            state VARCHAR(255), -- work, break, long break - deafult 25, 5, 15 - complete
            FOREIGN KEY (user_id) references users(id)
        );

        CREATE TABLE IF NOT EXISTS  timers (
            timer_id STRING PRIMARY KEY, -- i think it is idk
            user_id STRING,
            FOREIGN KEY (user_id) references users(id)
        );
    `)

    await db.exec(`
        INSERT INTO chars (id, name, description) VALUES ('place_id', 'apple', 'placeholder')
    `)

    return db;
}