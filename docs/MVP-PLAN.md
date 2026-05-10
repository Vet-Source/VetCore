# VET-SOURCE — MVP Gap Analysis & Build Plan

This plan reconciles the [Functional Requirements Document v2](../Functional%20Requirements%20Document%20ver2.pdf) against the current state of the codebase. It is the canonical reference for what is left before the FRD's stated MVP (§5.1) can be declared complete.

## 1. FRD-defined MVP scope

> §5.1 — *Initial launch with cloud-based infrastructure. Core functionalities: claim submission, smart contract validation, and notifications.*

Three things must be true for MVP to be achieved:

| # | Requirement | Status |
|---|---|---|
| 1 | Claim submission | Done |
| 2 | Smart contract validation | **Not built — single biggest gap** |
| 3 | Notifications | Done |

## 2. What is already in place

### Auth & RBAC (§3.1)
- All five roles (`VET_CLINIC`, `INSURER`, `PET_OWNER`, `REGULATOR`, `ADMIN`) modelled in Prisma with relations.
- `authenticate` and `authorize(roles)` middleware enforce access on every protected route.
- Login + register UI in Next.js for the three self-service roles. Regulator and Admin must be created directly in the database.

### Claim lifecycle (§3.2)
- `POST /api/claims` accepts a submission from a vet clinic, generates a `claimNumber` (cuid), persists with status `SUBMITTED`.
- `POST /api/claims/:id/review` updates status, persists a `ClaimReview`, validates the decision against the allowed enum subset.
- `GET /api/claims` is role-scoped: clinics see their own, owners see their pets', insurers see policy-matched + unassigned, regulators/admin see all.
- Frontend `/claims/new` uses react-hook-form + zod with multi-step UX.

### Notifications (§3.5)
- `services/notify.ts` fans out IN_APP + EMAIL on submit (to relevant insurer(s)) and review (to clinic + pet owner).
- Notifications persist to the `Notification` table; queue stub logged through.
- Email service (`services/email.ts`) silently no-ops with placeholder SendGrid credentials.

### Audit (§3.8)
- `AuditLog` rows written on every submit and review event with old/new value, IP, user-agent.
- `GET /api/audit` is gated to `REGULATOR` and `ADMIN`. `GET /api/audit/claim/:id` returns the per-claim trail.

### Branding
- Tailwind + globals + auth pages + dashboard pages aligned to the pitch deck palette (`#1B2B04` background, `#57832B` primary green, `#92D050` accent). Logo extracted from cover slide as `frontend/public/logo.png`.

## 3. Priority-ordered gap list

Effort = rough sizing (S = under a day, M = 1–3 days, L = a week).

1. **Smart contract execution (§3.3) — blocks MVP — L.** Author the Anchor program for the claim lifecycle (Created → Validated → Approved → Paid). Wire `services/blockchain.ts.recordOnChain` into the claim submit + review flows so each event mints a transaction. The `Claim.txHash`, `Claim.onChainId` and `Claim.blockNumber` columns already exist.
2. **Document upload to S3 (§3.2) — M.** Backend currently accepts metadata only. Build a presigned-POST endpoint + multer-s3 fallback, with SHA-256 hashing on the client to populate `Document.fileHash` for the §3.3 authenticity check.
3. **MFA (§4.2) — S.** `mfaEnabled` and `mfaSecret` are on the `User` table; `otplib` and `qrcode` are installed. Add `/auth/mfa/setup`, `/auth/mfa/verify`, `/auth/mfa/disable` and a TOTP step in login.
4. **SMS notifications (§3.5) — S.** `services/sms.ts` is now safe to call; not currently invoked. Trigger from `notifyClaimReviewed` when the recipient has a phone number on `UserProfile`.
5. **Real-time updates (§3.5) — M.** Replace polling with WebSocket (Socket.IO or native `ws`) for claim-status push.
6. **Insurer analytics dashboard (§3.8) — M.** `GET /api/dashboard/claims-over-time` returns `[]`; implement the `date_trunc` aggregation and chart it on the frontend (recharts is installed).
7. **Real queue worker (§3.7) — M.** `services/queue.ts` is a stub. With Redis already in `docker-compose.yml`, switch to real BullMQ producers + a separate worker process for email/SMS/blockchain.
8. **GDPR + field-level encryption (§3.4) — M.** Data-export and data-delete endpoints; at-rest encryption for `diagnosis` and `treatmentDetails`.
9. **GraphQL + alternate formats (§3.6) — defer.** REST satisfies the MVP. The FRD lists GraphQL/XML/CSV/YAML/Protobuf as integration breadth; not MVP critical.
10. **WCAG 2.1 + i18n (§4.3) — M.** Audit keyboard nav, focus rings, contrast, alt text. Pitch-deck palette has good contrast but flows haven't been tested keyboard-only. i18n deferred.

## 4. Out of scope for MVP per the FRD

- §5.2 pilot programmes — operational, not engineering.
- §5.3 decentralized identity + token incentives — Phase 3.
- §4.1 load test for 10k transactions/hour — post-MVP infrastructure.
- §3.7 legacy system data transformation, MQTT/gRPC/AMQP — Phase 3.

## 5. Critical path to FRD MVP

Strictly per §5.1: only **item 1 (Anchor program)** is required.

Pragmatically, you cannot meaningfully demonstrate "smart-contract validation of submitted documents" without **item 2 (S3 upload + client-side hash)**, so the realistic critical path is:

1. Author the Anchor program and integrate it into the claim submit/review flows.
2. Wire S3 document upload with SHA-256 hashing, so the program can validate document authenticity.

Everything else is post-MVP polish and can be sequenced according to pilot feedback (§5.2).
