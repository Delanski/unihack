import { Router } from 'express';
import { Database } from 'sqlite';
import { withErrorHandler } from '../server';
import * as Sessions from '../service/sessions';
import * as Scene from '../service/scene';

export default function sceneRoutes(db: Database) {
  const router = Router();

  /** GET /scene */
  router.get('/', (req, res) => {
    withErrorHandler(res, async () => {
      const sessionId = req.header('session');
      const userId = Sessions.returnInfo(sessionId).userId;

      const reuslt = await Scene.getCharacterScenes(db, userId);
      res.json(reuslt);
    });
  });

  /** GET /scene/:sceneId/dialogue */
  router.get('/:sceneId/dialogue', (req, res) => {
    withErrorHandler(res, async () => {
      const sceneId = req.params.sceneId as string;
      const sessionId = req.header('session');
      const userId = Sessions.returnInfo(sessionId).userId;

      const result = await Scene.getSceneDialogue(db, userId, sceneId);
      res.json(result);
    });
  });

  /** GET /scene/:sceneId */
  router.get('/:sceneId', (req, res) => {
    withErrorHandler(res, async () => {
      const sceneId = req.params.sceneId as string;
      const sessionId = req.header('session');
      const userId = Sessions.returnInfo(sessionId).userId;

      const result = await Scene.getScene(db, userId, sceneId);
      res.json(result);
    });
  });

  return router;
}
