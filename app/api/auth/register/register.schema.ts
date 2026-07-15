import z from "zod";

export const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, underscores only"),
  email: z.email(),
  password: z.string().min(8),
  displayName: z.string().min(3).max(30)
})