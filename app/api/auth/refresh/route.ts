import { errorResponse, successResponse } from "@/lib/api/api";
import { connectDB } from "@/lib/db";
import { env } from "@/lib/env";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/jwt";
import { User } from "@/lib/models/User";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return errorResponse("No refresh token", 401);
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return errorResponse("Invalid or expired refresh token", 401);
    }

    await connectDB();
    const user = await User.findById(payload.userId);

    if (!user) {
      return errorResponse("User no longer exist", 401);
    }

    const tokenPayload = {
      userId: user._id.toString(),
      username: user.username,
    };
    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken(tokenPayload);

    const response = successResponse({
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
      accessToken: newAccessToken,
    });

    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Refresh error", error);
    return errorResponse("Something went wrong", 500)
  }
}
