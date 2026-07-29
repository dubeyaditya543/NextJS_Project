import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";

const PROTECTED_PATHS = ["/compose"]

export function proxy(request: NextRequest){
  const {pathname} = request.nextUrl

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path))

  if(!isProtected){
    return NextResponse.next()
  }

  const refreshToken = request.cookies.get("refreshToken")?.value

  if(!refreshToken){
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("/redirectTo", pathname)
    return NextResponse.redirect(loginUrl)
  }

  try{
    verifyAccessToken(refreshToken)
    return NextResponse.next()
  }catch{
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("/redirectTo", pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ["/compose"],
};