"use server";

import { uploadImage } from "./upload-image";
import { connectDB } from "./db";
import { Post } from "./models/Post";
import { revalidatePath } from "next/cache";
import { createPostSchema } from "./validations/post";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export interface CreatePostState {
  success: boolean;
  error?: string;
}

export async function createPostAction(
  accessToken: string | null,
  _prevState: CreatePostState,
  formData: FormData,
): Promise<CreatePostState> {
  if (!accessToken) {
    return { success: false, error: "You must be logged in" };
  }

  let authUser;
  try {
    const { verifyAccessToken } = await import("@/lib/jwt");
    authUser = verifyAccessToken(accessToken);
  } catch {
    return { success: false, error: "Your session has expired. Please log in" };
  }

  const content = formData.get("content");
  const parsed = createPostSchema.safeParse(content);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const image = formData.get("image");
  let imageUrl = "";
  let imagePublicId = "";

  if (image instanceof File && image.size > 0) {
    if (image.size > MAX_SIZE) {
      return { success: false, error: "File size must be less than 5MB" };
    }
    if (!ALLOWED_TYPES.includes(image.type)) {
      return {
        success: false,
        error: "Only JPEG, PNG, WEBP, GIF images are allowed",
      };
    }

    try {
      const uploaded = await uploadImage(image, "chirp/posts");
      imageUrl = uploaded.url;
      imagePublicId = uploaded.publicId;
    } catch {
      return {
        success: false,
        error: "Something went wrong while uploading image. Please try again",
      };
    }
  }

  try {
    await connectDB();
    await Post.create({
      content: parsed.data.content,
      author: authUser.userId,
      imageUrl,
      imagePublicId,
    });
  } catch {
    return { success: false, error: "Something went wrong. Please try again" };
  }

  revalidatePath("/");
  return { success: true };
}
