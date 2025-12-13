import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaInstances: Array<Record<string, unknown>> = [];
const PrismaClientMock = vi.fn(function PrismaClientStub(this: Record<string, unknown>) {
  this.id = Symbol("prisma");
  prismaInstances.push(this);
});

vi.mock("@prisma/client", () => ({
  PrismaClient: PrismaClientMock,
}));

describe("libs/prismadb", () => {
  beforeEach(() => {
    vi.resetModules();
    PrismaClientMock.mockClear();
    prismaInstances.length = 0;
    // @ts-expect-error - tests manage the prisma global
    delete globalThis.prisma;
    process.env.NODE_ENV = "test";
  });

  it("creates and caches a prisma client in non-production environments", async () => {
    const { default: client } = await import("@/libs/prismadb");

    expect(PrismaClientMock).toHaveBeenCalledTimes(1);
    expect(client).toBe(prismaInstances[0]);
    expect(globalThis.prisma).toBe(client);
  });

  it("reuses the cached prisma client when it exists", async () => {
    const cachedClient = { id: Symbol("cached") };
    // @ts-expect-error - tests manage the prisma global
    globalThis.prisma = cachedClient;

    const { default: client } = await import("@/libs/prismadb");

    expect(client).toBe(cachedClient);
    expect(PrismaClientMock).not.toHaveBeenCalled();
  });

  it("does not leak the client to the global scope in production", async () => {
    process.env.NODE_ENV = "production";
    const { default: client } = await import("@/libs/prismadb");

    expect(client).toBe(prismaInstances[0]);
    expect(globalThis.prisma).toBeUndefined();
  });
});
