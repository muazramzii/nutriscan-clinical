import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/nurse") && token?.role !== "NURSE") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (path.startsWith("/dietitian") && token?.role !== "DIETITIAN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/nurse/:path*", "/dietitian/:path*", "/admin/:path*"],
};
