import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma, resetPrismaMocks } from "../mocks/prisma";

vi.mock("@/libs/prismadb", () => ({
  __esModule: true,
  default: mockPrisma,
}));

vi.mock("@/auth", () => ({
  __esModule: true,
  auth: vi.fn(),
}));

import getCurrentUser from "@/actions/getCurrentUser";
import { auth } from "@/auth";

const mockedAuth = auth as unknown as ReturnType<typeof vi.fn>;

describe("getCurrentUser", () => {
  beforeEach(() => {
    resetPrismaMocks();
    mockedAuth.mockReset();
  });

  it("returns null when there is no active session", async () => {
    mockedAuth.mockResolvedValue(null);

    const result = await getCurrentUser();

    expect(result).toBeNull();
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns null when prisma cannot find the user", async () => {
    mockedAuth.mockResolvedValue({ user: { email: "test@example.com" } });
    (mockPrisma.user.findUnique as any).mockResolvedValue(null);

    const result = await getCurrentUser();

    expect(result).toBeNull();
  });

  it("returns the user info when everything succeeds", async () => {
    const mockUser = { id: "user-1", email: "test@example.com" };
    mockedAuth.mockResolvedValue({ user: { email: "test@example.com" } });
    (mockPrisma.user.findUnique as any).mockResolvedValue(mockUser);

    const result = await getCurrentUser();

    expect(result).toEqual(mockUser);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
  });

  it("swallows prisma errors and returns null", async () => {
    mockedAuth.mockResolvedValue({ user: { email: "test@example.com" } });
    (mockPrisma.user.findUnique as any).mockRejectedValue(new Error("db"));

    const result = await getCurrentUser();

    expect(result).toBeNull();
  });
});
