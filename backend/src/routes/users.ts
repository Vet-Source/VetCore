import { Router } from "express";
import { authenticate } from "../middleware/auth";

const usersRouter = Router();
usersRouter.use(authenticate as any);

usersRouter.get("/", async (req: any, res: any) => {
  res.json({ success: true, data: [] });
});

export { usersRouter };