# VET-SOURCE Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
│  vet-clinic dashboard | insurer review | pet-owner view | admin  │
└─────────────────┬──────────────────────────────┬────────────────┘
                  │ HTTPS/REST                    │ Solana Wallet
                  ▼                               ▼
┌─────────────────────────────┐   ┌──────────────────────────────┐
│      BACKEND API (Express)  │   │     SOLANA BLOCKCHAIN         │
│  ┌──────────┐ ┌──────────┐  │   │  ┌────────────────────────┐  │
│  │  Claims  │ │   Auth   │  │   │  │  VET-SOURCE Program     │  │
│  │  Routes  │ │  + MFA   │  │   │  │  (Anchor Smart Contract)│  │
│  └──────────┘ └──────────┘  │   │  │  - submit_claim         │  │
│  ┌──────────┐ ┌──────────┐  │   │  │  - approve_claim        │  │
│  │Dashboard │ │Documents │  │   │  │  - reject_claim         │  │
│  │  Stats   │ │   S3     │  │   │  │  - dispute_claim        │  │
│  └──────────┘ └──────────┘  │   │  └────────────────────────┘  │
└──────┬────────────┬──────────┘   └──────────────────────────────┘
       │            │
       ▼            ▼
┌──────────┐  ┌──────────────┐
│PostgreSQL│  │ Redis Queue  │──► Notifications (Email/SMS)
│(Prisma)  │  │ (BullMQ)     │
└──────────┘  └──────────────┘
```

## Data Flow: Claim Submission

```
1. Vet Clinic fills claim form (frontend)
2. Frontend POSTs to /api/claims (backend)
3. Backend saves claim to PostgreSQL (status: SUBMITTED)
4. Backend async records claim hash to Solana (memo tx)
5. Backend queues notification job (Redis/BullMQ)
6. Notification worker sends email to insurers
7. Insurer reviews in dashboard
8. Insurer approves/rejects via /api/claims/:id/review
9. Backend updates DB + triggers notifications
10. All state changes written to AuditLog (immutable)
```

## Security Layers

| Layer | Mechanism |
|-------|-----------|
| Auth | JWT + MFA (TOTP) |
| Transport | HTTPS / TLS 1.3 |
| DB | Encrypted at rest (AES-256) |
| Documents | S3 SSE + private bucket |
| Blockchain | Solana digital signatures |
| API | Rate limiting, Helmet headers |
| Audit | Immutable PostgreSQL AuditLog |
| Compliance | GDPR-ready data model |

## Key Design Decisions

### Why Solana?
- High throughput (~65,000 TPS) exceeds the 10,000/hr FRD requirement
- Low transaction fees (~$0.00025/tx)
- Fast finality (~400ms)
- Strong Rust/Anchor ecosystem

### Why PostgreSQL (off-chain)?
- Blockchain stores: claim ID, hash, status, timestamps — immutable proof
- PostgreSQL stores: full claim data, documents, users — queryable, GDPR-capable
- This hybrid approach satisfies both blockchain integrity AND data compliance requirements

### Why BullMQ?
- Decouples notification delivery from claim processing
- Retries on failure without affecting claim submission
- Scales independently

## Environment Requirements

| Service | Dev | Production |
|---------|-----|-----------|
| PostgreSQL | Docker | AWS RDS (db.t3.medium) |
| Redis | Docker | AWS ElastiCache |
| Documents | Local/MinIO | AWS S3 |
| Blockchain | Solana Devnet | Solana Mainnet |
| Backend | localhost:3001 | AWS ECS Fargate |
| Frontend | localhost:3000 | AWS CloudFront + S3 |
