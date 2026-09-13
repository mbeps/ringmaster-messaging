import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockConversationRepository, mockLog } = vi.hoisted(() => ({
  mockConversationRepository: {
    findById: vi.fn(),
  },
  mockLog: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/db/repositories/conversation-repository", () => ({
  conversationRepository: mockConversationRepository,
}));

vi.mock("@/actions/user/get-current-user", () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  getLogger: () => mockLog,
}));

import getConversationById from "@/actions/conversation/get-conversation-by-id";
import getCurrentUser from "@/actions/user/get-current-user";

type MockedFn = ReturnType<typeof vi.fn>;
const mockedGetCurrentUser = getCurrentUser as unknown as MockedFn;

describe("getConversationById", () => {
  beforeEach(() => {
    mockConversationRepository.findById.mockReset();
    mockedGetCurrentUser.mockReset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when the user is not authenticated", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    const result = await getConversationById("test-id");

    expect(result).toBeNull();
    expect(mockConversationRepository.findById).not.toHaveBeenCalled();
  });

  it("returns the conversation when the user is authenticated", async () => {
    const mockConversation = { id: "abc", users: [] };
    mockedGetCurrentUser.mockResolvedValue({ email: "user@test.com" });
    mockConversationRepository.findById.mockResolvedValue(mockConversation);

    const result = await getConversationById("abc");

    expect(result).toEqual(mockConversation);
    expect(mockConversationRepository.findById).toHaveBeenCalledWith("abc");
  });

  it("returns null and logs when repository throws", async () => {
    mockedGetCurrentUser.mockResolvedValue({ email: "user@test.com" });
    mockConversationRepository.findById.mockRejectedValue(
      new Error("db error")
    );

    const result = await getConversationById("abc");

    expect(result).toBeNull();
    expect(mockLog.error).toHaveBeenCalledWith(
      "Failed to fetch conversation by ID (id: {conversationId}): {error}",
      {
        conversationId: "abc",
        error: new Error("db error"),
      },
    );
  });

  it("rethrows dynamic server errors via unstable_rethrow", async () => {
    mockedGetCurrentUser.mockResolvedValue({ email: "user@test.com" });
    const dynamicError = new Error("Dynamic server usage");
    (dynamicError as any).digest = "DYNAMIC_SERVER_USAGE";
    mockConversationRepository.findById.mockRejectedValue(dynamicError);

    await expect(getConversationById("abc")).rejects.toThrow("Dynamic server usage");
  });
});
