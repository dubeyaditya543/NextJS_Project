import z from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required")
})

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be atleast 3 char long").max(20, "Username can be at max 20 char long").regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, and underscores only"),
  email: z.email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 char long"),
  displayName: z.string().min(1, "Display name is required").max(50, "Display name can be at max 50 char long")
})

export type LoginFormValues = z.infer<typeof loginSchema> 
export type RegisterFormValues = z.infer<typeof registerSchema>