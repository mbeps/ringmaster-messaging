import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUserRepository } = vi.hoisted(() => ({
  mockUserRepository: {
    findManyExcludingEmail: vi.fn(),
  },
}));

vi.mock("@/db/repositories/user-repository", () => ({
  userRepository: mockUserRepository,
}));

vi.mock("@/actions/auth/get-session", () => ({
  __esModule: true,
  default: vi.fn(),
}));

import getUsers from "@/actions/user/get-users";
import getSession from "@/actions/auth/get-session";

type MockedFn = ReturnType<typeof vi.fn>;
const mockedGetSession = getSession as unknown as MockedFn;

describe("getUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an empty array when the user is not logged in", async () => {
    mockedGetSession.mockResolvedValue(null);

    const result = await getUsers();

    expect(result).toEqual([]);
    expect(mockUserRepository.findManyExcludingEmail).not.toHaveBeenCalled();
  });

  it("returns users when the user is logged in", async () => {
    const mockUsers = [{ id: "user-1" }];
    mockedGetSession.mockResolvedValue({ user: { email: "me@example.com" } });
    mockUserRepository.findManyExcludingEmail.mockResolvedValue(mockUsers);

    const result = await getUsers();

    expect(result).toEqual(mockUsers);
    expect(mockUserRepository.findManyExcludingEmail).toHaveBeenCalledWith("me@example.com");
  });

  it("returns an empty array when repository throws", async () => {
    mockedGetSession.mockResolvedValue({ user: { email: "me@example.com" } });
    mockUserRepository.findManyExcludingEmail.mockRejectedValue(new Error("db"));

    const result = await getUsers();

    expect(result).toEqual([]);
  });

  it("returns an empty array when the session user has no email", async () => {
    mockedGetSession.mockResolvedValue({ user: {} });

    const result = await getUsers();

    expect(result).toEqual([]);
    expect(mockUserRepository.findManyExcludingEmail).not.toHaveBeenCalled();
  });

  it("excludes the current user's email from the query", async () => {
    mockedGetSession.mockResolvedValue({ user: { email: "me@example.com" } });
    mockUserRepository.findManyExcludingEmail.mockResolvedValue([]);

    await getUsers();

    expect(mockUserRepository.findManyExcludingEmail).toHaveBeenCalledWith("me@example.com");
  });
});
