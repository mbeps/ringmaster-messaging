import { describe, expect, it } from "vitest";
import { API_ROUTES, ROUTES } from "@/libs/routes";

describe("libs/routes", () => {
  it("exposes UI routes and dynamic helpers", () => {
    expect(ROUTES.AUTH.path).toBe("/");
    expect(ROUTES.USERS.path).toBe("/users");
    expect(ROUTES.CONVERSATIONS.path).toBe("/conversations");
    expect(ROUTES.CONVERSATIONS.detail("abc")).toBe("/conversations/abc");
  });

  it("exposes API routes and dynamic helpers", () => {
    expect(API_ROUTES.CONVERSATIONS.path).toBe("/api/conversations");
    expect(API_ROUTES.CONVERSATIONS.detail("x")).toBe("/api/conversations/x");
    expect(API_ROUTES.CONVERSATIONS.seen("y")).toBe("/api/conversations/y/seen");
    expect(API_ROUTES.MESSAGES.path).toBe("/api/messages");
    expect(API_ROUTES.SETTINGS.path).toBe("/api/settings");
    expect(API_ROUTES.PUSHER.auth).toBe("/api/pusher/auth");
    expect(API_ROUTES.ACCOUNT.delete).toBe("/api/account/delete");
  });

  it("exposes profile routes", () => {
    expect(ROUTES.PROFILE.path).toBe("/profile");
    expect(ROUTES.PROFILE.account).toBe("/profile/account");
    expect(ROUTES.PROFILE.security).toBe("/profile/security");
    expect(ROUTES.PROFILE.sessions).toBe("/profile/sessions");
    expect(ROUTES.PROFILE.accounts).toBe("/profile/accounts");
    expect(ROUTES.PROFILE.danger).toBe("/profile/danger");
  });

  it("builds dynamic route helpers from arbitrary ids", () => {
    expect(ROUTES.CONVERSATIONS.detail("a/b")).toBe("/conversations/a/b");
    expect(API_ROUTES.CONVERSATIONS.detail("")).toBe("/api/conversations/");
    expect(API_ROUTES.CONVERSATIONS.seen("z-9")).toBe("/api/conversations/z-9/seen");
  });

  it("lists every profile sub-route under the profile parent", () => {
    for (const route of [
      ROUTES.PROFILE.account,
      ROUTES.PROFILE.security,
      ROUTES.PROFILE.sessions,
      ROUTES.PROFILE.accounts,
      ROUTES.PROFILE.danger,
    ]) {
      expect(route.startsWith(`${ROUTES.PROFILE.path}/`)).toBe(true);
    }
  });
});
