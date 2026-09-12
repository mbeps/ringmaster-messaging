import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma, resetPrismaMocks } from "@/__tests__/helpers/prisma";
import getUserByEmail from "@/actions/user/get-user-by-email";
import getUserById from "@/actions/user/get-user-by-id";

vi.mock("@/utils/prisma/client", () => ({ __esModule: true, default: mockPrisma }));

const findUnique = vi.mocked(mockPrisma.user.findUnique);

describe("actions/user (getUserByEmail, getUserById)", () => {
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
      const user = { id: "u1", email: "a@b.com" };
      findUnique.mockResolvedValue(user as never);

      await expect(getUserById("u1")).resolves.toEqual(user);
      expect(findUnique).toHaveBeenCalledWith({ where: { id: "u1" } });
    });

    it("returns null when not found", async () => {
      findUnique.mockResolvedValue(null);
      await expect(getUserById("u-missing")).resolves.toBeNull();
    });

    it("returns null when prisma throws", async () => {
      findUnique.mockRejectedValue(new Error("db down"));
      await expect(getUserById("u1")).resolves.toBeNull();
    });
  });
});

