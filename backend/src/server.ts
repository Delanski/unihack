import express, { json, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';

import config from './config';
import { handleError } from './errors';
import { initRoutes } from './route';
import { initDatabase } from './data';
import * as Sessions from './service/sessions';
import { cleanupPomodoroSessions } from './route/pomodoroRoutes';

async function startServer() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  const db = await initDatabase();
  const routes = initRoutes(db, io);

  // Middleware
  app.use(json());
  app.use(cors());
  app.use(morgan('dev'));

  // Routes
  app.use('/user', routes.user);
  app.use('/pomodoro', routes.pomodoro);
  app.use('/todo', routes.toDo);
  app.use('/scene', routes.scene);

  // Socket auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.headers.session as string | undefined;
      const sessionInfo = Sessions.returnInfo(token);
      socket.data.userId = sessionInfo.userId;
      next();
    } catch (err) {
      console.log(err);
      next(new Error('session is wrong or empty :)'));
    }
  });

  io.on('connection', (socket) => {
    console.log(socket.id);

    socket.on('pomodoro:join', () => {
      socket.join(`pomodoro:${socket.data.userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Disconnected: ${socket.id}`);
    });
  });

  server.listen(config.port, config.ip, () => {
    console.log(`Server is up and running! http://${config.ip}:${config.port}/`);
  });

  process.on('SIGINT', () => {
    console.log('\nShutting down server gracefully...');

    cleanupPomodoroSessions();

    server.close(() => {
      console.log('🍂 Goodbye!');
      process.exit();
    });

    io.close(() => {
      console.log('socket io ded');
    });
  });
}

export async function withErrorHandler<T>(res: Response, callback: () => T) {
  try {
    await callback();
  } catch (err) {
    handleError(res, err);
  }
}

startServer();
