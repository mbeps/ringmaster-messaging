import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma, resetPrismaMocks } from "../mocks/prisma";

vi.mock("@/libs/prismadb", () => ({
  __esModule: true,
  default: mockPrisma,
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

import getCurrentUser from "@/actions/getCurrentUser";
import { auth } from "@/lib/auth";

const mockedGetSession = auth.api.getSession as any;

describe("getCurrentUser", () => {
  beforeEach(() => {
    resetPrismaMocks();
    mockedGetSession.mockReset();
  });

  it("returns null when there is no active session", async () => {
    mockedGetSession.mockResolvedValue(null);

    const result = await getCurrentUser();

    expect(result).toBeNull();
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns null when prisma cannot find the user", async () => {
    mockedGetSession.mockResolvedValue({ user: { email: "test@example.com" } });
    (mockPrisma.user.findUnique as any).mockResolvedValue(null);

    const result = await getCurrentUser();

    expect(result).toBeNull();
  });

  it("returns the user info when everything succeeds", async () => {
    const mockUser = { id: "user-1", email: "test@example.com" };
    mockedGetSession.mockResolvedValue({ user: { email: "test@example.com" } });
    (mockPrisma.user.findUnique as any).mockResolvedValue(mockUser);

    const result = await getCurrentUser();

    expect(result).toEqual(mockUser);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
  });

  it("swallows prisma errors and returns null", async () => {
    mockedGetSession.mockResolvedValue({ user: { email: "test@example.com" } });
    (mockPrisma.user.findUnique as any).mockRejectedValue(new Error("db"));

    const result = await getCurrentUser();

    expect(result).toBeNull();
  });
});
