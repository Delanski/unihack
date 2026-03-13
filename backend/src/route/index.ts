import { Database } from 'sqlite';
import { Router } from 'express';

import userRoutes from './userRoutes';
import pomodoroRoutes from './pomodoroRoutes';

export function initRoutes(db: Database) {
  const routes: Record<string, Router> = {
    user: userRoutes(db),
    pomodoro: pomodoroRoutes(db)
  };

  return routes;
}
