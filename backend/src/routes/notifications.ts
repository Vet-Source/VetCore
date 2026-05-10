import { Router } from "express";
import { authenticate } from "../middleware/auth";

const notificationsRouter = Router();
notificationsRouter.use(authenticate as any);

notificationsRouter.get("/", async (req: any, res: any) => {
  res.json({ success: true, data: [] });
});

export { notificationsRouter };