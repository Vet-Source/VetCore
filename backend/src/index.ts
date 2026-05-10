import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { logger } from "./utils/logger";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth";
import { claimsRouter } from "./routes/claims";
import { documentsRouter } from "./routes/documents";
import { dashboardRouter } from "./routes/dashboard";
import { usersRouter } from "./routes/users";
import { notificationsRouter } from "./routes/notifications";
import { auditRouter } from "./routes/audit";
import { adminRouter } from "./routes/admin";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0"
  });
});

// API Routes
app.use("/api/auth",          authRouter);
app.use("/api/claims",        claimsRouter);
app.use("/api/documents",     documentsRouter);
app.use("/api/dashboard",     dashboardRouter);
app.use("/api/users",         usersRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/audit",         auditRouter);
app.use("/api/admin",         adminRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`VET-SOURCE API running on port ${PORT}`);
  logger.info(`  Environment: ${process.env.NODE_ENV}`);
  logger.info(`  Health: http://localhost:${PORT}/health`);
});

export default app;