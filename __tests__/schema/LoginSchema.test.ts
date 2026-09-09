import { describe, expect, it } from "vitest";
import { LoginSchema } from "@/schema/LoginSchema";

describe("LoginSchema", () => {
  const valid = { email: "test@example.com", password: "secret" };

  it("parses valid input", () => {
    expect(LoginSchema.safeParse(valid)).toMatchObject({ success: true });
  });

  it("rejects invalid email", () => {
    const result = LoginSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual(["email"]);
  });

  it("rejects empty password", () => {
    const result = LoginSchema.safeParse({ ...valid, password: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual(["password"]);
  });

  it("rejects missing fields entirely", () => {
    expect(LoginSchema.safeParse({ email: valid.email }).success).toBe(false);
    expect(LoginSchema.safeParse({ password: valid.password }).success).toBe(false);
    expect(LoginSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong types", () => {
    expect(LoginSchema.safeParse({ email: 123, password: "x" }).success).toBe(false);
    expect(LoginSchema.safeParse({ email: "a@b.com", password: true }).success).toBe(false);
  });

  it("does not require strong passwords (min length 1)", () => {
    expect(LoginSchema.safeParse({ ...valid, password: "a" }).success).toBe(true);
  });

  it("strips unknown keys", () => {
    const result = LoginSchema.safeParse({ ...valid, extra: true });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual(valid);
  });
});
