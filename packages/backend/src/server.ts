import app from './app';
import { env } from './config/env.config';
import { logger } from './shared/utils/logger.util';
import { prisma } from './config/database.config';

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connection established successfully');

    app.listen(env.port, '0.0.0.0', () => {
      logger.info(`Server is running in ${env.nodeEnv} mode on port ${env.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error as Error);
    process.exit(1);
  }
};

startServer();
