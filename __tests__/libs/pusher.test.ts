import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const serverCtor = vi.fn(function ServerMock(this: Record<string, unknown>, options) {
  this.options = options;
});
const clientCtor = vi.fn(function ClientMock(this: Record<string, unknown>, key, options) {
  this.key = key;
  this.options = options;
});

vi.mock("pusher", () => ({
  __esModule: true,
  default: serverCtor,
}));

vi.mock("pusher-js", () => ({
  __esModule: true,
  default: clientCtor,
}));

const originalEnv = {
  PUSHER_APP_ID: process.env.PUSHER_APP_ID,
  NEXT_PUBLIC_PUSHER_APP_KEY: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
  PUSHER_SECRET: process.env.PUSHER_SECRET,
};

describe("libs/pusher", () => {
  beforeEach(() => {
    vi.resetModules();
    serverCtor.mockClear();
    clientCtor.mockClear();
    process.env.PUSHER_APP_ID = "app-id";
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY = "public-key";
    process.env.PUSHER_SECRET = "secret";
  });

  afterAll(() => {
    process.env.PUSHER_APP_ID = originalEnv.PUSHER_APP_ID;
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY = originalEnv.NEXT_PUBLIC_PUSHER_APP_KEY;
    process.env.PUSHER_SECRET = originalEnv.PUSHER_SECRET;
  });

  it("wires up the server instance with secure defaults", async () => {
    const module = await import("@/libs/pusher");

    expect(serverCtor).toHaveBeenCalledWith({
      appId: "app-id",
      key: "public-key",
      secret: "secret",
      cluster: "eu",
      useTLS: true,
    });
    expect(module.pusherServer).toMatchObject({
      options: {
        appId: "app-id",
        key: "public-key",
        secret: "secret",
        cluster: "eu",
        useTLS: true,
      },
    });
  });

  it("configures the client instance for browser usage", async () => {
    const module = await import("@/libs/pusher");

    expect(clientCtor).toHaveBeenCalledWith("public-key", {
      channelAuthorization: {
        endpoint: "/api/pusher/auth",
        transport: "ajax",
      },
      cluster: "eu",
    });
    expect(module.pusherClient).toMatchObject({
      key: "public-key",
      options: {
        channelAuthorization: {
          endpoint: "/api/pusher/auth",
          transport: "ajax",
        },
        cluster: "eu",
      },
    });
  });
});
