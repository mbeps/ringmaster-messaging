import { describe, expect, it } from "vitest";
import { ConversationSchema } from "@/schema/ConversationSchema";

describe("ConversationSchema", () => {
  it("parses a 1-on-1 conversation with just userId", () => {
    expect(
      ConversationSchema.safeParse({ userId: "user-1" })
    ).toMatchObject({ success: true });
  });

  it("parses a valid group conversation", () => {
    expect(
      ConversationSchema.safeParse({
        isGroup: true,
        name: "Group",
        members: [{ value: "a" }, { value: "b" }],
      })
    ).toMatchObject({ success: true });
  });

  it("rejects group without name or fewer than 2 members", () => {
    const noName = ConversationSchema.safeParse({
      isGroup: true,
      members: [{ value: "a" }, { value: "b" }],
    });
    expect(noName.success).toBe(false);
    if (!noName.success) expect(noName.error.issues[0].path).toEqual(["name"]);

    const oneMember = ConversationSchema.safeParse({
      isGroup: true,
      name: "Group",
      members: [{ value: "a" }],
    });
    expect(oneMember.success).toBe(false);
  });

  it("rejects group with no members array", () => {
    const result = ConversationSchema.safeParse({ isGroup: true, name: "Group" });
    expect(result.success).toBe(false);
  });

  it("rejects group with empty members array", () => {
    const result = ConversationSchema.safeParse({
      isGroup: true,
      name: "Group",
      members: [],
    });
    expect(result.success).toBe(false);
  });

  it("accepts exactly two members as the boundary", () => {
    const result = ConversationSchema.safeParse({
      isGroup: true,
      name: "Duo",
      members: [{ value: "a" }, { value: "b" }],
    });
    expect(result.success).toBe(true);
  });

  it("parses an empty object (all fields optional)", () => {
    expect(ConversationSchema.safeParse({}).success).toBe(true);
  });

  it("rejects wrong types", () => {
    expect(ConversationSchema.safeParse({ userId: 42 }).success).toBe(false);
    expect(ConversationSchema.safeParse({ isGroup: "yes" }).success).toBe(false);
    expect(ConversationSchema.safeParse({ members: ["a"] }).success).toBe(false);
    expect(ConversationSchema.safeParse({ members: [{ value: 1 }] }).success).toBe(false);
  });

  it("does not enforce group rules when isGroup is false", () => {
    expect(
      ConversationSchema.safeParse({ isGroup: false, userId: "u1" }).success
    ).toBe(true);
  });
});
