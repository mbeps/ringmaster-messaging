import { describe, it, expect } from "vitest";
import { ROUTES, API_ROUTES, PROTECTED_ROUTES } from "@/libs/routes";

describe("libs/routes", () => {
  it("exposes UI routes and dynamic helpers", () => {
    expect(ROUTES.AUTH).toBe("/");
    expect(ROUTES.USERS).toBe("/users");
    expect(ROUTES.CONVERSATIONS).toBe("/conversations");
    expect(ROUTES.CONVERSATION_ID("abc")).toBe("/conversations/abc");
  });

  it("exposes API routes and dynamic helpers", () => {
    expect(API_ROUTES.REGISTER).toBe("/api/register");
    expect(API_ROUTES.CONVERSATIONS).toBe("/api/conversations");
    expect(API_ROUTES.CONVERSATION_ID("x")).toBe("/api/conversations/x");
    expect(API_ROUTES.CONVERSATION_SEEN("y")).toBe("/api/conversations/y/seen");
    expect(API_ROUTES.PUSHER_AUTH).toBe("/api/pusher/auth");
  });

  it("provides protected routes", () => {
    expect(Array.isArray(PROTECTED_ROUTES)).toBe(true);
    expect(PROTECTED_ROUTES).toContain(ROUTES.USERS);
    expect(PROTECTED_ROUTES).toContain(ROUTES.CONVERSATIONS);
  });
});
