import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const serverCtor = vi.fn(function ServerMock(this: Record<string, unknown>, options) {
  this.options = options;
});
const clientCtor = vi.fn(function ClientMock(
  this: Record<string, unknown>,
  key: string,
  options: unknown,
) {
  this.key = key;
  this.options = options;
  this.subscribe = vi.fn(function (this: unknown) {
    return this;
  });
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

  it("wires up the server instance with secure defaults without eagerly instantiating the client", async () => {
    const pusherModule = await import("@/libs/pusher");

    expect(serverCtor).toHaveBeenCalledWith({
      appId: "app-id",
      key: "public-key",
      secret: "secret",
      cluster: "eu",
      useTLS: true,
    });
    expect(pusherModule.pusherServer).toMatchObject({
      options: {
        appId: "app-id",
        key: "public-key",
        secret: "secret",
        cluster: "eu",
        useTLS: true,
      },
    });
    expect(clientCtor).not.toHaveBeenCalled();
  });

  it("configures the client instance for browser usage on property access and reuses singleton", async () => {
    const [{ API_ROUTES }, pusherModule] = await Promise.all([
      import("@/libs/routes"),
      import("@/libs/pusher"),
    ]);

    expect(clientCtor).not.toHaveBeenCalled();

    // Property access on proxy triggers lazy instantiation (testing property read branch)
    expect(pusherModule.pusherClient.key).toBe("public-key");
    expect(clientCtor).toHaveBeenCalledTimes(1);
    expect(clientCtor).toHaveBeenCalledWith("public-key", {
      channelAuthorization: {
        endpoint: API_ROUTES.PUSHER.auth,
        transport: "ajax",
      },
      cluster: "eu",
    });

    expect(pusherModule.getPusherClient()).toMatchObject({
      key: "public-key",
      options: {
        channelAuthorization: {
          endpoint: API_ROUTES.PUSHER.auth,
          transport: "ajax",
        },
        cluster: "eu",
      },
    });

    // Method invocation triggers value.bind(instance) branch and reuses singleton
    pusherModule.pusherClient.subscribe("test-channel");
    expect(clientCtor).toHaveBeenCalledTimes(1);
  });

  it("throws when instantiated or accessed on the server when window is undefined", async () => {
    const pusherModule = await import("@/libs/pusher");
    const originalWindow = globalThis.window;
    try {
      // @ts-expect-error simulating server environment where window is undefined
      delete (globalThis as { window?: unknown }).window;

      expect(() => pusherModule.getPusherClient()).toThrow(
        "PusherClient cannot be instantiated on the server.",
      );
      expect(() => pusherModule.pusherClient.key).toThrow(
        "PusherClient cannot be instantiated on the server.",
      );
    } finally {
      globalThis.window = originalWindow;
    }
  });
});
