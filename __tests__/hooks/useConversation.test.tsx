import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

const { mockParams, useParamsMock } = vi.hoisted(() => {
  const mockParams = { conversationId: undefined as string | string[] | undefined };
  const useParamsMock = vi.fn(() => mockParams);
  return { mockParams, useParamsMock };
});

vi.mock("next/navigation", () => ({
  useParams: useParamsMock,
}));

import useConversation from "@/hooks/useConversation";

describe("useConversation", () => {
  it("returns empty state when there is no conversationId param", () => {
    mockParams.conversationId = undefined;
    const { result } = renderHook(() => useConversation());
    expect(result.current).toEqual({ isOpen: false, conversationId: "" });
  });

  it("returns isOpen true and the id when params has conversationId", () => {
    mockParams.conversationId = "abc-123";
    const { result } = renderHook(() => useConversation());
    expect(result.current).toEqual({ isOpen: true, conversationId: "abc-123" });
  });

  it("treats null params as closed", () => {
    // hook guards with `params?.conversationId`
    const params = null as unknown as Record<string, string>;
    useParamsMock.mockReturnValueOnce(params);
    const { result } = renderHook(() => useConversation());
    expect(result.current).toEqual({ isOpen: false, conversationId: "" });
  });
});

