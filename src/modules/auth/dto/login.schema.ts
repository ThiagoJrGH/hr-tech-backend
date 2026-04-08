import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("El email no tiene un formato válido").max(255, "El email supera el máximo permitido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(128, "La contraseña supera el máximo permitido")
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface LoginResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: string;
  user: {
    id: number;
    email: string;
    role: "HR" | "ADMIN";
  };
}