import { Router, Request, Response, NextFunction, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { authJwt } from "../../middlewares/authJwt";
import { requireRole } from "../../middlewares/requireRole";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

const dashboardRouter = Router();
const prisma = new PrismaClient();
const dashboardService = new DashboardService(prisma);
const dashboardController = new DashboardController(dashboardService);

const passThrough: RequestHandler = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};

dashboardRouter.get(
  "/stats",
  authJwt,
  requireRole(["HR", "ADMIN"]) as RequestHandler,
  passThrough,
  asyncHandler(dashboardController.getStats)
);

export { dashboardRouter };