import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUserRepository, mockGetCurrentUser } = vi.hoisted(() => ({
  mockUserRepository: {
    update: vi.fn(),
  },
  mockGetCurrentUser: vi.fn(),
}));

vi.mock("@/db/repositories/user-repository", () => ({
  userRepository: mockUserRepository,
}));

vi.mock("@/actions/user/get-current-user", () => ({
  default: (...args: unknown[]) => mockGetCurrentUser(...args),
}));

import { POST } from "@/app/api/settings/route";

const user = { id: "user-1", name: "Old", image: "old.png" };

describe("POST /api/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const res = await POST(
      new Request("http://localhost/api/settings", {
        method: "POST",
        body: JSON.stringify({ name: "New" }),
      })
    );
    expect(res.status).toBe(401);
    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });

  it("returns 400 on validation failure", async () => {
    mockGetCurrentUser.mockResolvedValue(user);
    const res = await POST(
      new Request("http://localhost/api/settings", {
        method: "POST",
        body: JSON.stringify({ name: "" }),
      })
    );
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Name is required");
  });

  it("updates the user and returns it", async () => {
    mockGetCurrentUser.mockResolvedValue(user);
    const updated = { ...user, name: "New", image: "new.png" };
    mockUserRepository.update.mockResolvedValue(updated);

    const res = await POST(
      new Request("http://localhost/api/settings", {
        method: "POST",
        body: JSON.stringify({ name: "New", image: "new.png" }),
      })
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(updated);
    expect(mockUserRepository.update).toHaveBeenCalledWith("user-1", {
      name: "New",
      image: "new.png",
    });
  });

  it("accepts an explicit null image", async () => {
    mockGetCurrentUser.mockResolvedValue(user);
    const updated = { ...user, image: null };
    mockUserRepository.update.mockResolvedValue(updated);

    const res = await POST(
      new Request("http://localhost/api/settings", {
        method: "POST",
        body: JSON.stringify({ name: "New", image: null }),
      })
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(updated);
    expect(mockUserRepository.update).toHaveBeenCalledWith("user-1", {
      name: "New",
      image: null,
    });
  });

  it("returns 500 when repository throws", async () => {
    mockGetCurrentUser.mockResolvedValue(user);
    mockUserRepository.update.mockRejectedValue(new Error("db down"));
    const res = await POST(
      new Request("http://localhost/api/settings", {
        method: "POST",
        body: JSON.stringify({ name: "New" }),
      })
    );
    expect(res.status).toBe(500);
  });
});
