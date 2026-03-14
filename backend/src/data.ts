import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

const DB_NAME = './prayers.db';

initDatabase();

export async function openDatabase() {
  return open({
    filename: DB_NAME,
    driver: sqlite3.Database
  });
}

export async function initDatabase(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  const db = await openDatabase();

  await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(255) PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            romance_character_id VARCHAR(255),
            FOREIGN KEY (romance_character_id) references chars(id)
        );

        CREATE TABLE IF NOT EXISTS chars (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255),
            description VARCHAR(255)
        );

        CREATE TABLE IF NOT EXISTS  relationship (
            user_id VARCHAR(255),
            char_id VARCHAR(255),
            points INTEGER,
            affection_lvl INTEGER,
            PRIMARY KEY(user_id, char_id),
            FOREIGN KEY (user_id) references users(id),
            FOREIGN KEY (char_id) references chars(id)
        );

        CREATE TABLE IF NOT EXISTS pomodoro_session (
            id VARCHAR(255) PRIMARY KEY,
            user_id VARCHAR(255),
            start_time TIME,
            end_time TIME,
            pomodoro_complete INTEGER, -- default 0
            is_active INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY (user_id) references users(id)
        );
    `);

  // await db.exec(`
  //     INSERT INTO chars (id, name, description) VALUES ('place_id', 'apple', 'placeholder')
  // `)

  return db;
}
