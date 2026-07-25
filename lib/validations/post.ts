import z from "zod";

export const createPostSchema = z.object({
  content: z.string().trim().min(1, "Post cannot be blank").max(200, "Post cannot exceed 200 char")
})

export type CreatePostFormValues = z.infer<typeof createPostSchema> 