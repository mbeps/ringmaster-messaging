import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma, resetPrismaMocks } from "../mocks/prisma";
import { getUserByEmail, getUserById } from "@/data/user";

vi.mock("@/libs/prismadb", () => ({ __esModule: true, default: mockPrisma }));

const findUnique = vi.mocked(mockPrisma.user.findUnique);

describe("data/user", () => {
  beforeEach(() => resetPrismaMocks());

  describe("getUserByEmail", () => {
    it("returns user for exact query shape", async () => {
      const user = { id: "u1", email: "a@b.com" };
      findUnique.mockResolvedValue(user as never);

      await expect(getUserByEmail("a@b.com")).resolves.toEqual(user);
      expect(findUnique).toHaveBeenCalledWith({ where: { email: "a@b.com" } });
    });

    it("returns null when not found", async () => {
      findUnique.mockResolvedValue(null);
      await expect(getUserByEmail("missing@b.com")).resolves.toBeNull();
    });

    it("returns null when prisma throws", async () => {
      findUnique.mockRejectedValue(new Error("db down"));
      await expect(getUserByEmail("a@b.com")).resolves.toBeNull();
    });
  });

  describe("getUserById", () => {
    it("returns user for exact query shape", async () => {
      const user = { id: "u2", email: "b@b.com" };
      findUnique.mockResolvedValue(user as never);

      await expect(getUserById("u2")).resolves.toEqual(user);
      expect(findUnique).toHaveBeenCalledWith({ where: { id: "u2" } });
    });

    it("returns null when not found or prisma throws", async () => {
      findUnique.mockResolvedValue(null);
      await expect(getUserById("nope")).resolves.toBeNull();

      findUnique.mockRejectedValue(new Error("db down"));
      await expect(getUserById("u2")).resolves.toBeNull();
    });

    it("does not swallow the resolved user shape", async () => {
      const user = { id: "u3", email: "c@b.com", name: "C" };
      findUnique.mockResolvedValue(user as never);

      const result = await getUserById("u3");
      expect(result).toEqual(user);
      expect(result).toHaveProperty("id", "u3");
    });
  });

  it("never calls other prisma operations", async () => {
    findUnique.mockResolvedValue(null);
    await getUserByEmail("a@b.com");
    await getUserById("u1");

    expect(mockPrisma.user.findMany).not.toHaveBeenCalled();
  });
});
