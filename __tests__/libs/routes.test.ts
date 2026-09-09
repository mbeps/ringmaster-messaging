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

  it("exposes profile routes", () => {
    expect(ROUTES.PROFILE).toBe("/profile");
    expect(ROUTES.PROFILE_ACCOUNT).toBe("/profile/account");
    expect(ROUTES.PROFILE_SECURITY).toBe("/profile/security");
    expect(ROUTES.PROFILE_SESSIONS).toBe("/profile/sessions");
    expect(ROUTES.PROFILE_ACCOUNTS).toBe("/profile/accounts");
    expect(ROUTES.PROFILE_DANGER).toBe("/profile/danger");
  });

  it("exposes remaining API routes", () => {
    expect(API_ROUTES.MESSAGES).toBe("/api/messages");
    expect(API_ROUTES.SETTINGS).toBe("/api/settings");
    expect(API_ROUTES.ACCOUNT_DELETE).toBe("/api/account/delete");
  });

  it("builds dynamic route helpers from arbitrary ids", () => {
    expect(ROUTES.CONVERSATION_ID("a/b")).toBe("/conversations/a/b");
    expect(API_ROUTES.CONVERSATION_ID("")).toBe("/api/conversations/");
    expect(API_ROUTES.CONVERSATION_SEEN("z-9")).toBe("/api/conversations/z-9/seen");
  });

  it("lists every profile sub-route under the profile parent", () => {
    for (const route of [
      ROUTES.PROFILE_ACCOUNT,
      ROUTES.PROFILE_SECURITY,
      ROUTES.PROFILE_SESSIONS,
      ROUTES.PROFILE_ACCOUNTS,
      ROUTES.PROFILE_DANGER,
    ]) {
      expect(route.startsWith(`${ROUTES.PROFILE}/`)).toBe(true);
    }
  });
});
