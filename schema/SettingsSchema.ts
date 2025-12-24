import { z } from "zod";

export const SettingsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().optional(),
});
