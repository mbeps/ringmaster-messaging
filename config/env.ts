import { z } from "zod";

/**
 * Client environment schema.
 * Only NEXT_PUBLIC_* variables belong here so they are safely exposed to the browser.
 */
export const clientEnvSchema = z.object({
  NEXT_PUBLIC_PUSHER_APP_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_PUSHER_APP_KEY is required"),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .optional()
    .or(z.literal("")),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_PRESET: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

/**
 * Server environment schema.
 * Extends clientEnvSchema with server-only secrets and runtime configs.
 */
export const serverEnvSchema = clientEnvSchema.extend({
  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "warning", "error", "fatal"])
    .default("info")
    .transform((val) => (val === "warn" ? "warning" : val)),
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL must be a valid connection string"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),
  AUTH_TRUST_HOST: z.string().optional(),
  CLIENT_ID_GITHUB: z.string().default(""),
  CLIENT_SECRET_GITHUB: z.string().default(""),
  CLIENT_ID_GOOGLE: z.string().default(""),
  CLIENT_SECRET_GOOGLE: z.string().default(""),
  PUSHER_APP_ID: z.string().min(1, "PUSHER_APP_ID is required"),
  PUSHER_SECRET: z.string().min(1, "PUSHER_SECRET is required"),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type Env = ServerEnv;

/**
 * Validates environment variables according to active runtime context.
 * Pass explicit process.env keys so Next.js bundlers can inline NEXT_PUBLIC_* variables.
 */
export function validateEnv(
  runtimeEnv: Record<string, unknown> = {
    LOG_LEVEL: process.env.LOG_LEVEL,
    NEXT_PUBLIC_PUSHER_APP_KEY: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_CLOUDINARY_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_PRESET,
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET:
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_TRUSTED_ORIGINS: process.env.BETTER_AUTH_TRUSTED_ORIGINS,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    CLIENT_ID_GITHUB: process.env.CLIENT_ID_GITHUB,
    CLIENT_SECRET_GITHUB: process.env.CLIENT_SECRET_GITHUB,
    CLIENT_ID_GOOGLE: process.env.CLIENT_ID_GOOGLE,
    CLIENT_SECRET_GOOGLE: process.env.CLIENT_SECRET_GOOGLE,
    PUSHER_APP_ID: process.env.PUSHER_APP_ID,
    PUSHER_SECRET: process.env.PUSHER_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  },
  isServerEnv: boolean = typeof window === "undefined" ||
    (typeof process !== "undefined" && Boolean(process.env.VITEST)),
): Env {
  const schema = isServerEnv ? serverEnvSchema : clientEnvSchema;
  const parsed = schema.safeParse(runtimeEnv);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    throw new Error("Invalid environment variables");
  }

  return parsed.data as Env;
}

export const env = validateEnv();

/**
 * Consolidated Cloudinary configuration helper
 */
export const CLOUDINARY_CONFIG = {
  uploadPreset:
    env.NEXT_PUBLIC_CLOUDINARY_PRESET ||
    env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  cloudName: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
} as const;
