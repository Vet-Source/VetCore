import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth";
import { logger } from "../utils/logger";

const claimsRouter = Router();
const prisma = new PrismaClient();

claimsRouter.use(authenticate as any);

claimsRouter.get("/", async (req: any, res: any) => {
  try {
    const where = ["INSURER","ADMIN"].includes(req.user.role) ? {} : { clinicId: req.user.id };
    const claims = await prisma.claim.findMany({ where, orderBy: { createdAt: "desc" } });
    res.json({ success: true, data: claims });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

claimsRouter.get("/:id", async (req: any, res: any) => {
  try {
    const claim = await prisma.claim.findUnique({ where: { id: req.params.id } });
    if (!claim) return res.status(404).json({ success: false, error: "Claim not found" });
    res.json({ success: true, data: claim });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

claimsRouter.post("/", async (req: any, res: any) => {
  try {
    const {
      patientName, patientSpecies, patientBreed, ownerName, ownerEmail,
      treatmentDate, diagnosis, treatmentDescription, amount, vetName, clinicName,
    } = req.body;

    if (!patientName || !ownerName || !diagnosis || !amount || !vetName || !clinicName) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const blockchainTxId = "VS_" + Date.now().toString(36).toUpperCase() + "_" + Math.random().toString(36).slice(2,8).toUpperCase();
    const claim = await prisma.claim.create({
      data: {
        patientName,
        patientSpecies: patientSpecies || "dog",
        patientBreed: patientBreed || null,
        ownerName,
        ownerEmail,
        treatmentDate: treatmentDate ? new Date(treatmentDate) : null,
        diagnosis,
        treatmentDescription,
        amount: parseFloat(amount) || 0,
        vetName,
        clinicName,
        status: "PENDING",
        blockchainTxId,
        clinicId: req.user.id,
      },
    });
    logger.info("Claim submitted: " + claim.id);
    res.status(201).json({ success: true, data: claim });
  } catch (err: any) {
    logger.error("Claim submit error: " + err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

claimsRouter.post("/:id/review", async (req: any, res: any) => {
  try {
    const { decision, approvedAmount, notes } = req.body;
    const claim = await prisma.claim.update({
      where: { id: req.params.id },
      data: {
        status: decision,
        approvedAmount: approvedAmount ? parseFloat(approvedAmount) : null,
        reviewNotes: notes || null,
        reviewedAt: new Date(),
        resolvedAt: new Date(),
      },
    });
    res.json({ success: true, data: claim });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

export { claimsRouter };