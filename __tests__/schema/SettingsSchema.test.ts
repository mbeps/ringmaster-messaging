import { describe, expect, it } from "vitest";
import { SettingsSchema } from "@/schema/SettingsSchema";

describe("SettingsSchema", () => {
  it("parses valid input with name and image", () => {
    expect(
      SettingsSchema.safeParse({ name: "Maruf", image: "https://x.com/i.png" })
    ).toMatchObject({ success: true });
  });

  it("allows null or missing image", () => {
    expect(SettingsSchema.safeParse({ name: "A", image: null }).success).toBe(true);
    expect(SettingsSchema.safeParse({ name: "A" }).success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = SettingsSchema.safeParse({ name: "", image: null });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual(["name"]);
  });

  it("rejects missing name", () => {
    expect(SettingsSchema.safeParse({ image: null }).success).toBe(false);
    expect(SettingsSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong types", () => {
    expect(SettingsSchema.safeParse({ name: 42 }).success).toBe(false);
    expect(SettingsSchema.safeParse({ name: "A", image: 123 }).success).toBe(false);
  });

  it("strips unknown keys", () => {
    const result = SettingsSchema.safeParse({ name: "A", extra: true });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual({ name: "A" });
  });
});
