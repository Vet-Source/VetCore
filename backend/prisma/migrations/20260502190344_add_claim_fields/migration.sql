/*
  Warnings:

  - You are about to drop the column `blockNumber` on the `Claim` table. All the data in the column will be lost.
  - You are about to drop the column `claimNumber` on the `Claim` table. All the data in the column will be lost.
  - You are about to drop the column `onChainId` on the `Claim` table. All the data in the column will be lost.
  - You are about to drop the column `petId` on the `Claim` table. All the data in the column will be lost.
  - You are about to drop the column `policyId` on the `Claim` table. All the data in the column will be lost.
  - You are about to drop the column `submittedAt` on the `Claim` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Claim` table. All the data in the column will be lost.
  - You are about to drop the column `treatmentDetails` on the `Claim` table. All the data in the column will be lost.
  - You are about to drop the column `txHash` on the `Claim` table. All the data in the column will be lost.
  - The `status` column on the `Claim` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `approvedAmount` on the `Claim` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mfaEnabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mfaSecret` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClaimReview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Insurer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PetOwner` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Policy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PolicyPet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VetClinic` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `amount` to the `Claim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicName` to the `Claim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerEmail` to the `Claim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerName` to the `Claim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientName` to the `Claim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `treatmentDescription` to the `Claim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vetName` to the `Claim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_claimId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Claim" DROP CONSTRAINT "Claim_clinicId_fkey";

-- DropForeignKey
ALTER TABLE "Claim" DROP CONSTRAINT "Claim_petId_fkey";

-- DropForeignKey
ALTER TABLE "Claim" DROP CONSTRAINT "Claim_policyId_fkey";

-- DropForeignKey
ALTER TABLE "ClaimReview" DROP CONSTRAINT "ClaimReview_claimId_fkey";

-- DropForeignKey
ALTER TABLE "ClaimReview" DROP CONSTRAINT "ClaimReview_insurerId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_claimId_fkey";

-- DropForeignKey
ALTER TABLE "Insurer" DROP CONSTRAINT "Insurer_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_claimId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Pet" DROP CONSTRAINT "Pet_clinicId_fkey";

-- DropForeignKey
ALTER TABLE "Pet" DROP CONSTRAINT "Pet_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "PetOwner" DROP CONSTRAINT "PetOwner_userId_fkey";

-- DropForeignKey
ALTER TABLE "Policy" DROP CONSTRAINT "Policy_insurerId_fkey";

-- DropForeignKey
ALTER TABLE "PolicyPet" DROP CONSTRAINT "PolicyPet_petId_fkey";

-- DropForeignKey
ALTER TABLE "PolicyPet" DROP CONSTRAINT "PolicyPet_policyId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "VetClinic" DROP CONSTRAINT "VetClinic_userId_fkey";

-- DropIndex
DROP INDEX "Claim_claimNumber_key";

-- AlterTable
ALTER TABLE "Claim" DROP COLUMN "blockNumber",
DROP COLUMN "claimNumber",
DROP COLUMN "onChainId",
DROP COLUMN "petId",
DROP COLUMN "policyId",
DROP COLUMN "submittedAt",
DROP COLUMN "totalAmount",
DROP COLUMN "treatmentDetails",
DROP COLUMN "txHash",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "blockchainTxId" TEXT,
ADD COLUMN     "clinicName" TEXT NOT NULL,
ADD COLUMN     "ownerEmail" TEXT NOT NULL,
ADD COLUMN     "ownerName" TEXT NOT NULL,
ADD COLUMN     "patientBreed" TEXT,
ADD COLUMN     "patientName" TEXT NOT NULL,
ADD COLUMN     "patientSpecies" TEXT NOT NULL DEFAULT 'dog',
ADD COLUMN     "reviewNotes" TEXT,
ADD COLUMN     "treatmentDescription" TEXT NOT NULL,
ADD COLUMN     "vetName" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "treatmentDate" DROP NOT NULL,
ALTER COLUMN "approvedAmount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isActive",
DROP COLUMN "mfaEnabled",
DROP COLUMN "mfaSecret",
DROP COLUMN "passwordHash",
ADD COLUMN     "name" TEXT,
ADD COLUMN     "password" TEXT NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'CLINIC';

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "ClaimReview";

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "Insurer";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "Pet";

-- DropTable
DROP TABLE "PetOwner";

-- DropTable
DROP TABLE "Policy";

-- DropTable
DROP TABLE "PolicyPet";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "UserProfile";

-- DropTable
DROP TABLE "VetClinic";

-- DropEnum
DROP TYPE "ClaimStatus";

-- DropEnum
DROP TYPE "DocumentType";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "UserRole";

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
