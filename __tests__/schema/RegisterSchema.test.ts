import { describe, expect, it } from "vitest";
import { RegisterSchema } from "@/schema/RegisterSchema";

const valid = {
  name: "Maruf",
  email: "maruf@example.com",
  password: "Passw0rd!",
};

describe("RegisterSchema", () => {
  it("parses valid input", () => {
    expect(RegisterSchema.safeParse(valid)).toMatchObject({ success: true });
  });

  it("rejects missing name", () => {
    const result = RegisterSchema.safeParse({ ...valid, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual(["name"]);
  });

  it("rejects short password", () => {
    const result = RegisterSchema.safeParse({ ...valid, password: "Ab1!" });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toContain("at least 8");
  });

  it.each([
    ["no number", "Password!"],
    ["no special char", "Password1"],
    ["no capital letter", "password1!"],
    ["no lower case", "PASSWORD1!"],
  ])("rejects password with %s", (_label, password) => {
    expect(RegisterSchema.safeParse({ ...valid, password }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = RegisterSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toBe("Invalid email address");
  });

  it("rejects wrong types", () => {
    expect(
      RegisterSchema.safeParse({ name: 42, email: valid.email, password: valid.password })
        .success
    ).toBe(false);
    expect(
      RegisterSchema.safeParse({ name: valid.name, email: null, password: valid.password })
        .success
    ).toBe(false);
  });

  it("strips unknown keys", () => {
    const result = RegisterSchema.safeParse({ ...valid, extra: true });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual(valid);
  });

  it("collects multiple password issues at once", () => {
    const result = RegisterSchema.safeParse({ ...valid, password: "short" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.length).toBeGreaterThan(1);
  });

  it("accepts boundary-length password of exactly 8 chars", () => {
    expect(
      RegisterSchema.safeParse({ ...valid, password: "Abcdef1!" }).success
    ).toBe(true);
  });
});
