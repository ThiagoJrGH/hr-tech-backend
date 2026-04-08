import { NextFunction, Response } from "express";
import { AppError } from "../shared/errors/AppError";
import { UserRole } from "../shared/types/auth";
import { AuthenticatedRequest } from "./authJwt";

export const requireRole = (allowedRoles: ReadonlyArray<UserRole>) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const authenticatedUser = req.user;

    if (!authenticatedUser) {
      next(new AppError("Usuario no autenticado", 401));
      return;
    }

    if (!allowedRoles.includes(authenticatedUser.role)) {
      next(new AppError("No tiene permisos para acceder a este recurso", 403));
      return;
    }

    next();
  };
};