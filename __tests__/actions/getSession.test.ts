import { describe, expect, it, vi } from "vitest";

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

const mockedGetSession = auth.api.getSession as any;

describe("getSession", () => {
  it("returns whatever auth.api.getSession() resolves with", async () => {
    const fakeSession = { user: { email: "test@example.com" } };
    mockedGetSession.mockResolvedValue(fakeSession);

    const result = await getSession();

    expect(result).toEqual(fakeSession);
    expect(mockedGetSession).toHaveBeenCalledTimes(1);
  });
});
