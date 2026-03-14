import { Database } from 'sqlite';
import { Server } from 'socket.io';

import userRoutes from './userRoutes';
import pomodoroRoutes from './pomodoroRoutes';
import toDoRoutes from './toDoRoutes';

export function initRoutes(db: Database, io: Server) {
  return {
    user: userRoutes(db),
    pomodoro: pomodoroRoutes(db, io),
    toDo: toDoRoutes(db)
  }; ;
}
