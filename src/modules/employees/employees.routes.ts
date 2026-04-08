import { Router, Request, Response, NextFunction, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { authJwt } from "../../middlewares/authJwt";
import { requireRole } from "../../middlewares/requireRole";
import { validateBody } from "../../middlewares/validateBody";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { listEmployeesQuerySchema } from "./dto/listEmployeesQuery.schema";
import { createEmployeeSchema } from "./dto/createEmployee.schema";
import { EmployeesService } from "./employees.service";
import { EmployeesController } from "./employees.controller";

const employeesRouter = Router();
const prisma = new PrismaClient();
const employeesService = new EmployeesService(prisma);
const employeesController = new EmployeesController(employeesService);

const parseEmployeesQuery: RequestHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const parsedQuery = listEmployeesQuerySchema.parse(req.query);
  req.query = parsedQuery as unknown as Request["query"];
  next();
};

employeesRouter.get(
  "/",
  authJwt,
  requireRole(["HR", "ADMIN"]) as RequestHandler,
  parseEmployeesQuery,
  asyncHandler(employeesController.listEmployees as any)
);

employeesRouter.post(
  "/",
  authJwt,
  requireRole(["HR", "ADMIN"]) as RequestHandler,
  validateBody(createEmployeeSchema),
  asyncHandler(employeesController.createEmployee)
);

export { employeesRouter };