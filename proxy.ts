import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);

  // Admin routes are also guarded server-side per page (checking the
  // `profiles.role` column); this is a fast, low-risk redirect for the
  // common case of a signed-out visitor hitting /admin directly. Skipped
  // entirely in demo mode, where there's no real Supabase auth cookie to
  // check and the page-level guard (a fixed demo admin profile) applies.
  if (isSupabaseConfigured && request.nextUrl.pathname.startsWith("/admin")) {
    const hasSupabaseCookie = request.cookies
      .getAll()
      .some((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));
    if (!hasSupabaseCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", request.nextUrl.pathname);
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
     * - /tv/* (public kiosk routes, no auth needed)
     */
    "/((?!_next/static|_next/image|favicon.ico|tv/).*)",
  ],
};
