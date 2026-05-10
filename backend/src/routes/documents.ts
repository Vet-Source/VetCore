import { Router } from "express";
import { authenticate } from "../middleware/auth";

const documentsRouter = Router();
documentsRouter.use(authenticate as any);

documentsRouter.get("/", async (req: any, res: any) => {
  res.json({ success: true, data: [] });
});

export { documentsRouter };