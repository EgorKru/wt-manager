import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/appwrite";
import { ACCESS_TOKEN_COOKIE } from "@/features/auth/constants";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const secret = request.nextUrl.searchParams.get("secret");

  if (!userId || !secret)
    return new NextResponse("Missing fields", { status: 400 });

  try {
    // TODO: Реализовать OAuth callback когда будет API
    console.log("OAuth callback:", { userId, secret });

    // Пока что просто редиректим на главную
    return NextResponse.redirect(`${request.nextUrl.origin}/`);
    
    // Когда будет OAuth API:
    // const { account } = await createAdminClient();
    // const session = await account.createSession(userId, secret);
    // 
    // cookies().set(ACCESS_TOKEN_COOKIE, session.secret, {
    //   path: "/",
    //   httpOnly: true,
    //   sameSite: "strict",
    //   secure: true,
    // });
    // 
    // return NextResponse.redirect(`${request.nextUrl.origin}/`);
  } catch (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(`${request.nextUrl.origin}/sign-in`);
  }
}
