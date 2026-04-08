import { Router, Request, Response, NextFunction, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { authJwt } from "../../middlewares/authJwt";
import { requireRole } from "../../middlewares/requireRole";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";

const aiRouter = Router();
const prisma = new PrismaClient();
const aiService = new AiService(prisma);
const aiController = new AiController(aiService);

const passThrough: RequestHandler = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};

aiRouter.get(
  "/insights",
  authJwt,
  requireRole(["HR", "ADMIN"]) as RequestHandler,
  passThrough,
  asyncHandler(aiController.getInsights)
);

export { aiRouter };