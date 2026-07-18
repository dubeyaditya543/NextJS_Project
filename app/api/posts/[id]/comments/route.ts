import { errorResponse, successResponse } from "@/lib/api/api";
import { connectDB } from "@/lib/db";
import { Comment } from "@/lib/models/Comment";
import { Post } from "@/lib/models/Post";
import { getAuthUser } from "@/lib/protect";
import { NextRequest } from "next/server";
import z from "zod";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(200, "Comment cannot exceed 200 characters")
})

interface Params {
  params: Promise<{id: string}>
}

export async function POST(request: NextRequest, {params}: Params) {
  try {
    const authUser = getAuthUser(request)
    const { id: postId } = await params

    const body = await request.json()
    const parsed = commentSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 422)
    }

    await connectDB()

    const post = await Post.findById(postId)

    if (!post) {
      return errorResponse("Post not found", 404)
    }

    const comment = await Comment.create({
      content: parsed.data.content,
      author: authUser.userId,
      post: postId
    })

    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } })

    const populatedComment = await comment.populate("author", "username avatarUrl, displayName")

    return successResponse(populatedComment, 201)
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401)
    }
    console.error("Comment create error", error)
    return errorResponse("Something went wrong", 500)
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const {id: postId}  = await params
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number(searchParams.get("page")) || 1)
    const limit = Math.min(50, Math.max(Number(searchParams.get("limit")) || 20))
    const skip = (page - 1) * limit

    await connectDB()

    const [comments, totalCount] = await Promise.all([
      Comment.find({ post: postId })
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit)
        .populate("author", "username avatarUrl, displayName")
        .lean(),
      Comment.countDocuments({post: postId})
    ])

    return successResponse({
      comments, pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + comments.length < totalCount
    }})

  } catch (error) {
    console.error("Comments fetch error", error)
    return errorResponse("Something went wrong", 500)
  }
}
