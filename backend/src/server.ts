import express, { json, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
app.use(express.json());

// Middleware
app.use(json());
app.use(cors());
app.use(morgan('dev'));
