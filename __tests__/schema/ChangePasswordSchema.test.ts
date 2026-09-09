import { describe, expect, it } from "vitest";
import { ChangePasswordSchema } from "@/schema/ChangePasswordSchema";

const valid = {
  currentPassword: "OldPass1!",
  newPassword: "NewPass1!",
  confirmPassword: "NewPass1!",
};

describe("ChangePasswordSchema", () => {
  it("parses valid input", () => {
    expect(ChangePasswordSchema.safeParse(valid)).toMatchObject({ success: true });
  });

  it("rejects missing current password", () => {
    const result = ChangePasswordSchema.safeParse({ ...valid, currentPassword: "" });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].path).toEqual(["currentPassword"]);
  });

  it("rejects short new password", () => {
    const result = ChangePasswordSchema.safeParse({
      ...valid,
      newPassword: "Ab1!",
      confirmPassword: "Ab1!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched confirmation on confirmPassword path", () => {
    const result = ChangePasswordSchema.safeParse({
      ...valid,
      confirmPassword: "Different1!",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
  });

  it("rejects empty confirmPassword", () => {
    const result = ChangePasswordSchema.safeParse({ ...valid, confirmPassword: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields entirely", () => {
    expect(ChangePasswordSchema.safeParse({}).success).toBe(false);
    expect(
      ChangePasswordSchema.safeParse({ currentPassword: "x" }).success
    ).toBe(false);
  });

  it("rejects wrong types", () => {
    expect(
      ChangePasswordSchema.safeParse({ ...valid, currentPassword: 123 }).success
    ).toBe(false);
  });

  it("strips unknown keys", () => {
    const result = ChangePasswordSchema.safeParse({ ...valid, extra: true });
    expect(result.success).toBe(true);
    if (result.success)
      expect(result.data).toEqual({
        currentPassword: valid.currentPassword,
        newPassword: valid.newPassword,
        confirmPassword: valid.confirmPassword,
      });
  });
});
