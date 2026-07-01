import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './features/auth/auth.routes';
import categoriesRoutes from './features/categories/categories.routes';
import productsRoutes from './features/products/products.routes';
import settingsRoutes from './features/settings/settings.routes';
import transactionsRoutes from './features/transactions/transactions.routes';
import reportsRoutes from './features/reports/reports.routes';
import customersRoutes from './features/customers/customers.routes';
import publicRoutes from './features/public/public.routes';
import usersRoutes from './features/users/users.routes';
import tablesRoutes from './features/tables/tables.routes';
import { errorHandler } from './shared/middleware/error-handler.middleware';
import { logger } from './shared/utils/logger.util';

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/customer', customersRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/tables', tablesRoutes);

// Base route
app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

// Error handling middleware
app.use(errorHandler);

export default app;
