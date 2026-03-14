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

  /** Enables on delete cascade */
  await db.exec('PRAGMA foreign_keys = ON');

  /** Initalise Tables */
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
      points INTEGER DEFAULT 0,
      affection_lvl INTEGER DEFAULT 0,
      PRIMARY KEY(user_id, char_id),
      FOREIGN KEY (user_id) references users(id) ON DELETE CASCADE,
      FOREIGN KEY (char_id) references chars(id)
    );

    CREATE TABLE IF NOT EXISTS pomodoro_session (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255),
      start_time TEXT,
      end_time TEXT,
      pomodoro_complete INTEGER, -- default 0
      is_active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) references users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS to_do (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_by VARCHAR(255),
      task VARCHAR(255),
      completed_at VARCHAR(255),
      FOREIGN KEY (created_by) references users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS scene (
      id VARCHAR(255) PRIMARY KEY,
      char_id VARCHAR(255),
      name VARCHAR(255),
      required_lvl INTEGER, -- assume all scenes have the same bg -> add background_ref VARCHAR(255) otherwise
      FOREIGN KEY (char_id) references chars(id)
    );

    CREATE TABLE IF NOT EXISTS dialogue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scene_id VARCHAR(255),
      char_name VARCHAR(255),
      dialogue VARCHAR(255),
      position INTEGER, -- relative to scene 
      sprite_ref VARCHAR(255), -- refernce to front end -> assets/sprite/sprite_ref
      FOREIGN KEY (scene_id) references scene(id),
      UNIQUE(scene_id, position)
    );
  `);

  /** Create inital character : Pomme & affection level trigger */
  await db.exec(`
    INSERT INTO chars (id, name, description) VALUES ('pomme_tutorial', 'Pomme', 'The only character in this :D') ON CONFLICT(id) DO NOTHING;

    CREATE TRIGGER IF NOT EXISTS increase_affection 
    AFTER UPDATE OF points ON relationship WHEN NEW.points >= 500
    BEGIN
      UPDATE relationship 
      SET points = NEW.points - 500,
          affection_lvl = affection_lvl + 1 
      WHERE user_id = NEW.user_id AND char_id = NEW.char_id;
    END;
  `);

  /** Initalises Scenes & Dialogue */
  /**
   * TODO: Name needs to be changed to the cutscene name
   * scene.id in order -> 1, 2, 3, 4
   */
  await db.exec(`
    INSERT INTO scene (id, char_id, name, required_lvl) VALUES ('intro_pomme', 'pomme_tutorial', 'Introduction', 0) ON CONFLICT(id) DO NOTHING;

    INSERT INTO scene (id, char_id, name, required_lvl) VALUES ('pomme_lvl1_unlock', 'pomme_tutorial', 'LEVEL 1', 1) ON CONFLICT(id) DO NOTHING;;
    INSERT INTO scene (id, char_id, name, required_lvl) VALUES ('pomme_lvl2_unlock', 'pomme_tutorial', 'LEVEL 2', 2) ON CONFLICT(id) DO NOTHING;;
    INSERT INTO scene (id, char_id, name, required_lvl) VALUES ('pomme_lvl3_unlock', 'pomme_tutorial', 'LEVEL 3', 3) ON CONFLICT(id) DO NOTHING;;
  `);

  /**
   * TODO: Add in dialogue
   *
   * -> follows this template for Introduction scene -> dialogue must be added and sprite_ref name
   * -> C + P if you need more
   * -> if user is talking just change name to 'user' and ill sort it in the dialogue function
   */
  await db.exec(`
    INSERT OR IGNORE INTO dialogue (scene_id, char_name, position, dialogue, sprite_ref) VALUES ('intro_pomme', 'Pomme', 0, '', '');
    INSERT OR IGNORE INTO dialogue (scene_id, char_name, position, dialogue, sprite_ref) VALUES ('intro_pomme', 'user', 1, '', '');
    INSERT OR IGNORE INTO dialogue (scene_id, char_name, position, dialogue, sprite_ref) VALUES ('intro_pomme', 'Pomme', 2, '', '');
    INSERT OR IGNORE INTO dialogue (scene_id, char_name, position, dialogue, sprite_ref) VALUES ('intro_pomme', 'Pomme', 3, '', '');
  `);

  return db;
}
