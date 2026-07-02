import { PrismaClient } from '@prisma/client';
import { env } from './env.config';

export const prisma = new PrismaClient({
  log: env.nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});
