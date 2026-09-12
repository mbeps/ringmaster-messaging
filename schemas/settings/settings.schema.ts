import { z } from "zod";

export const settingsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().nullable().optional(),
});

export const SettingsSchema = settingsSchema;
export type SettingsFormData = z.infer<typeof settingsSchema>;
