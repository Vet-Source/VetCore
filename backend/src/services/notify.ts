import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { sendEmail } from "./email";
import { notificationQueue } from "./queue";

interface ClaimContext {
  claimId:     string;
  claimNumber: string;
  amount:      string | number;
  clinicName?: string;
  petName?:    string;
}

/**
 * Persist a Notification row, log it to the queue stub, and best-effort send an
 * email. Failures bubble up to logs but never throw — notification failures must
 * not break the underlying claim mutation.
 */
async function dispatch(opts: {
  userId:    string;
  claimId?:  string;
  type:      "EMAIL" | "SMS" | "IN_APP";
  subject:   string;
  message:   string;
  toEmail?:  string;
  template?: string;
  variables?: Record<string, string>;
}) {
  try {
    await prisma.notification.create({
      data: {
        userId:  opts.userId,
        claimId: opts.claimId,
        type:    opts.type,
        subject: opts.subject,
        message: opts.message,
        sentAt:  opts.type === "IN_APP" ? new Date() : null,
      },
    });

    await notificationQueue.add("notification", {
      userId:  opts.userId,
      claimId: opts.claimId,
      subject: opts.subject,
    });

    if (opts.type === "EMAIL" && opts.toEmail && opts.template) {
      await sendEmail({
        to:        opts.toEmail,
        subject:   opts.subject,
        template:  opts.template,
        variables: opts.variables ?? {},
      });
    }
  } catch (err) {
    logger.error("Notification dispatch failed: " + (err as Error)?.message);
  }
}

/**
 * Fan out notifications when a claim is submitted by a vet clinic.
 * - If a policy is attached, notify the insurer of that policy.
 * - Otherwise notify all active INSURER users so the claim shows up in review queues.
 */
export async function notifyClaimSubmitted(claim: ClaimContext & { policyId?: string | null }) {
  const subject = `New claim ${claim.claimNumber} requires review`;
  const message = `${claim.clinicName ?? "A clinic"} submitted a claim for ${claim.petName ?? "a pet"} totalling ${claim.amount}.`;

  let recipientUserIds: { userId: string; email: string; firstName?: string }[] = [];

  if (claim.policyId) {
    const policy = await prisma.policy.findUnique({
      where:   { id: claim.policyId },
      include: { insurer: { include: { user: { include: { profile: true } } } } },
    });
    if (policy?.insurer?.user) {
      recipientUserIds.push({
        userId:    policy.insurer.user.id,
        email:     policy.insurer.user.email,
        firstName: policy.insurer.user.profile?.firstName,
      });
    }
  }

  if (recipientUserIds.length === 0) {
    const insurers = await prisma.user.findMany({
      where:   { role: "INSURER", isActive: true },
      include: { profile: true },
    });
    recipientUserIds = insurers.map((u) => ({
      userId:    u.id,
      email:     u.email,
      firstName: u.profile?.firstName,
    }));
  }

  await Promise.all(
    recipientUserIds.flatMap((r) => [
      dispatch({
        userId:   r.userId,
        claimId:  claim.claimId,
        type:     "IN_APP",
        subject,
        message,
      }),
      dispatch({
        userId:   r.userId,
        claimId:  claim.claimId,
        type:     "EMAIL",
        subject,
        message,
        toEmail:  r.email,
        template: "claim-submitted",
        variables: {
          name:        r.firstName ?? "there",
          claimNumber: claim.claimNumber,
          clinicName:  claim.clinicName ?? "a clinic",
          reviewUrl:   `${process.env.APP_URL ?? "http://localhost:3000"}/claims/${claim.claimId}`,
        },
      }),
    ])
  );
}

/**
 * Notify the clinic and the pet owner when a claim is reviewed.
 */
export async function notifyClaimReviewed(opts: {
  claimId:     string;
  claimNumber: string;
  decision:    string;
  notes?:      string;
  clinicUserId?: string;
  petOwnerUserId?: string;
  clinicEmail?:  string;
  ownerEmail?:   string;
  clinicFirstName?: string;
  ownerFirstName?:  string;
}) {
  const subject = `Claim ${opts.claimNumber} ${opts.decision}`;
  const message = `Your claim has been ${opts.decision.toLowerCase()}.${opts.notes ? ` Notes: ${opts.notes}` : ""}`;
  const claimUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/claims/${opts.claimId}`;

  const recipients: Array<{
    userId: string; email?: string; firstName?: string;
  }> = [];
  if (opts.clinicUserId)   recipients.push({ userId: opts.clinicUserId,   email: opts.clinicEmail, firstName: opts.clinicFirstName });
  if (opts.petOwnerUserId) recipients.push({ userId: opts.petOwnerUserId, email: opts.ownerEmail,  firstName: opts.ownerFirstName });

  await Promise.all(
    recipients.flatMap((r) => [
      dispatch({
        userId:  r.userId,
        claimId: opts.claimId,
        type:    "IN_APP",
        subject,
        message,
      }),
      dispatch({
        userId:    r.userId,
        claimId:   opts.claimId,
        type:      "EMAIL",
        subject,
        message,
        toEmail:   r.email,
        template:  "claim-reviewed",
        variables: {
          name:        r.firstName ?? "there",
          claimNumber: opts.claimNumber,
          decision:    opts.decision,
          notes:       opts.notes ?? "",
          claimUrl,
        },
      }),
    ])
  );
}
