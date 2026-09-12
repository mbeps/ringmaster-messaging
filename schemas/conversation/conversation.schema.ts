import { z } from "zod";

export const conversationSchema = z
  .object({
    userId: z.string().optional(),
    isGroup: z.boolean().optional(),
    name: z.string().optional(),
    members: z.array(z.object({ value: z.string() })).optional(),
  })
  .refine(
    (data) => {
      if (data.isGroup) {
        return !!data.name && !!data.members && data.members.length >= 2;
      }
      return true;
    },
    {
      message: "Group name and at least 2 members are required for group chats",
      path: ["name"],
    },
  );

export const ConversationSchema = conversationSchema;
export type ConversationFormData = z.infer<typeof conversationSchema>;
