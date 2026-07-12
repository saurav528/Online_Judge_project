import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const adminSession = request.cookies.get("admin_session")?.value;
  const hasSession = !!sessionCookie || adminSession === "authenticated";

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/submissions") ||
    request.nextUrl.pathname === "/admin" ||
    request.nextUrl.pathname.startsWith("/admin/") ||
    request.nextUrl.pathname.startsWith("/problems") ||
    request.nextUrl.pathname.startsWith("/contests") ||
    request.nextUrl.pathname.startsWith("/leaderboard") ||
    request.nextUrl.pathname.startsWith("/duels");


  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/admin-login");

  // If trying to access a protected route and not authenticated, redirect to /login (or /admin-login if admin route)
  if (isProtectedRoute && !hasSession) {
    if (request.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin-login", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If already logged in and trying to access login/signup/admin-login, redirect
  if (isAuthRoute && hasSession) {
    if (adminSession === "authenticated") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }


  return NextResponse.next();
}


export const config = {
  matcher: [
    "/dashboard/:path*",
    "/submissions/:path*",
    "/admin/:path*",
    "/problems/:path*",
    "/contests/:path*",
    "/leaderboard/:path*",
    "/duels/:path*",
    "/login",
    "/signup",
    "/admin-login",
  ],
};

