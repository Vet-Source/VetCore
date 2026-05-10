import twilio from 'twilio';
import { logger } from '../utils/logger';

// Lazy client construction so a missing/placeholder TWILIO_ACCOUNT_SID at boot
// doesn't blow up the app (twilio() validates SID format eagerly).
let client: ReturnType<typeof twilio> | null = null;
function getClient() {
  if (client) return client;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token || !sid.startsWith('AC')) {
    return null;
  }
  client = twilio(sid, token);
  return client;
}

export async function sendSMS(to: string, message: string): Promise<void> {
  const c = getClient();
  if (!c) {
    logger.warn(`SMS not sent (Twilio not configured): ${to} -> ${message.slice(0, 40)}`);
    return;
  }
  try {
    await c.messages.create({ to, from: process.env.TWILIO_PHONE_NUMBER!, body: message });
    logger.info(`SMS sent to ${to}`);
  } catch (error) {
    logger.error(`Failed to send SMS to ${to}: ${(error as Error)?.message}`);
  }
}
