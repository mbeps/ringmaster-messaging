import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { User } from "@prisma/client";

const useSessionMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth-client", () => ({
  authClient: { useSession: useSessionMock },
}));

import useOtherUser from "@/hooks/useOtherUser";

const makeUser = (email: string | null): User =>
  ({
    id: email ?? "id",
    email,
    name: email,
    emailVerified: null,
    image: null,
    hashedPassword: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as User;

const users = [makeUser("me@test.com"), makeUser("other@test.com")];

describe("useOtherUser", () => {
  it("returns the user whose email differs from the session user", () => {
    useSessionMock.mockReturnValue({
      data: { user: { email: "me@test.com" } },
    });
    const { result } = renderHook(() => useOtherUser({ users }));
    expect(result.current?.email).toBe("other@test.com");
  });

  it("returns first user when the current user is not in the conversation", () => {
    useSessionMock.mockReturnValue({
      data: { user: { email: "stranger@test.com" } },
    });
    const { result } = renderHook(() => useOtherUser({ users }));
    expect(result.current?.email).toBe("me@test.com");
  });

  it("returns first other user when there is no session", () => {
    useSessionMock.mockReturnValue({ data: null });
    const { result } = renderHook(() => useOtherUser({ users }));
    expect(result.current?.email).toBe("me@test.com");
  });

  it("returns undefined when the conversation only contains the current user", () => {
    useSessionMock.mockReturnValue({
      data: { user: { email: "me@test.com" } },
    });
    const { result } = renderHook(() =>
      useOtherUser({ users: [makeUser("me@test.com")] })
    );
    expect(result.current).toBeUndefined();
  });

  it("returns undefined when users list is empty", () => {
    useSessionMock.mockReturnValue({
      data: { user: { email: "me@test.com" } },
    });
    const { result } = renderHook(() => useOtherUser({ users: [] }));
    expect(result.current).toBeUndefined();
  });
});
