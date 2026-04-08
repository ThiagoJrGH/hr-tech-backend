import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { validateBody } from "../../middlewares/validateBody";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { loginSchema } from "./dto/login.schema";

const authRouter = Router();
const prisma = new PrismaClient();
const authService = new AuthService(prisma);
const authController = new AuthController(authService);

authRouter.post("/login", validateBody(loginSchema), asyncHandler(authController.login));

export { authRouter };