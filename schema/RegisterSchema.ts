import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/\d/, "Password must contain at least 1 number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least 1 special character")
    .regex(/[A-Z]/, "Password must contain at least 1 capital letter")
    .regex(/[a-z]/, "Password must contain at least 1 lower case letter"),
});
