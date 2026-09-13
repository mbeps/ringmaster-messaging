import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUserRepository } = vi.hoisted(() => ({
  mockUserRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
  },
}));

vi.mock("@/db/repositories/user-repository", () => ({
  userRepository: mockUserRepository,
}));

import getUserByEmail from "@/actions/user/get-user-by-email";
import getUserById from "@/actions/user/get-user-by-id";

describe("actions/user (getUserByEmail, getUserById)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserByEmail", () => {
    it("returns user for exact query shape", async () => {
      const user = { id: "u1", email: "a@b.com" };
      mockUserRepository.findByEmail.mockResolvedValue(user as never);

      await expect(getUserByEmail("a@b.com")).resolves.toEqual(user);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("a@b.com");
    });

    it("returns null when not found", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      await expect(getUserByEmail("missing@b.com")).resolves.toBeNull();
    });

    it("returns null when repository throws", async () => {
      mockUserRepository.findByEmail.mockRejectedValue(new Error("db down"));
      await expect(getUserByEmail("a@b.com")).resolves.toBeNull();
    });
  });

  describe("getUserById", () => {
    it("returns user for exact query shape", async () => {
      const user = { id: "u1", email: "a@b.com" };
      mockUserRepository.findById.mockResolvedValue(user as never);

      await expect(getUserById("u1")).resolves.toEqual(user);
      expect(mockUserRepository.findById).toHaveBeenCalledWith("u1");
    });

    it("returns null when not found", async () => {
      mockUserRepository.findById.mockResolvedValue(null);
      await expect(getUserById("u-missing")).resolves.toBeNull();
    });

    it("returns null when repository throws", async () => {
      mockUserRepository.findById.mockRejectedValue(new Error("db down"));
      await expect(getUserById("u1")).resolves.toBeNull();
    });
  });
});
