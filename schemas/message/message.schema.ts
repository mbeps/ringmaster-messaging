import { z } from "zod";

export const messageSchema = z
  .object({
    message: z.string().optional(),
    image: z.string().optional(),
    conversationId: z.string().min(1, "Conversation ID is required"),
  })
  .refine((data) => data.message || data.image, {
    message: "Message or image is required",
    path: ["message"],
  });

export const MessageSchema = messageSchema;
export type MessageFormData = z.infer<typeof messageSchema>;
