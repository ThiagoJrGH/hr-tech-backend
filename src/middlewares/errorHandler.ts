import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../shared/errors/AppError";

interface ErrorBody {
  message: string;
  details?: unknown;
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response<ErrorBody>,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      details: err.details
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      message: "Error de validación",
      details: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    res.status(400).json({
      message: "Error de base de datos",
      details: {
        code: err.code,
        meta: err.meta
      }
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      message: "Validación de consulta Prisma fallida",
      details: {
        cause: err.message
      }
    });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({
      message: "Error interno del servidor",
      details: {
        cause: err.message
      }
    });
    return;
  }

  res.status(500).json({
    message: "Error interno del servidor"
  });
};