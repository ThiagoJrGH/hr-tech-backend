import { Router, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { authJwt } from "../../middlewares/authJwt";
import { requireRole } from "../../middlewares/requireRole";
import { validateBody } from "../../middlewares/validateBody";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { createDepartmentSchema } from "./dto/createDepartment.schema";
import { CatalogsService } from "./catalogs.service";
import { CatalogsController } from "./catalogs.controller";

const catalogsRouter = Router();
const prisma = new PrismaClient();
const catalogsService = new CatalogsService(prisma);
const catalogsController = new CatalogsController(catalogsService);

// GET: Todos pueden leer (HR y ADMIN)
catalogsRouter.get(
  "/",
  authJwt,
  asyncHandler(catalogsController.getCatalog as any)
);

// POST: SOLO ADMIN puede crear
catalogsRouter.post(
  "/departments",
  authJwt,
  requireRole(["ADMIN"]) as RequestHandler,
  validateBody(createDepartmentSchema),
  asyncHandler(catalogsController.createDepartment as any)
);

export { catalogsRouter };