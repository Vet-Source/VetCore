import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function authenticate(req: any, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "vetsource-secret") as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }
    req.user = { id: user.id, email: user.email, name: user.name, role: user.role };
    next();
  } catch (err: any) {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
}