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
import { headers } from "next/headers";

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

  it("returns null when the session user has no email", async () => {
    mockedGetSession.mockResolvedValue({ user: {} });

    const result = await getCurrentUser();

    expect(result).toBeNull();
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns null when the session has no user at all", async () => {
    mockedGetSession.mockResolvedValue({});

    const result = await getCurrentUser();

    expect(result).toBeNull();
  });

  it("passes request headers to auth.api.getSession", async () => {
    const fakeHeaders = new Headers({ "x-test": "1" });
    vi.mocked(headers).mockResolvedValueOnce(fakeHeaders as any);
    mockedGetSession.mockResolvedValue(null);

    await getCurrentUser();

    expect(mockedGetSession).toHaveBeenCalledWith({ headers: fakeHeaders });
  });

  it("rethrows dynamic server errors via unstable_rethrow", async () => {
    const dynamicError = new Error("Dynamic server usage");
    (dynamicError as any).digest = "DYNAMIC_SERVER_USAGE";
    mockedGetSession.mockRejectedValue(dynamicError);

    await expect(getCurrentUser()).rejects.toThrow("Dynamic server usage");
  });
});
