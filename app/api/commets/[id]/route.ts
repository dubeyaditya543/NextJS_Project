import { errorResponse, successResponse } from "@/lib/api/api";
import { connectDB } from "@/lib/db";
import { Comment } from "@/lib/models/Comment";
import { Post } from "@/lib/models/Post";
import { getAuthUser } from "@/lib/protect";
import { NextRequest } from "next/server";

interface Params {
  params: Promise<{id: string}>
}

export async function DELETE(request: NextRequest, {params}: Params) {
  try {
    const authUser = getAuthUser(request)
    const { id: commentId } = await params

    await connectDB()

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return errorResponse("Comment not found", 404)
    }

    if (comment.author.toString() !== authUser.userId.toString()) {
      return errorResponse("Forbidden", 403)
    }

    await comment.deleteOne()
    await Post.findByIdAndUpdate(comment.post, {$inc: {commentCount: -1}})
    
    return successResponse({deleted: true})
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized")
    }
    console.error("Comment delete error", error)
    return errorResponse("Soemthing went wrong", 500)
  }
}