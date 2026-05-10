# VET-SOURCE — Blockchain Veterinary Insurance Platform

A blockchain-based platform automating veterinary insurance claims processing using smart contracts, secure data storage, and real-time notifications.

## Project Structure

```
vet-source/
├── frontend/          # Next.js 14 web application
├── backend/           # Node.js + Express REST API
├── contracts/         # Solana smart contracts (Anchor)
├── infrastructure/    # Terraform (AWS) + Docker configs
└── docs/              # Architecture & API documentation
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Blockchain | Solana + Anchor Framework |
| Auth | JWT + MFA (TOTP) |
| Storage | AWS S3 (documents) |
| Notifications | SendGrid (email) + Twilio (SMS) |
| Queue | Redis + BullMQ |
| Infrastructure | AWS (ECS, RDS, ElastiCache) + Terraform |

## Quick Start

### Prerequisites
- Node.js 18+
- Docker + Docker Compose
- Solana CLI + Anchor CLI (for contracts)
- AWS account configured

### 1. Clone and Install
```bash
git clone <repo>
cd vet-source
cp .env.example .env  # Fill in your values
```

### 2. Start Local Services
```bash
docker-compose up -d  # Starts PostgreSQL + Redis
```

### 3. Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev  # Runs on http://localhost:3001
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:3000
```

### 5. Smart Contracts (optional for MVP demo)
```bash
cd contracts
anchor build
anchor test
anchor deploy --provider.cluster devnet
```

## User Roles

| Role | Capabilities |
|------|-------------|
| **Vet Clinic** | Submit claims, upload documents, track status |
| **Insurance Provider** | Review, approve/reject claims, analytics |
| **Pet Owner** | View claim history, status updates |
| **Regulator** | Audit logs, compliance reports |
| **Admin** | User management, system configuration |

## MVP Scope (Phase 1)

- [x] Project scaffold & architecture
- [ ] Smart contract: claim lifecycle on Solana
- [ ] Backend API: claims CRUD + auth
- [ ] Document upload (S3)
- [ ] Vet clinic dashboard + claim submission
- [ ] Insurer review dashboard
- [ ] Email/SMS notifications
- [ ] Pet owner status view

## Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Smart Contract Spec](docs/CONTRACTS.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
