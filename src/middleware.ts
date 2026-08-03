import { NextResponse, type NextRequest } from "next/server";
import { auth0, isAdminEmail } from "@/lib/auth0";

export async function middleware(request: NextRequest) {
  if (!auth0) return NextResponse.next();

  const res = await auth0.middleware(request);
  const { pathname, origin } = request.nextUrl;

  if (pathname.startsWith("/auth")) return res;

  const needsSession = pathname.startsWith("/admin") || pathname.startsWith("/account");
  if (needsSession) {
    const session = await auth0.getSession(request);
    if (!session) {
      const login = new URL("/auth/login", origin);
      login.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(login);
    }
    const email = (session.user as { email?: string })?.email;
    if (pathname.startsWith("/admin") && !isAdminEmail(email)) {
      return NextResponse.redirect(new URL("/account?forbidden=1", origin));
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/auth/:path*"],
};
