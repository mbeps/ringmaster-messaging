// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePathname } from "next/navigation";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("@/hooks/useConversation", () => ({
  default: vi.fn(),
}));

import useRoutes from "@/hooks/useRoutes";
import useConversation from "@/hooks/useConversation";
import { ROUTES } from "@/libs/routes";

const usePathnameMock = vi.mocked(usePathname);
const useConversationMock = vi.mocked(useConversation);

describe("useRoutes", () => {
  it("returns two routes with correct labels and hrefs", () => {
    usePathnameMock.mockReturnValue(ROUTES.CONVERSATIONS.path);
    useConversationMock.mockReturnValue({
      isOpen: false,
      conversationId: "",
    });
    const { result } = renderHook(() => useRoutes());
    expect(
      result.current.map((r) => ({ label: r.label, href: r.href }))
    ).toEqual([
      { label: "Chat", href: ROUTES.CONVERSATIONS.path },
      { label: "Users", href: ROUTES.USERS.path },
    ]);
  });

  it("marks Chat active on the conversations pathname", () => {
    usePathnameMock.mockReturnValue(ROUTES.CONVERSATIONS.path);
    useConversationMock.mockReturnValue({
      isOpen: false,
      conversationId: "",
    });
    const { result } = renderHook(() => useRoutes());
    expect(result.current[0].active).toBe(true);
    expect(result.current[1].active).toBe(false);
  });

  it("marks Chat active when a conversation is open regardless of pathname", () => {
    usePathnameMock.mockReturnValue("/somewhere-else");
    useConversationMock.mockReturnValue({
      isOpen: true,
      conversationId: "abc",
    });
    const { result } = renderHook(() => useRoutes());
    expect(result.current[0].active).toBe(true);
    expect(result.current[1].active).toBe(false);
  });

  it("marks Users active only on the users pathname", () => {
    usePathnameMock.mockReturnValue(ROUTES.USERS.path);
    useConversationMock.mockReturnValue({
      isOpen: false,
      conversationId: "",
    });
    const { result } = renderHook(() => useRoutes());
    expect(result.current[0].active).toBe(false);
    expect(result.current[1].active).toBe(true);
  });

  it("has no route active on unrelated pathnames", () => {
    usePathnameMock.mockReturnValue(ROUTES.PROFILE.path);
    useConversationMock.mockReturnValue({
      isOpen: false,
      conversationId: "",
    });
    const { result } = renderHook(() => useRoutes());
    expect(result.current.every((r) => !r.active)).toBe(true);
  });
});
