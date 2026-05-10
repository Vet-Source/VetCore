import { Router } from "express";
import { authenticate } from "../middleware/auth";

const dashboardRouter = Router();
dashboardRouter.use(authenticate as any);

dashboardRouter.get("/", async (req: any, res: any) => {
  res.json({ success: true, data: {} });
});

export { dashboardRouter };