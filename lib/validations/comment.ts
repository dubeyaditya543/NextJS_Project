import z from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment can't be empty").max(250, "Comment cannot exceed 250 chars")
})

export type CreateCommentFormValues = z.infer<typeof createCommentSchema>