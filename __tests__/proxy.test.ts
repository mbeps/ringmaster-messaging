import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import middleware, { config } from "@/proxy";

function request(pathname: string, cookie?: string): NextRequest {
  const req = new NextRequest(`http://localhost:3000${pathname}`);
  if (cookie) req.cookies.set(cookie.name, cookie.value);
  return req;
}

describe("proxy middleware", () => {
  it("matches users and conversations routes", () => {
    expect(config.matcher).toEqual(["/users/:path*", "/conversations/:path*"]);
  });

  it("redirects unauthenticated requests on protected paths to /", () => {
    for (const path of ["/users", "/users/abc", "/conversations", "/conversations/c1", "/profile", "/profile/account"]) {
      const res = middleware(request(path));
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe("http://localhost:3000/");
    }
  });

  it("passes through authenticated requests on protected paths", () => {
    const res = middleware(request("/users", { name: "better-auth.session_token", value: "tok" }));
    expect(res.headers.get("location")).toBeNull();
  });

  it("accepts the secure session token cookie variant", () => {
    const res = middleware(request("/conversations/x", {
      name: "__Secure-better-auth.session_token",
      value: "tok",
    }));
    expect(res.headers.get("location")).toBeNull();
  });

  it("passes through unauthenticated requests on unprotected paths", () => {
    for (const path of ["/", "/api/messages", "/api/register"]) {
      const res = middleware(request(path));
      expect(res.headers.get("location")).toBeNull();
    }
  });

  it("redirects to the AUTH route constant", () => {
    const res = middleware(request("/users"));
    expect(new URL(res.headers.get("location")!).pathname).toBe("/");
  });

  it("preserves the original URL origin in the redirect", () => {
    const req = new NextRequest("https://example.com/users");
    const res = middleware(req);
    expect(res.headers.get("location")).toBe("https://example.com/");
  });

  it("does not match path prefixes that merely start with a protected name", () => {
    const res = middleware(request("/users-extra"));
    expect(res.headers.get("location")).toBeNull();
  });

  it("treats an empty session token cookie as logged in (presence check only)", () => {
    const res = middleware(request("/users", { name: "better-auth.session_token", value: "" }));
    expect(res.headers.get("location")).toBeNull();
  });

  it("allows authenticated access to nested conversation routes", () => {
    const res = middleware(request("/conversations/c1/messages", {
      name: "better-auth.session_token",
      value: "tok",
    }));
    expect(res.headers.get("location")).toBeNull();
  });
});
