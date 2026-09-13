import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUserRepository } = vi.hoisted(() => ({
  mockUserRepository: {
    findByEmail: vi.fn(),
  },
}));

vi.mock("@/db/repositories/user-repository", () => ({
  userRepository: mockUserRepository,
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

import getCurrentUser from "@/actions/user/get-current-user";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type MockedFn = ReturnType<typeof vi.fn>;
const mockedGetSession = auth.api.getSession as unknown as MockedFn;

describe("getCurrentUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when there is no active session", async () => {
    mockedGetSession.mockResolvedValue(null);

    const result = await getCurrentUser();

    expect(result).toBeNull();
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
  });

  it("returns null when repository cannot find the user", async () => {
    mockedGetSession.mockResolvedValue({ user: { email: "test@example.com" } });
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const result = await getCurrentUser();

    expect(result).toBeNull();
  });

  it("returns the user info when everything succeeds", async () => {
    const mockUser = { id: "user-1", email: "test@example.com" };
    mockedGetSession.mockResolvedValue({ user: { email: "test@example.com" } });
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);

    const result = await getCurrentUser();

    expect(result).toEqual(mockUser);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("test@example.com");
  });

  it("swallows repository errors and returns null", async () => {
    mockedGetSession.mockResolvedValue({ user: { email: "test@example.com" } });
    mockUserRepository.findByEmail.mockRejectedValue(new Error("db"));

    const result = await getCurrentUser();

    expect(result).toBeNull();
  });

  it("returns null when the session user has no email", async () => {
    mockedGetSession.mockResolvedValue({ user: {} });

    const result = await getCurrentUser();

    expect(result).toBeNull();
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
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
