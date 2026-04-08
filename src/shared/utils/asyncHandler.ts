import { NextFunction, Request, Response, RequestHandler } from "express";

type AsyncController<TRequest extends Request = Request> = (
  req: TRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler = <TRequest extends Request = Request>(
  fn: AsyncController<TRequest>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req as TRequest, res, next)).catch(next);
  };
};