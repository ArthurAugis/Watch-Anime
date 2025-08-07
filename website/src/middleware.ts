import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = !!token;
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/settings", "/profile"];
  const publicOnlyRoutes = ["/login"];

  if (!isAuthenticated && protectedRoutes.includes(pathname)) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && publicOnlyRoutes.includes(pathname)) {
    url.pathname = "/settings";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/settings", "/profile"],
};
