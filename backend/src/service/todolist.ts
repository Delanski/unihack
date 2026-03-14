import { Database } from 'sqlite';
import { ServerError } from '../errors';

const toDoLimit = 15;
const dailyRewardedToDo = 3;
const pointsAwarded = 50;

export async function createTask(db: Database, userId: string, task: string) {
  const { count } = await db.get('SELECT COUNT(*) as count FROM to_do WHERE created_by = ?', [userId]);
  if (count >= toDoLimit) throw new ServerError('', 'Todo limit reached');

  await db.run('INSERT INTO to_do (created_by, task) VALUES (?, ?)', [userId, task]);

  return {};
}

export async function getLast20Tasks(db: Database, userId: string) {
  const res = await db.all(`
        SELECT
            id,
            task,
            CASE
                WHEN completed_at IS NULL THEN 0
                ELSE 1
            END AS isCompleted
        FROM to_do WHERE created_by = ?
        ORDER BY isCompleted ASC, id ASC LIMIT 20
    `, [userId]);

  return res;
}

export async function completeTask(db: Database, userId: string, id: number) {
  const info = await db.get('SELECT id, completed_at FROM to_do WHERE id = ?', [id]);
  if (!info) throw new ServerError('', 'Task no exist');
  if (info.completed_at) throw new ServerError('', 'Task already done');

  const { count } = await db.get('SELECT count(*) as count FROM to_do WHERE created_by = ? AND completed_at = date(\'now\')', [userId]);
  const points = count < dailyRewardedToDo ? pointsAwarded : 0;

  await db.run('UPDATE to_do SET completed_at = date(\'now\') WHERE id = ?', [id]);

  await db.run(`
    UPDATE relationship SET points = points + ?
    WHERE char_id = (SELECT romance_character_id FROM users WHERE id = ?)
    AND user_id = ?
  `, [points, userId, userId]);

  return {};
}
