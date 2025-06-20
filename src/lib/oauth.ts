"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OAuthProvider } from "@/lib/api-types";

import { createAdminClient } from "@/lib/appwrite";

export async function signUpWithGithub() {
  // TODO: Реализовать OAuth через ваш API когда будут endpoints
  console.log("GitHub OAuth not implemented yet");
  
  // Временная заглушка - редирект на sign-up
  return redirect("/sign-up");
  
  // Когда будет OAuth API:
  // const { account } = await createAdminClient();
  // const origin = headers().get("origin");
  // const redirectUrl = await account.createOAuth2Token(
  //   OAuthProvider.Github,
  //   `${origin}/oauth`,
  //   `${origin}/sign-up`
  // );
  // return redirect(redirectUrl);
}

export async function signUpWithGoogle() {
  // TODO: Реализовать OAuth через ваш API когда будут endpoints
  console.log("Google OAuth not implemented yet");
  
  // Временная заглушка - редирект на sign-up
  return redirect("/sign-up");
}
