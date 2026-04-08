import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../shared/errors/AppError";
import { AuthUser, JwtPayloadData } from "../shared/types/auth";

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

const isJwtPayloadData = (value: unknown): value is JwtPayloadData => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;

  const hasSub = typeof payload.sub === "string" && payload.sub.length > 0;
  const hasEmail = typeof payload.email === "string" && payload.email.length > 0;
  const hasRole = payload.role === "HR" || payload.role === "ADMIN";

  return hasSub && hasEmail && hasRole;
};

export const authJwt = (req: Request, _res: Response, next: NextFunction): void => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    next(new AppError("Cabecera Authorization no proporcionada", 401));
    return;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || typeof token !== "string" || token.trim().length === 0) {
    next(new AppError("Token JWT mal formado", 401));
    return;
  }

  try {
    const decoded: unknown = jwt.verify(token, env.jwtSecret);

    if (!isJwtPayloadData(decoded)) {
      next(new AppError("Payload JWT inválido", 401));
      return;
    }

    const userId = Number(decoded.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      next(new AppError("Identificador de usuario inválido en JWT", 401));
      return;
    }

    const authenticatedRequest = req as AuthenticatedRequest;
    authenticatedRequest.user = {
      id: userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError("Token JWT expirado", 401));
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError("Token JWT inválido", 401));
      return;
    }

    next(new AppError("No se pudo autenticar el token JWT", 401));
  }
};