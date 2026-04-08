export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: Readonly<Record<string, unknown>>;

  constructor(message: string, statusCode: number, details?: Readonly<Record<string, unknown>>) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}