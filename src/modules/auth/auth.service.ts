import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors/AppError";
import { LoginInput, LoginResponse } from "./dto/login.schema";

interface UserRecord {
  id: number;
  email: string;
  passwordHash: string;
  role: "HR" | "ADMIN";
}

export class AuthService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async login(payload: LoginInput): Promise<LoginResponse> {
    const normalizedEmail = payload.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true
      }
    });

    if (!user) {
      throw new AppError("Credenciales inválidas", 401);
    }

    const verifiedPassword = await this.verifyPassword(payload.password, user.passwordHash);

    if (!verifiedPassword) {
      throw new AppError("Credenciales inválidas", 401);
    }

    const token = this.generateAccessToken({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role as "HR" | "ADMIN"
    });

    return {
      access_token: token,
      token_type: "Bearer",
      expires_in: env.jwtExpiresIn,
      user: {
        id: user.id,
        email: user.email,
        role: user.role as "HR" | "ADMIN"
      }
    };
  }

  private async verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(plainPassword, passwordHash);
    return isMatch;
  }

  private generateAccessToken(user: UserRecord): string {
    const token = jwt.sign(
      {
        email: user.email,
        role: user.role
      },
      env.jwtSecret,
      {
        subject: String(user.id),
        expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"]
      }
    );

    return token;
  }
}