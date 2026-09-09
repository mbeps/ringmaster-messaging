import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

const { mockAuthorizeChannel } = vi.hoisted(() => ({ mockAuthorizeChannel: vi.fn() }));
vi.mock("@/libs/pusher", () => ({
  pusherServer: { authorizeChannel: mockAuthorizeChannel },
}));

import { POST } from "@/app/api/pusher/auth/route";
import { auth } from "@/lib/auth";

const mockedGetSession = auth.api.getSession as ReturnType<typeof vi.fn>;

const post = (body?: string) =>
  POST(
    new Request("http://localhost/api/pusher/auth", {
      method: "POST",
      headers: body ? { "content-type": "application/x-www-form-urlencoded" } : {},
      body,
    }) as never
  );

describe("POST /api/pusher/auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when there is no session", async () => {
    mockedGetSession.mockResolvedValue(null);
    const res = await post("socket_id=1.1&channel_name=private-c1");
    expect(res.status).toBe(401);
    expect(mockAuthorizeChannel).not.toHaveBeenCalled();
  });

  it("returns 401 when the session has no email", async () => {
    mockedGetSession.mockResolvedValue({ user: {} });
    const res = await post("socket_id=1.1&channel_name=private-c1");
    expect(res.status).toBe(401);
    expect(mockAuthorizeChannel).not.toHaveBeenCalled();
  });

  it("returns 400 when socket_id or channel_name is missing", async () => {
    mockedGetSession.mockResolvedValue({
      user: { email: "me@test.com" },
    });
    const res = await post("socket_id=1.1");
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Missing required parameters");
  });

  it("authorizes the channel with the session email as user_id", async () => {
    mockedGetSession.mockResolvedValue({
      user: { email: "me@test.com" },
    });
    const authResponse = { auth: "token" };
    mockAuthorizeChannel.mockReturnValue(authResponse);

    const res = await post("socket_id=123.456&channel_name=private-c1");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(authResponse);
    expect(mockAuthorizeChannel).toHaveBeenCalledWith(
      "123.456",
      "private-c1",
      { user_id: "me@test.com" }
    );
  });

  it("returns 500 when authorizeChannel throws", async () => {
    mockedGetSession.mockResolvedValue({
      user: { email: "me@test.com" },
    });
    mockAuthorizeChannel.mockImplementation(() => {
      throw new Error("pusher down");
    });
    const res = await post("socket_id=1&channel_name=private-c1");
    expect(res.status).toBe(500);
  });
});
