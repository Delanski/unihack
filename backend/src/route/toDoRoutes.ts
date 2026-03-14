import { Router } from 'express';
import { Database } from 'sqlite';
import { withErrorHandler } from '../server';
import * as Sessions from '../service/sessions';
import * as ToDos from '../service/todolist';

export default function toDoRoutes(db: Database) {
  const router = Router();

  /** POST /todo/create */
  router.post('/create', (req, res) => {
    withErrorHandler(res, async () => {
      const sessionId = req.header('session');
      const { task } = req.body;
      const userId = Sessions.returnInfo(sessionId).userId;

      const result = await ToDos.createTask(db, userId, task);
      res.json(result);
    });
  });

  /** PUT /todo/complete/:id */
  router.put('/complete/:id', (req, res) => {
    withErrorHandler(res, async () => {
      const sessionId = req.header('session');
      const id = parseInt(req.params.id);
      const userId = Sessions.returnInfo(sessionId).userId;

      const result = await ToDos.completeTask(db, userId, id);
      res.json(result);
    });
  });

  /** GET /todo/get */
  router.get('/get', (req, res) => {
    withErrorHandler(res, async () => {
      const sessionId = req.header('session');
      const userId = Sessions.returnInfo(sessionId).userId;

      const result = await ToDos.getLast20Tasks(db, userId);
      res.json(result);
    });
  });

  return router;
}
