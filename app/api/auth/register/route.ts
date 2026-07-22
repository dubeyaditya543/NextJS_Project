import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/lib/api/api";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { env } from "@/lib/env";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest){
  try{
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if(!parsed.success){
      return errorResponse(parsed.error.issues[0].message, 422)
    }

    const {username, email, password, displayName} = parsed.data

    await connectDB()

    const existinngUser = await User.findOne({$or: [{username}, {email}]})

    if(existinngUser){
      return errorResponse("User already exist. Please log in", 409)
    }

    const user = await User.create({
      username,
      email,
      password,
      displayName
    })

    const tokenPayload = {userId: user._id.toString(), username: user.username}
    const accessToken = signAccessToken(tokenPayload)
    const refreshToken = signRefreshToken(tokenPayload)

    const response = successResponse({
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName
      },
      accessToken
    }, 201)

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60
    })

    return response
  }catch(error){
    console.error("Register error", error)
    return errorResponse("Something went wrong", 500)
  }
}