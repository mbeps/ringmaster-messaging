import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = { $connect: vi.fn() };

vi.mock("@/libs/prismadb", () => ({
  __esModule: true,
  default: prismaMock,
}));

const originalEnv = {
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  BETTER_AUTH_TRUSTED_ORIGINS: process.env.BETTER_AUTH_TRUSTED_ORIGINS,
  CLIENT_ID_GITHUB: process.env.CLIENT_ID_GITHUB,
  CLIENT_SECRET_GITHUB: process.env.CLIENT_SECRET_GITHUB,
  CLIENT_ID_GOOGLE: process.env.CLIENT_ID_GOOGLE,
  CLIENT_SECRET_GOOGLE: process.env.CLIENT_SECRET_GOOGLE,
};

describe("lib/auth config", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.BETTER_AUTH_SECRET = "test-secret";
    delete process.env.BETTER_AUTH_URL;
    delete process.env.BETTER_AUTH_TRUSTED_ORIGINS;
    process.env.CLIENT_ID_GITHUB = "gh-id";
    process.env.CLIENT_SECRET_GITHUB = "gh-secret";
    process.env.CLIENT_ID_GOOGLE = "g-id";
    process.env.CLIENT_SECRET_GOOGLE = "g-secret";
  });

  afterAll(() => {
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("exposes the expected betterAuth configuration shape", async () => {
    const { auth } = await import("@/lib/auth");

    expect(auth.options.baseURL).toBe("http://localhost:3000");
    expect(auth.options.secret).toBe("test-secret");
    expect(auth.options.trustedOrigins).toEqual([]);

    expect(auth.options.emailAndPassword).toMatchObject({ enabled: true });

    expect(auth.options.database).toBeDefined();

    const social = auth.options.socialProviders as Record<string, unknown>;
    expect(social.github).toMatchObject({ clientId: "gh-id", clientSecret: "gh-secret" });
    expect(social.google).toMatchObject({ clientId: "g-id", clientSecret: "g-secret" });
  });

  it("uses BETTER_AUTH_URL and trusted origins when provided", async () => {
    process.env.BETTER_AUTH_URL = "https://app.test";
    process.env.BETTER_AUTH_TRUSTED_ORIGINS = "https://a.test, https://b.test";

    const { auth } = await import("@/lib/auth");

    expect(auth.options.baseURL).toBe("https://app.test");
    expect(auth.options.trustedOrigins).toEqual(["https://a.test", " https://b.test"]);
  });

  it("enables user deletion and disables session cookie cache", async () => {
    const { auth } = await import("@/lib/auth");

    expect(auth.options.user?.deleteUser?.enabled).toBe(true);
    expect(auth.options.session?.cookieCache?.enabled).toBe(false);
  });

  it("disables built-in id generation", async () => {
    const { auth } = await import("@/lib/auth");

    expect(
      (auth.options.advanced as { database: { generateId: boolean } }).database
        .generateId
    ).toBe(false);
  });

  it("logs errors to console.error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { auth } = await import("@/lib/auth");

    const log = (auth.options.logger as unknown as {
      log: (level: string, message: string, ...args: unknown[]) => void;
    }).log;
    log("error", "boom");

    expect(errorSpy).toHaveBeenCalledWith("boom");
    errorSpy.mockRestore();
  });

  it("suppresses redirect-shaped errors from the logger", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { auth } = await import("@/lib/auth");

    const log = (auth.options.logger as unknown as {
      log: (level: string, message: string, ...args: unknown[]) => void;
    }).log;
    log("error", "redirect", { status: "FOUND" });
    log("error", "redirect2", { statusCode: 302 });

    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("routes warn/info/debug levels away from console.error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const { auth } = await import("@/lib/auth");

    const log = (auth.options.logger as unknown as {
      log: (level: string, message: string) => void;
    }).log;
    log("warn", "w");
    log("info", "i");
    log("debug", "d");

    expect(warnSpy).toHaveBeenCalledWith("w");
    expect(infoSpy).toHaveBeenCalledWith("i");
    expect(logSpy).toHaveBeenCalledWith("d");
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
    infoSpy.mockRestore();
    logSpy.mockRestore();
  });
});
