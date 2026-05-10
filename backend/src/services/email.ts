import sgMail from '@sendgrid/mail';
import { logger } from '../utils/logger';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  variables: Record<string, string>;
}

// Simple inline templates for MVP
const templates: Record<string, (vars: Record<string, string>) => string> = {
  'claim-submitted': (v) => `
    <h2>New Claim Requires Review</h2>
    <p>Hi ${v.name},</p>
    <p>A new insurance claim <strong>${v.claimNumber}</strong> has been submitted by <strong>${v.clinicName}</strong> and requires your review.</p>
    <a href="${v.reviewUrl}" style="background:#0066CC;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;margin:16px 0">Review Claim</a>
    <p>The VET-SOURCE Team</p>
  `,
  'claim-reviewed': (v) => `
    <h2>Claim ${v.decision === 'APPROVED' ? '✓ Approved' : '✗ Rejected'}</h2>
    <p>Hi ${v.name},</p>
    <p>Claim <strong>${v.claimNumber}</strong> has been <strong>${v.decision}</strong>.</p>
    ${v.notes ? `<p><strong>Notes:</strong> ${v.notes}</p>` : ''}
    <a href="${v.claimUrl}" style="background:#0066CC;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;margin:16px 0">View Claim</a>
    <p>The VET-SOURCE Team</p>
  `,
};

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const html = templates[options.template]?.(options.variables) || options.variables.message || '';
    
    await sgMail.send({
      to: options.to,
      from: process.env.FROM_EMAIL || 'noreply@vetsource.io',
      subject: options.subject,
      html,
    });

    logger.info(`Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    logger.error(`Failed to send email to ${options.to}:`, error);
    // Don't throw — notification failure shouldn't break the main flow
  }
}
