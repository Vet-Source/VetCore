import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { authenticate } from "../middleware/auth";

const adminRouter = Router();
const prisma = new PrismaClient();

// Admin only middleware
function adminOnly(req: any, res: any, next: any) {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ success: false, error: "Admin access required" });
  }
  next();
}

adminRouter.use(authenticate as any);
adminRouter.use(adminOnly);

// GET all users
adminRouter.get("/users", async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, email: true, name: true, role: true,
        suspended: true, createdAt: true,
        _count: { select: { claims: true } }
      }
    });
    res.json({ success: true, data: users });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// GET all claims (admin sees all)
adminRouter.get("/claims", async (req: any, res: any) => {
  try {
    const claims = await prisma.claim.findMany({
      orderBy: { createdAt: "desc" },
      include: { clinic: { select: { name: true, email: true } } }
    });
    res.json({ success: true, data: claims });
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
      select: { id: true, email: true, name: true, role: true, suspended: true }
    });
    res.json({ success: true, data: user });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// PATCH suspend/unsuspend user
adminRouter.patch("/users/:id/suspend", async (req: any, res: any) => {
  try {
    const { suspended } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { suspended },
      select: { id: true, email: true, name: true, role: true, suspended: true }
    });
    res.json({ success: true, data: user });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// PATCH change user password
adminRouter.patch("/users/:id/password", async (req: any, res: any) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
    }
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: req.params.id },
      data: { password: hashed }
    });
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// DELETE user
adminRouter.delete("/users/:id", async (req: any, res: any) => {
  try {
    // Delete claims first
    await prisma.claim.deleteMany({ where: { clinicId: req.params.id } });
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

export { adminRouter };