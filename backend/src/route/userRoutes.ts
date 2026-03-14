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
      const {password, email, username} = req.body;

      const result = await User.authRegister(db, password, username, email);
      res.setHeader('session', await Sessions.createNew(result));
      res.json({ userId: result });
    });
  });

  /** POST /user/login */
  router.post('/login', (req, res) => {
    withErrorHandler(res, async () => {
      const {loginForm, password} = req.body;

      const result = await User.authLogin(db, loginForm, password);
      res.setHeader('session', await Sessions.createNew(result));
      res.json({ userId: result });
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

  /** PUT /user/update/email */
  router.put('/update/email', (req, res) => {
    withErrorHandler(res, async () => {
      const sessionId = req.header('session');
      const { email } = req.body;
      const userId = Sessions.returnInfo(sessionId).userId;

      const result = await User.newEmail(db, userId, email);
      res.json(result);
    });
  });

  /** PUT /user/update/password */
  router.put('/update/password', (req, res) => {
    withErrorHandler(res, async () => {
      const sessionId = req.header('session');
      const { newPassword, oldPassword } = req.body;
      const userId = Sessions.returnInfo(sessionId).userId;

      const result = await User.newPassword(db, userId, oldPassword, newPassword);
      res.json(result);
    });
  });

  /** PUT /user/update/email */
  router.put('/update/username', (req, res) => {
    withErrorHandler(res, async () => {
      const sessionId = req.header('session');
      const { username } = req.body;
      const userId = Sessions.returnInfo(sessionId).userId;

      const result = await User.newUsername(db, username, userId);
      res.json(result);
    });
  });


  // update to field

  return router;
}
