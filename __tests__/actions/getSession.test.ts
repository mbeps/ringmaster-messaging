import { describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  __esModule: true,
  auth: vi.fn(),
}));

import getSession from "@/actions/getSession";
import { auth } from "@/auth";

const mockedAuth = auth as unknown as ReturnType<typeof vi.fn>;

describe("getSession", () => {
  it("returns whatever auth() resolves with", async () => {
    const fakeSession = { user: { email: "test@example.com" } };
    mockedAuth.mockResolvedValue(fakeSession);

    const result = await getSession();

    expect(result).toEqual(fakeSession);
    expect(mockedAuth).toHaveBeenCalledTimes(1);
  });
});
