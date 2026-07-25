import { successResponse } from "@/lib/api/api";
import { env } from "@/lib/env";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const response = successResponse({ loggedOut: true });

  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response
}
