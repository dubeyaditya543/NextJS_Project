import { cookies } from "next/headers";
import { TokenPayload, verifyRefreshToken } from "./jwt";

export async function getCurrentUserFromCookies(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value

  if(!refreshToken){
    return null
  }

  try{
    return verifyRefreshToken(refreshToken)
  }catch{
    return null
  }
}
