import express, { json, Response } from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import morgan from 'morgan';
import config from './config';
import { handleError } from './errors';
import { initRoutes } from './route';

async function startServer() {
  const db = null; // initDatabase();
  const routes = initRoutes(db);
  const app = express();

  expressWs(app);

  // Middleware
  app.use(json());
  app.use(cors());
  app.use(morgan('dev'));

  // Routes
  app.use('/user', routes.user);
  app.use('/pomodoro', routes.pomodoro);

  const server = app.listen(config.port, config.ip, () => {
    console.log(`Server is up and running! http://${config.ip}:${config.port}/`);
  });

  process.on('SIGINT', () => {
    console.log('\nShutting down server gracefully...');
    server.close(() => {
      console.log('🍂 Goodbye!');
      process.exit();
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