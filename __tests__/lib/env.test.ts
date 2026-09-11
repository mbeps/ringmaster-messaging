import { describe, expect, it, vi } from "vitest";
import {
  CLOUDINARY_CONFIG,
  clientEnvSchema,
  env,
  serverEnvSchema,
  validateEnv,
} from "@/lib/env";
import * as libsEnv from "@/libs/env";

describe("lib/env", () => {
  const validServerEnv = {
    NEXT_PUBLIC_PUSHER_APP_KEY: "public-pusher-key",
    NEXT_PUBLIC_APP_URL: "https://messaging.example.com",
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "cloud-name",
    NEXT_PUBLIC_CLOUDINARY_PRESET: "preset-1",
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: "upload-preset-1",
    DATABASE_URL: "mongodb://localhost:27017/ringmaster",
    BETTER_AUTH_SECRET: "super-secret-auth-key-12345",
    BETTER_AUTH_URL: "https://auth.example.com",
    BETTER_AUTH_TRUSTED_ORIGINS: "https://example.com,https://app.example.com",
    AUTH_TRUST_HOST: "true",
    CLIENT_ID_GITHUB: "gh-client-id",
    CLIENT_SECRET_GITHUB: "gh-client-secret",
    CLIENT_ID_GOOGLE: "google-client-id",
    CLIENT_SECRET_GOOGLE: "google-client-secret",
    PUSHER_APP_ID: "pusher-app-id",
    PUSHER_SECRET: "pusher-secret",
    NODE_ENV: "production",
  };

  const validClientEnv = {
    NEXT_PUBLIC_PUSHER_APP_KEY: "public-pusher-key",
    NEXT_PUBLIC_APP_URL: "https://messaging.example.com",
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "cloud-name",
    NEXT_PUBLIC_CLOUDINARY_PRESET: "preset-1",
  };

  describe("server validation", () => {
    it("validates and returns parsed server environment", () => {
      const parsed = validateEnv(validServerEnv, true);

      expect(parsed.DATABASE_URL).toBe("mongodb://localhost:27017/ringmaster");
      expect(parsed.BETTER_AUTH_SECRET).toBe("super-secret-auth-key-12345");
      expect(parsed.BETTER_AUTH_URL).toBe("https://auth.example.com");
      expect(parsed.NEXT_PUBLIC_PUSHER_APP_KEY).toBe("public-pusher-key");
      expect(parsed.NODE_ENV).toBe("production");
    });

    it("applies default values for omitted optional/defaulted server variables", () => {
      const minimalServerEnv = {
        NEXT_PUBLIC_PUSHER_APP_KEY: "key",
        DATABASE_URL: "mongodb://localhost:27017/test",
        BETTER_AUTH_SECRET: "secret",
        PUSHER_APP_ID: "app-id",
        PUSHER_SECRET: "secret",
      };

      const parsed = validateEnv(minimalServerEnv, true);

      expect(parsed.BETTER_AUTH_URL).toBe("http://localhost:3000");
      expect(parsed.NODE_ENV).toBe("development");
      expect(parsed.LOG_LEVEL).toBe("info");
      expect(parsed.CLIENT_ID_GITHUB).toBe("");
      expect(parsed.CLIENT_SECRET_GITHUB).toBe("");
      expect(parsed.CLIENT_ID_GOOGLE).toBe("");
      expect(parsed.CLIENT_SECRET_GOOGLE).toBe("");
      expect(parsed.BETTER_AUTH_TRUSTED_ORIGINS).toBeUndefined();
      expect(parsed.AUTH_TRUST_HOST).toBeUndefined();
      expect(parsed.NEXT_PUBLIC_APP_URL).toBeUndefined();
    });

    it("transforms warn to warning for LOG_LEVEL", () => {
      const parsed = validateEnv(
        { ...validServerEnv, LOG_LEVEL: "warn" },
        true,
      );
      expect(parsed.LOG_LEVEL).toBe("warning");
    });

    it("accepts valid LOG_LEVEL values", () => {
      for (const level of ["debug", "info", "warning", "error", "fatal"]) {
        const parsed = validateEnv(
          { ...validServerEnv, LOG_LEVEL: level },
          true,
        );
        expect(parsed.LOG_LEVEL).toBe(level);
      }
    });

    it("throws when LOG_LEVEL is invalid", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const invalidEnv = { ...validServerEnv, LOG_LEVEL: "verbose" };

      expect(() => validateEnv(invalidEnv, true)).toThrow(
        "Invalid environment variables",
      );

      errorSpy.mockRestore();
    });

    it("throws and logs formatted error when a required server secret is missing", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const invalidEnv = { ...validServerEnv };
      delete (invalidEnv as Record<string, unknown>).DATABASE_URL;

      expect(() => validateEnv(invalidEnv, true)).toThrow(
        "Invalid environment variables",
      );
      expect(errorSpy).toHaveBeenCalledWith(
        "❌ Invalid environment variables:",
        expect.any(Object),
      );

      errorSpy.mockRestore();
    });

    it("throws when DATABASE_URL is not a valid URL", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const invalidEnv = { ...validServerEnv, DATABASE_URL: "not-a-valid-url" };

      expect(() => validateEnv(invalidEnv, true)).toThrow(
        "Invalid environment variables",
      );

      errorSpy.mockRestore();
    });

    it("throws when NODE_ENV is not an accepted environment enum", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const invalidEnv = { ...validServerEnv, NODE_ENV: "staging" };

      expect(() => validateEnv(invalidEnv, true)).toThrow(
        "Invalid environment variables",
      );

      errorSpy.mockRestore();
    });
  });

  describe("client validation", () => {
    it("validates client environment without requiring server secrets", () => {
      const parsed = validateEnv(validClientEnv, false);

      expect(parsed.NEXT_PUBLIC_PUSHER_APP_KEY).toBe("public-pusher-key");
      expect(parsed.NEXT_PUBLIC_APP_URL).toBe("https://messaging.example.com");
      expect(parsed.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME).toBe("cloud-name");
      expect(parsed.NEXT_PUBLIC_CLOUDINARY_PRESET).toBe("preset-1");
      expect(parsed.DATABASE_URL).toBeUndefined();
      expect(parsed.BETTER_AUTH_SECRET).toBeUndefined();
    });

    it("accepts empty string for NEXT_PUBLIC_APP_URL", () => {
      const parsed = validateEnv(
        { ...validClientEnv, NEXT_PUBLIC_APP_URL: "" },
        false,
      );
      expect(parsed.NEXT_PUBLIC_APP_URL).toBe("");
    });

    it("throws when required client variable is missing", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const invalidClientEnv = { ...validClientEnv };
      delete (invalidClientEnv as Record<string, unknown>)
        .NEXT_PUBLIC_PUSHER_APP_KEY;

      expect(() => validateEnv(invalidClientEnv, false)).toThrow(
        "Invalid environment variables",
      );

      errorSpy.mockRestore();
    });
  });

  describe("default runtimeEnv parameter", () => {
    it("executes default runtimeEnv branch without crashing", () => {
      const defaultParsed = validateEnv();
      expect(defaultParsed).toBeDefined();
      expect(defaultParsed.NEXT_PUBLIC_PUSHER_APP_KEY).toBeDefined();
    });
  });

  describe("exports and re-exports", () => {
    it("exports singleton env object", () => {
      expect(env).toBeDefined();
      expect(typeof env).toBe("object");
    });

    it("exports CLOUDINARY_CONFIG derived constants", () => {
      expect(CLOUDINARY_CONFIG).toBeDefined();
      expect(CLOUDINARY_CONFIG).toHaveProperty("uploadPreset");
      expect(CLOUDINARY_CONFIG).toHaveProperty("cloudName");
    });

    it("exports raw schemas for external composition", () => {
      expect(clientEnvSchema).toBeDefined();
      expect(serverEnvSchema).toBeDefined();
    });

    it("re-exports all members from libs/env.ts", () => {
      expect(libsEnv.env).toBe(env);
      expect(libsEnv.validateEnv).toBe(validateEnv);
      expect(libsEnv.CLOUDINARY_CONFIG).toBe(CLOUDINARY_CONFIG);
      expect(libsEnv.clientEnvSchema).toBe(clientEnvSchema);
      expect(libsEnv.serverEnvSchema).toBe(serverEnvSchema);
    });
  });
});

