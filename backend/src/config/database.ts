import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

// Don't crash the process if the database is unreachable at boot — log it and
// let individual routes surface the error. This means /health still works even
// if Postgres isn't up yet, which is friendlier for local dev and CI.
prisma
  .$connect()
  .then(() => logger.info('Database connected'))
  .catch((err) => {
    logger.error('Database connection failed (server will keep running): ' + (err?.message ?? err));
  });
