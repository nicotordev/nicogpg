import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

function isProtectedPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/chat" ||
    pathname.startsWith("/chat/") ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/contacts" ||
    pathname.startsWith("/contacts/")
  );
}

export function proxy(request: NextRequest): NextResponse {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (getSessionCookie(request)) {
    return NextResponse.next();
  }

  const signIn = request.nextUrl.clone();
  signIn.pathname = "/auth/sign-in";
  signIn.search = "";
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/", "/chat", "/chat/:path*", "/profile", "/profile/:path*", "/contacts", "/contacts/:path*"],
};
