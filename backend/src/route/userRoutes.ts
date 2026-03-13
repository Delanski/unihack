import { Router } from 'express';
import { Database } from 'sqlite';
import { withErrorHandler } from '../server';

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

    });
  });

  // update to field

  return router;
}
