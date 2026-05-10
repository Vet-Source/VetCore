# VET-SOURCE Development Setup Guide

## Prerequisites

Install these tools before starting:

```bash
# Node.js 18+ (check version)
node --version

# Install Rust (for Solana contracts)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"

# Install Anchor CLI (Solana smart contract framework)
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest && avm use latest

# Install Docker Desktop
# https://www.docker.com/products/docker-desktop/
```

## Step 1 — Clone & Configure

```bash
git clone <your-repo-url>
cd vet-source
cp .env.example .env
# Edit .env with your values (see comments in file)
```

## Step 2 — Start Local Infrastructure

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify services are running
docker-compose ps
```

## Step 3 — Backend Setup

```bash
cd backend
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations (creates all tables)
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to browse data
npx prisma studio

# Start backend dev server (hot reload)
npm run dev
# → API running at http://localhost:3001
# → Health check: http://localhost:3001/health
```

## Step 4 — Frontend Setup

```bash
cd ../frontend
npm install

# Create frontend env file
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local

# Start frontend dev server
npm run dev
# → App running at http://localhost:3000
```

## Step 5 — Smart Contracts (Optional for MVP Demo)

```bash
cd ../contracts

# Configure Solana for devnet
solana config set --url devnet

# Create a wallet (or use existing)
solana-keygen new --outfile ~/.config/solana/id.json
solana airdrop 2  # Get free devnet SOL

# Build the program
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet
# → Copy the Program ID and paste into contracts/src/lib.rs
# → Also add to backend .env as PROGRAM_ID
```

## Verify Everything Works

```bash
# 1. API health
curl http://localhost:3001/health

# 2. Create test user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"clinic@test.com","password":"Test123!","role":"VET_CLINIC","firstName":"Test","lastName":"Clinic","clinicName":"Test Vets","registrationNo":"REG001","address":"1 Test St","city":"London","country":"UK"}'

# 3. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"clinic@test.com","password":"Test123!"}'
```

## Project Structure Quick Reference

```
backend/
  src/
    index.ts          ← Express app entry
    routes/           ← API route definitions
    controllers/      ← Business logic
    services/         ← Blockchain, email, queue
    middleware/       ← Auth, validation, errors
    models/           ← (types only, Prisma handles DB)
    config/           ← DB connection
    utils/            ← Logger, AppError
  prisma/
    schema.prisma     ← Full data model (edit here!)

frontend/
  src/
    app/              ← Next.js pages (App Router)
    components/       ← Reusable UI components
    hooks/            ← useAuth, useQuery wrappers
    lib/              ← api.ts (axios client)

contracts/
  src/lib.rs          ← Anchor smart contract (Rust)
  tests/              ← TypeScript integration tests
```

## Troubleshooting

**Database connection failed:**
- Check Docker is running: `docker-compose ps`
- Check .env DATABASE_URL matches docker-compose.yml credentials

**Blockchain transactions failing:**
- Check you have devnet SOL: `solana balance`
- Airdrop more: `solana airdrop 2`

**Frontend auth not working:**
- Ensure backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in frontend/.env.local
