import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL es obligatoria"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET debe tener al menos 32 caracteres"),
  JWT_EXPIRES_IN: z.string().min(1, "JWT_EXPIRES_IN es obligatorio"),
  CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN es obligatorio"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY es obligatorio"),
  GEMINI_MODEL: z.string().min(1).default("gemini-1.5-flash"),
  GEMINI_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120000).default(15000)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(" | ");
  throw new Error(`Configuración de entorno inválida: ${details}`);
}

export const env = {
  nodeEnv: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,
  databaseUrl: parsedEnv.data.DATABASE_URL,
  jwtSecret: parsedEnv.data.JWT_SECRET,
  jwtExpiresIn: parsedEnv.data.JWT_EXPIRES_IN,
  corsOrigin: parsedEnv.data.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter((origin) => origin.length > 0),
  geminiApiKey: parsedEnv.data.GEMINI_API_KEY,
  geminiModel: parsedEnv.data.GEMINI_MODEL,
  geminiTimeoutMs: parsedEnv.data.GEMINI_TIMEOUT_MS
} as const;