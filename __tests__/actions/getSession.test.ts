import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

import getSession from "@/actions/getSession";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const mockedGetSession = auth.api.getSession as any;

describe("getSession", () => {
  beforeEach(() => {
    mockedGetSession.mockReset();
  });
  it("returns whatever auth.api.getSession() resolves with", async () => {
    const fakeSession = { user: { email: "test@example.com" } };
    mockedGetSession.mockResolvedValue(fakeSession);

    const result = await getSession();

    expect(result).toEqual(fakeSession);
    expect(mockedGetSession).toHaveBeenCalledTimes(1);
  });

  it("returns null when there is no session", async () => {
    mockedGetSession.mockResolvedValue(null);

    const result = await getSession();

    expect(result).toBeNull();
  });

  it("propagates errors from auth.api.getSession", async () => {
    mockedGetSession.mockRejectedValue(new Error("auth failure"));

    await expect(getSession()).rejects.toThrow("auth failure");
  });

  it("passes request headers to auth.api.getSession", async () => {
    const fakeHeaders = new Headers({ cookie: "better-auth.session_token=tok" });
    vi.mocked(headers).mockResolvedValueOnce(fakeHeaders as any);
    mockedGetSession.mockResolvedValue(null);

    await getSession();

    expect(mockedGetSession).toHaveBeenCalledWith({ headers: fakeHeaders });
  });
});
