import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const createAuthClient = vi.fn(() => ({}));

vi.mock("better-auth/react", () => ({
  createAuthClient,
}));

const originalEnv = process.env.NEXT_PUBLIC_APP_URL;

describe("lib/auth-client", () => {
  beforeEach(() => {
    vi.resetModules();
    createAuthClient.mockClear();
  });

  afterAll(() => {
    if (originalEnv === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = originalEnv;
  });

  it("creates the client with the configured baseURL", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://app.test";
    await import("@/lib/auth-client");

    expect(createAuthClient).toHaveBeenCalledWith({ baseURL: "http://app.test" });
  });

  it("passes undefined baseURL when env is unset", async () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    await import("@/lib/auth-client");

    expect(createAuthClient).toHaveBeenCalledWith({ baseURL: undefined });
  });
});
