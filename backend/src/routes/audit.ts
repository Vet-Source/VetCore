import { Router } from "express";
import { authenticate } from "../middleware/auth";

const auditRouter = Router();
auditRouter.use(authenticate as any);

auditRouter.get("/", async (req: any, res: any) => {
  res.json({ success: true, data: [] });
});

export { auditRouter };