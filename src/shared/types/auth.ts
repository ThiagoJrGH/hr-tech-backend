export type UserRole = "HR" | "ADMIN";

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
}

export interface JwtPayloadData {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}