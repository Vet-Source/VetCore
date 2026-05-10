import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { authenticate } from "../middleware/auth";

const adminRouter = Router();
const prisma = new PrismaClient();

function adminOnly(req: any, res: any, next: any) {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ success: false, error: "Admin access required" });
  }
  next();
}

adminRouter.use(authenticate as any);
adminRouter.use(adminOnly);

// GET all users including pending
adminRouter.get("/users", async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, email: true, name: true, role: true,
        status: true, suspended: true, createdAt: true,
        _count: { select: { claims: true } }
      }
    });
    res.json({ success: true, data: users });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// GET pending registrations count
adminRouter.get("/pending-count", async (req: any, res: any) => {
  try {
    const count = await prisma.user.count({ where: { status: "PENDING" } });
    res.json({ success: true, data: count });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// GET all claims
adminRouter.get("/claims", async (req: any, res: any) => {
  try {
    const claims = await prisma.claim.findMany({
      orderBy: { createdAt: "desc" },
      include: { clinic: { select: { name: true, email: true } } }
    });
    res.json({ success: true, data: claims });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// PATCH approve or reject registration
adminRouter.patch("/users/:id/approve", async (req: any, res: any) => {
  try {
    const { decision } = req.body;
    if (!["ACTIVE", "REJECTED"].includes(decision)) {
      return res.status(400).json({ success: false, error: "Decision must be ACTIVE or REJECTED" });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: decision },
      select: { id: true, email: true, name: true, role: true, status: true }
    });
    res.json({ success: true, data: user });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// PATCH change user role
adminRouter.patch("/users/:id/role", async (req: any, res: any) => {
  try {
    const { role } = req.body;
    const validRoles = ["CLINIC", "INSURER", "ADMIN"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, error: "Invalid role" });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, email: true, name: true, role: true, status: true, suspended: true }
    });
    res.json({ success: true, data: user });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// PATCH suspend/unsuspend
adminRouter.patch("/users/:id/suspend", async (req: any, res: any) => {
  try {
    const { suspended } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { suspended },
      select: { id: true, email: true, name: true, role: true, status: true, suspended: true }
    });
    res.json({ success: true, data: user });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// PATCH change password
adminRouter.patch("/users/:id/password", async (req: any, res: any) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
    }
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: req.params.id }, data: { password: hashed } });
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// DELETE user
adminRouter.delete("/users/:id", async (req: any, res: any) => {
  try {
    await prisma.claim.deleteMany({ where: { clinicId: req.params.id } });
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// POST generate admin invite code
adminRouter.post("/generate-invite", async (req: any, res: any) => {
  try {
    const code = "VTCADM-" + crypto.randomBytes(6).toString("hex").toUpperCase();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const invite = await prisma.adminInviteCode.create({
      data: { code, expiresAt }
    });
    res.json({ success: true, data: { code: invite.code, expiresAt: invite.expiresAt } });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

export { adminRouter };