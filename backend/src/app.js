import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import passport from "./config/passport.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { loggerMiddleware } from "./middleware/logger.middleware.js";

import authRoutes from "./modules/auth/auth.routes.js";
import communityRoutes from "./modules/community/community.routes.js";
import issueRoutes from "./modules/issues/issue.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import aiRoutes from "./modules/ai/ai.routes.js";
import cropRoutes from "./modules/crop-recommendation/crop.routes.js";
import yieldRoutes from "./modules/yield-prediction/yield.routes.js";
import diseaseRoutes from "./modules/disease-detection/disease.routes.js";
import zeroProdRoutes from "./modules/zero-production-risk/zeroProduction.routes.js";


const app = express();
app.use(passport.initialize());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);
app.use(loggerMiddleware);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        callback(null, origin || true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

app.use("/auth", authRoutes);
app.use("/community", authMiddleware, communityRoutes);
app.use("/issue", authMiddleware, issueRoutes);
app.use("/users", authMiddleware, userRoutes);
app.use("/ai", authMiddleware, aiRoutes);

// ML microservice proxy routes
app.use("/crop-recommendation", authMiddleware, cropRoutes);
app.use("/yield-prediction", authMiddleware, yieldRoutes);
app.use("/disease-detection", authMiddleware, diseaseRoutes);
app.use("/zero-production-risk", authMiddleware, zeroProdRoutes);

app.use(errorMiddleware);

export default app;
