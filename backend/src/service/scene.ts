import { Database } from 'sqlite';
import { ServerError } from '../errors';

/**
 * Will return an object in order of intro -> lvl1 -> lvl 2 -> lvl 3
 * scene: {
 *   id: integer,
 *   sceneName: string,
 *   unlocked: boolean,
 *   requiredLvl: integer
 * } []
 *
 * -> will not show scenes with character that dont have relationship set but we only have
 * one so lowk does not matter
 */
export async function getCharacterScenes(db: Database, userId: string) {
  const info = await db.all(`
    SELECT
      s.id,
      s.name as sceneName,
      s.required_lvl as requiredLvl,
      CASE WHEN r.affection_lvl >= s.required_lvl THEN 1 ELSE 0 END as unlocked
    FROM users u
    JOIN relationship r ON r.char_id = u.romance_character_id AND r.user_id = u.id
    JOIN scene s ON s.char_id = u.romance_character_id
    WHERE r.user_id = ?
    ORDER BY s.required_lvl ASC
  `, [userId]);

  return { scenes: info };
}

/**
 * This version will return all dialogue in an obj arr
 *
 * dialogue: {
 *   speaker: string, --> Pomme or user's username
 *   dialogue: string,
 *   sprite_ref: string --> contains only the last part : assets/sprite/sprite_ref
 * } []
 *
 */
export async function getSceneDialogue(db: Database, userId: string, sceneId: string) {
  const { username } = await db.get('SELECT username FROM users WHERE id = ?', [userId]);
  const dialogue = await db.all(`
    SELECT
      CASE WHEN d.char_name = 'user' THEN ? ELSE d.char_name END as speaker,
      d.dialogue,
      d.sprite_ref
    FROM dialogue d WHERE scene_id = ? ORDER BY d.position
  `, [username, sceneId]);

  if (!dialogue || dialogue.length === 0) throw new ServerError('', 'scene id is wrong');

  return { dialogue };
}

/**
 * scene: {
 *    sceneName: string,
 *    unlocked: boolean
 * }
 */
export async function getScene(db: Database, userId: string, sceneId: string) {
  const scene = await db.get(`
    SELECT
      s.name as sceneName,
      CASE WHEN r.affection_lvl >= s.required_lvl THEN 1 ELSE 0 END as unlocked
    FROM users u
    JOIN relationship r ON r.char_id = u.romance_character_id AND r.user_id = u.id
    JOIN scene s ON s.char_id = u.romance_character_id
    WHERE r.user_id = ? and s.id = ?
  `, [userId, sceneId]);

  if (!scene) throw new ServerError('', 'scene id is wrong');

  return { scene };
}

/**
 * This version will return dialogue one by one
 *
 * {
 *   speaker: string, --> Pomme or user's username
 *   dialogue: string
 *   sprite_ref: string --> contains only the last part : assets/sprite/sprite_ref
 * }
 *
 */
// NOTE: lineIndex is given by the front end WORKS ON ARRAY INDEXING NOT DB, i.e. 0,1,2,3
// export async function getSceneDialogue(db: Database, userId: string, sceneId: number, lineIndex: number) {
//   const { username } = await db.get(`SELECT username FROM users WHERE id = ?`, [userId]);
//   const line = await db.get(`
//     SELECT
//       CASE WHEN d.char_name = 'user' THEN ? ELSE d.char_name END as speaker,
//       d.dialogue,
//       d.sprite_ref
//     FROM dialogue d WHERE d.scene_id = ? ORDER BY d.position LIMIT 1 OFFSET ?
//   `, [username, sceneId, lineIndex]);

//   // will return undefined when end of scene

//   return { line };
// }
