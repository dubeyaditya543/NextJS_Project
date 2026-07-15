import { NextRequest } from "next/server";
import { loginSchema } from "./login.schema";
import { errorResponse, successResponse } from "@/lib/api/api";
import { User } from "@/lib/models/User";
import { connectDB } from "@/lib/db";
import { comparePassword } from "@/lib/password";
import { signAccessToken, signRefreshToken, TokenPayload } from "@/lib/jwt";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try{
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if(!parsed.success){
      return errorResponse(parsed.error.issues[0].message, 422)
    }

    const {identifier, password} = parsed.data

    const existingUser = await User.findOne({$or: [{username: identifier.toLocaleLowerCase()}, {email: identifier.toLocaleLowerCase()}]}).select("+password")

    await connectDB()

    if(!existingUser){
      return errorResponse("Invalid credentials", 401)
    }

    const isValidPassword = await comparePassword(password, existingUser.password)

    if(!isValidPassword){
      return errorResponse("Invalid credentials", 401)
    }

    const tokenPayload: TokenPayload = {userId: existingUser._id.toString(), username: existingUser.username}
    const accessToken = signAccessToken(tokenPayload)
    const refreshToken = signRefreshToken(tokenPayload)

    const response = successResponse({
      user: {
        id: existingUser._id,
        username: existingUser.username,
        displayName: existingUser.displayName
      },
      accessToken
    })

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 60*60*24*7,
      path: "/",
      secure: env.NODE_ENV === "production",
      sameSite: "lax"
    })
  }catch(error){
    console.error("Login error", error)
    return errorResponse("Something went wrong", 500)
  }
}