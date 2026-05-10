# VET-SOURCE Phase 4 — Installation

## Step 1: Copy files into your project
Extract this ZIP so the folders merge into C:\Users\ASUS\vet-source\

## Step 2: In PowerShell window 1 (backend)
cd C:\Users\ASUS\vet-source\backend
npx prisma migrate dev --name add_claim_fields
npm run dev

## Step 3: In PowerShell window 2 (frontend)
cd C:\Users\ASUS\vet-source\frontend
npm run dev

## Step 4: Open your browser
http://localhost:3000/auth/register  → create an account
http://localhost:3000/dashboard      → overview
http://localhost:3000/dashboard/submit → submit a claim
http://localhost:3000/dashboard/claims → view all claims
