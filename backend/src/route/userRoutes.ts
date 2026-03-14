import { Router } from 'express';
import { Database } from 'sqlite';
import { withErrorHandler } from '../server';
import * as Sessions from '../service/sessions';
import * as User from '../service/auth';

export default function userRoutes(db: Database) {
  const router = Router();

  /** POST /user/register */
  router.post('/register', (req, res) => {
    withErrorHandler(res, async () => {

    });
  });

  /** POST /user/login */
  router.post('/login', (req, res) => {
    withErrorHandler(res, async () => {

    });
  });

  /** POST /user/logout */
  router.post('/logout', (req, res) => {
    withErrorHandler(res, async () => {
      const sessionId = req.header('session');

      const result = User.logoutSession(sessionId);

      res.removeHeader('session');
      res.json(result);
    });
  });

  /** POST /user/delete */
  router.post('/delete', (req, res) => {
    withErrorHandler(res, async () => {
      const sessionId = req.header('session');
      const { password } = req.body;
      const userId = Sessions.returnInfo(sessionId).userId;

      const result = await User.deleteAccount(db, userId, password);
      res.removeHeader('session');
      res.json(result);
    });
  });

  // update to field

  return router;
}
