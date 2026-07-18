import { errorResponse, successResponse } from "@/lib/api/api";
import { connectDB } from "@/lib/db";
import { Follow } from "@/lib/models/Follow";
import { User } from "@/lib/models/User";
import { getAuthUser } from "@/lib/protect";
import { NextRequest } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const authUser = getAuthUser(request);
    const { id: targetUserId } = await params;

    if (authUser.userId === targetUserId) {
      return errorResponse("You cannot follow yourself", 400);
    }

    await connectDB();

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return errorResponse("User with given id not found", 404);
    }

    try {
      await Follow.create({
        follower: authUser.userId,
        following: targetUserId,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        return successResponse({ following: true });
      }
      throw error;
    }

    await Promise.all([
      User.findByIdAndUpdate(authUser.userId, { $inc: { followingCount: 1 } }),
      User.findByIdAndUpdate(targetUserId, { $inc: { followerCount: 1 } }),
    ]);

    return successResponse({ following: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401);
    }
    console.error("Follow error", error);
    return errorResponse("Something went wrong", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const authUser = getAuthUser(request);
    const { id: targetUserId } = await params;

    await connectDB();

    const deletedFollow = await Follow.findByIdAndDelete({
      follower: authUser.userId,
      following: targetUserId,
    });

    if (!deletedFollow) {
      return successResponse({ following: false });
    }

    await Promise.all([
      await User.findByIdAndUpdate(authUser.userId, {
        $inc: { followingCount: -1 },
      }),
      await User.findByIdAndUpdate(targetUserId, {
        $inc: { followerCount: -1 },
      }),
    ]);

    return successResponse({ following: false });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401);
    }
    console.error("Unfollow error", error);
    return errorResponse("Something went wrong", 500);
  }
}
