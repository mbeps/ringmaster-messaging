import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma, resetPrismaMocks } from "../mocks/prisma";

vi.mock("@/libs/prismadb", () => ({
  __esModule: true,
  default: mockPrisma,
}));

vi.mock("@/actions/getSession", () => ({
  __esModule: true,
  default: vi.fn(),
}));

import getUsers from "@/actions/getUsers";
import getSession from "@/actions/getSession";

type MockedFn = ReturnType<typeof vi.fn>;
const mockedGetSession = getSession as unknown as MockedFn;

describe("getUsers", () => {
  beforeEach(() => {
    resetPrismaMocks();
    mockedGetSession.mockReset();
  });

  it("returns an empty array when the user is not logged in", async () => {
    mockedGetSession.mockResolvedValue(null);

    const result = await getUsers();

    expect(result).toEqual([]);
    expect(mockPrisma.user.findMany).not.toHaveBeenCalled();
  });

  it("returns users when the user is logged in", async () => {
    const mockUsers = [{ id: "user-1" }];
    mockedGetSession.mockResolvedValue({ user: { email: "me@example.com" } });
    (mockPrisma.user.findMany as any).mockResolvedValue(mockUsers);

    const result = await getUsers();

    expect(result).toEqual(mockUsers);
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
      where: { NOT: { email: "me@example.com" } },
    });
  });

  it("returns an empty array when prisma throws", async () => {
    mockedGetSession.mockResolvedValue({ user: { email: "me@example.com" } });
    (mockPrisma.user.findMany as any).mockRejectedValue(new Error("db"));

    const result = await getUsers();

    expect(result).toEqual([]);
  });
});
