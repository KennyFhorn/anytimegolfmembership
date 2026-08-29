import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);

  // Signed-in-only areas. Pages also guard themselves server-side (admin
  // checks `profiles.role`); this is a fast redirect for the common case of
  // a signed-out visitor hitting a protected route directly. Skipped in demo
  // mode, where there's no real Supabase auth cookie and the page-level
  // guards (a fixed demo profile) apply.
  const PROTECTED = ["/admin", "/dashboard", "/standings", "/leagues", "/history", "/calendar", "/account"];
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isSupabaseConfigured && isProtected) {
    // Supabase splits the session cookie into numbered chunks
    // (sb-<ref>-auth-token.0, .1, ...) once the JWT is too big for one
    // cookie — which a large raw_user_meta_data payload (this app's full
    // signup form: name, address, birthdate, emergency contact, etc.) makes
    // easy to hit. endsWith("-auth-token") missed every chunked name, so a
    // signed-in member could get treated as signed-out here while every
    // *server* auth check (which properly reassembles chunked cookies)
    // still saw them as signed in — proxy bounces to /login, /login sees a
    // real session and bounces back, proxy bounces again: an infinite loop
    // that only hit accounts with big enough metadata to get chunked.
    const hasSupabaseCookie = request.cookies
      .getAll()
      .some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));
    if (!hasSupabaseCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static, _next/image (static assets)
     * - favicon.ico, images, fonts
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
