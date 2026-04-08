import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodEffects, ZodError, ZodTypeAny } from "zod";

type BodySchema = AnyZodObject | ZodEffects<ZodTypeAny>;

export const validateBody = <T extends BodySchema>(schema: T) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsedBody = schema.parse(req.body);
      req.body = parsedBody;
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        next(error);
        return;
      }

      next(error);
    }
  };
};