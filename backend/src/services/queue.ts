import { logger } from "../utils/logger";
export const notificationQueue = {
  add: async (name: string, data: any) => {
    logger.info(`[Queue] ${name}`);
    return null;
  },
};
