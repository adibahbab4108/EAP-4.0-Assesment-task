import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from './config/config';
import { errorHandler } from './middleware/error.middleware';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import projectRoutes from './modules/projects/projects.routes';
import taskRoutes from './modules/tasks/tasks.routes';
import userRoutes from './modules/users/users.routes';
import notificationRoutes from './modules/notifications/notifications.routes';
import logRoutes from './modules/logs/logs.routes';

const app = express();

// Middlewares
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/logs', logRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
