import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearAuthCookie(response);
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectTo = `${url.origin}/login`;
  const response = NextResponse.redirect(redirectTo);
  clearAuthCookie(response);
  return response;
}
