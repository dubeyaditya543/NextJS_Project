import { errorResponse, successResponse } from "@/lib/api/api";
import { connectDB } from "@/lib/db";
import { Post } from "@/lib/models/Post";
import { getAuthUser } from "@/lib/protect";
import { uploadImage } from "@/lib/upload-image";
import { NextRequest } from "next/server";
import z from "zod";

const contentScheam = z
  .string()
  .trim()
  .min(1, "Post cannot be empty")
  .max(250, "Post cannot exceed 250 char long");

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "image/gif",
];

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);

    const formData = await request.formData();
    const content = formData.get("content");
    const image = formData.get("image");

    const parsedContent = contentScheam.safeParse(content);
    if (!parsedContent.success) {
      return errorResponse(parsedContent.error.issues[0].message, 422);
    }

    let imageUrl = "";
    let imagePublicId = "";

    if (image instanceof File && image.size > 0) {
      if (image.size > MAX_IMAGE_SIZE) {
        return errorResponse("Image must be under 5MB", 422);
      }
      if (!ALLOWED_TYPES.includes(image.type)) {
        return errorResponse("Image must be jpeg, webp, png, gif", 422);
      }

      const uploaded = await uploadImage(image, "chirp/posts");
      imageUrl = uploaded.url;
      imagePublicId = uploaded.publicId;
    }

    await connectDB();

    const post = await Post.create({
      content: parsedContent.data,
      author: authUser.userId,
      imageUrl,
      imagePublicId,
    });

    const populatePost = await post.populate(
      "author",
      "username displayName avatarUrl",
    );

    return successResponse(populatePost, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("You do not have permission", 401);
    }
    console.error("Create post error", error);
    return errorResponse("Something went wrong", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser.userId) {
      return errorResponse("You must be logged", 401);
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit")) || 20),
    );
    const skip = (page - 1) * limit;

    await connectDB();

    const [posts, totalCount] = await Promise.all([
      Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "username displayName avatarUrl")
        .lean(),
      Post.countDocuments(),
    ]);

    return successResponse({
      posts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + posts.length < totalCount
      }
    })
  } catch (error) {
    console.error("Fetch request error", error)
    return errorResponse("Something went wrong", 500)
  }
}
