import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, isValidLogin } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;

  const email = body?.email ?? "";
  const password = body?.password ?? "";

  if (!isValidLogin(email, password)) {
    return NextResponse.json(
      { success: false, error: "Invalid email or password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
