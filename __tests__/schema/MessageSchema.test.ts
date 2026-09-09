import { describe, expect, it } from "vitest";
import { MessageSchema } from "@/schema/MessageSchema";

describe("MessageSchema", () => {
  it("parses a text message", () => {
    expect(
      MessageSchema.safeParse({ message: "hello", conversationId: "c1" })
    ).toMatchObject({ success: true });
  });

  it("parses an image-only message", () => {
    expect(
      MessageSchema.safeParse({
        image: "https://x.com/img.png",
        conversationId: "c1",
      })
    ).toMatchObject({ success: true });
  });

  it("rejects missing conversationId", () => {
    const result = MessageSchema.safeParse({ message: "hello", conversationId: "" });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].path).toEqual(["conversationId"]);
  });

  it("rejects message without body or image", () => {
    const result = MessageSchema.safeParse({ conversationId: "c1" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual(["message"]);
  });

  it("parses a message with both body and image", () => {
    expect(
      MessageSchema.safeParse({
        message: "look at this",
        image: "https://x.com/img.png",
        conversationId: "c1",
      })
    ).toMatchObject({ success: true });
  });

  it("treats empty-string message as absent for the refine check", () => {
    const result = MessageSchema.safeParse({ message: "", conversationId: "c1" });
    expect(result.success).toBe(false);
  });

  it("rejects missing conversationId key", () => {
    expect(MessageSchema.safeParse({ message: "hi" }).success).toBe(false);
  });

  it("rejects non-string fields", () => {
    expect(MessageSchema.safeParse({ message: 5, conversationId: "c1" }).success).toBe(false);
    expect(MessageSchema.safeParse({ image: {}, conversationId: "c1" }).success).toBe(false);
    expect(MessageSchema.safeParse({ message: "hi", conversationId: 99 }).success).toBe(false);
  });

  it("strips unknown keys", () => {
    const result = MessageSchema.safeParse({
      message: "hello",
      conversationId: "c1",
      extra: true,
    });
    expect(result.success).toBe(true);
    if (result.success)
      expect(result.data).toEqual({ message: "hello", conversationId: "c1" });
  });
});
