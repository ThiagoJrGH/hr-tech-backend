import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthService } from "./auth.service";
import { LoginInput, LoginResponse } from "./dto/login.schema";

export class AuthController {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  public login = async (req: Request, res: Response<LoginResponse>): Promise<void> => {
    const payload = req.body as LoginInput;
    const result = await this.authService.login(payload);
    res.status(StatusCodes.OK).json(result);
  };
}