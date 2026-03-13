import { Router } from 'express';
import { Database } from 'sqlite';
import { withErrorHandler } from '../server';
import { Pomodoro } from '../service/pomodoro';
import { Server } from 'socket.io';
import { ServerError } from '../errors';

const activeSessions = new Map<string, Pomodoro>();

// using ws for real time update
export default function pomodoroRoutes(db: Database, io: Server) {
  const router = Router();

  // update to field
  router.post('/start', (req, res) => {
    withErrorHandler(res, async () => {
      const userId = req.body.userId;

      const session = await Pomodoro.create(db, io, userId, () => {
        activeSessions.delete(userId)
      })

      activeSessions.set(userId, session);
      res.status(200).json({});
    })
  })

  router.post('/stop', (req, res) => {
    withErrorHandler(res, async () => {
      const userId = req.body.userId;
      const session = activeSessions.get(userId);

      if (!session) throw new ServerError('NO_POMO', 'No active session');

      await session.deletePomo();
      activeSessions.delete(userId);
      res.status(200).json({});
    })
  })

  return router;
}
