import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma } from "../mocks/prisma";

// settings route needs user.update which the shared mock lacks
(mockPrisma.user as Record<string, unknown>).update = vi.fn();

vi.mock("@/libs/prismadb", () => ({ __esModule: true, default: mockPrisma }));

const mockGetCurrentUser = vi.fn();
vi.mock("@/actions/getCurrentUser", () => ({
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
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
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
    (mockPrisma.user.update as ReturnType<typeof vi.fn>).mockResolvedValue(
      updated
    );

    const res = await POST(
      new Request("http://localhost/api/settings", {
        method: "POST",
        body: JSON.stringify({ name: "New", image: "new.png" }),
      })
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(updated);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { name: "New", image: "new.png" },
    });
  });

  it("accepts an explicit null image", async () => {
    mockGetCurrentUser.mockResolvedValue(user);
    const updated = { ...user, image: null };
    (mockPrisma.user.update as ReturnType<typeof vi.fn>).mockResolvedValue(
      updated
    );

    const res = await POST(
      new Request("http://localhost/api/settings", {
        method: "POST",
        body: JSON.stringify({ name: "New", image: null }),
      })
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(updated);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { name: "New", image: null },
    });
  });

  it("returns 500 when prisma throws", async () => {
    mockGetCurrentUser.mockResolvedValue(user);
    (mockPrisma.user.update as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("db down")
    );
    const res = await POST(
      new Request("http://localhost/api/settings", {
        method: "POST",
        body: JSON.stringify({ name: "New" }),
      })
    );
    expect(res.status).toBe(500);
  });
});
