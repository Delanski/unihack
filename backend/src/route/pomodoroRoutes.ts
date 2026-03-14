import { Router } from 'express';
import { Database } from 'sqlite';
import { withErrorHandler } from '../server';
import { Pomodoro } from '../service/pomodoro';
import { Server } from 'socket.io';
import { ServerError } from '../errors';
import * as Sessions from '../service/sessions';

const activeSessions = new Map<string, Pomodoro>();

// using ws for real time update
export default function pomodoroRoutes(db: Database, io: Server) {
  const router = Router();

  // update to field
  router.post('/start', (req, res) => {
    withErrorHandler(res, async () => {
      const sessionId = req.header('session');
      const userId = Sessions.returnInfo(sessionId).userId;

      const session = await Pomodoro.create(db, io, userId, () => {
        activeSessions.delete(userId);
      });

      activeSessions.set(userId, session);
      res.status(200).json({});
    });
  });

  router.post('/stop', (req, res) => {
    withErrorHandler(res, async () => {
      const sessionId = req.header('session');
      const userId = Sessions.returnInfo(sessionId).userId;
      const pomoSession = activeSessions.get(userId);

      if (!pomoSession) throw new ServerError('NO_POMO', 'No active session');

      await pomoSession.deletePomo();
      activeSessions.delete(userId);
      res.status(200).json({});
    });
  });

  return router;
}
