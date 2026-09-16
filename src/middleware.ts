import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const redirects: Record<string, string> = {
  "/vip": "/services",
  "/wishlist": "/",
  "/links": "/",
  "/rates": "/services",
};

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const target = redirects[path];
  if (target) {
    return NextResponse.redirect(new URL(target, req.url), 308);
  }

  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.neonauth.c-2.eu-west-2.aws.neon.tech https://*.neon.tech",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  );
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
