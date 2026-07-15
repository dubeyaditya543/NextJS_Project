import z from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Username or email is requried"),
  password: z.string().min(1, "Password is required")
})