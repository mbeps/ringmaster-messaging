import { describe, expect, it, beforeEach, vi } from "vitest";

const { mockConversationRepository } = vi.hoisted(() => ({
  mockConversationRepository: {
    findForUser: vi.fn(),
  },
}));

vi.mock("@/db/repositories/conversation-repository", () => ({
  conversationRepository: mockConversationRepository,
}));

vi.mock("@/actions/user/get-current-user", () => ({
  __esModule: true,
  default: vi.fn(),
}));

import getConversations from "@/actions/conversation/get-conversations";
import getCurrentUser from "@/actions/user/get-current-user";

type MockedFn = ReturnType<typeof vi.fn>;
const mockedGetCurrentUser = getCurrentUser as unknown as MockedFn;

describe("getConversations", () => {
  beforeEach(() => {
    mockConversationRepository.findForUser.mockReset();
    mockedGetCurrentUser.mockReset();
    vi.clearAllMocks();
  });

  it("returns an empty array when the user is missing", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    const result = await getConversations();

    expect(result).toEqual([]);
    expect(mockConversationRepository.findForUser).not.toHaveBeenCalled();
  });

  it("returns conversations when the user exists", async () => {
    const mockConversations = [{ id: "1" }];
    mockedGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockConversationRepository.findForUser.mockResolvedValue(
      mockConversations
    );

    const result = await getConversations();

    expect(result).toEqual(mockConversations);
    expect(mockConversationRepository.findForUser).toHaveBeenCalledWith("user-1");
  });

  it("returns an empty array when repository throws", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockConversationRepository.findForUser.mockRejectedValue(
      new Error("db")
    );

    const result = await getConversations();

    expect(result).toEqual([]);
  });

  it("returns an empty array when the user has no id", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "" });

    const result = await getConversations();

    expect(result).toEqual([]);
    expect(mockConversationRepository.findForUser).not.toHaveBeenCalled();
  });

  it("returns an empty array when getCurrentUser resolves to an object without id", async () => {
    mockedGetCurrentUser.mockResolvedValue({ email: "x@test.com" });

    const result = await getConversations();

    expect(result).toEqual([]);
    expect(mockConversationRepository.findForUser).not.toHaveBeenCalled();
  });

  it("queries conversations for user", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "user-9" });
    mockConversationRepository.findForUser.mockResolvedValue([]);

    await getConversations();

    expect(mockConversationRepository.findForUser).toHaveBeenCalledWith("user-9");
  });

  it("returns an empty array when the user has no conversations", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockConversationRepository.findForUser.mockResolvedValue([]);

    const result = await getConversations();

    expect(result).toEqual([]);
  });
});
