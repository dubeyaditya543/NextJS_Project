import { errorResponse, successResponse } from "@/lib/api/api";
import { connectDB } from "@/lib/db";
import { Like } from "@/lib/models/Like";
import { Post } from "@/lib/models/Post";
import { getAuthUser } from "@/lib/protect";
import { NextRequest } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const authUser = getAuthUser(request);
    const { id: postId } = await params;

    await connectDB();

    const post = await Post.findById(postId);
    if (!post) {
      return errorResponse("Cannot find the given post", 404);
    }

    try {
      await Like.create({
        user: authUser.userId,
        post: postId,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        return successResponse({ liked: true, likeCount: post.likeCount });
      }
      throw error;
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likeCount: 1 } },
      { new: true },
    );

    return successResponse({ liked: true, likeCount: updatedPost!.likeCount });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized action", 401);
    }
    console.error("Like post error", error);
    return errorResponse("Something went wrong", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const authUser = getAuthUser(request);
    const { id: postId } = await params;

    await connectDB();

    const deleteLike = await Like.findOneAndDelete({
      user: authUser.userId,
      post: postId,
    });

    if (!deleteLike) {
      const post = await Post.findById(postId);
      return successResponse({ liked: false, likeCount: post?.likeCount ?? 0 });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likeCount: -1 } },
      { new: true },
    );

    return successResponse({liked: false, likeCount: updatedPost?.likeCount ?? 0})
  } catch (error) {
    if(error instanceof Error && error.message === "UNAUTHORIZED"){
      return errorResponse("Unauthorized action", 401)
    }
    return errorResponse("Something went wrong", 500)
  }
}
