import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const authRouter = Router();
const prisma = new PrismaClient();

authRouter.post("/register", async (req: any, res: any) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, error: "Email already registered" });
    }
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: name || null,
        role: role || "CLINIC",
      },
    });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "vetsource-secret",
      { expiresIn: "7d" }
    );
    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

authRouter.post("/login", async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "vetsource-secret",
      { expiresIn: "7d" }
    );
    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

authRouter.get("/me", async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, error: "No token" });
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "vetsource-secret");
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, data: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err: any) {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
});

export { authRouter };