import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Check if Supabase environment variables are configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // If environment variables are missing, allow access to setup and auth pages
    if (
      request.nextUrl.pathname.startsWith("/auth") ||
      request.nextUrl.pathname.startsWith("/api") ||
      request.nextUrl.pathname === "/setup"
    ) {
      return NextResponse.next();
    }
    // For other pages, redirect to setup page
    const url = request.nextUrl.clone();
    url.pathname = "/setup";
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, any> }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if there are auth cookies present (even if getUser() didn't find user yet)
  // This handles the case where cookies are set but not yet readable
  const hasAuthCookies = request.cookies.getAll().some(
    cookie => cookie.name.includes('sb-') && cookie.name.includes('auth-token')
  );

  // Only protect dashboard routes, let auth pages work freely
  if (
    !user &&
    !hasAuthCookies &&
    request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    // no user and no auth cookies - redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  
  // Allow /cp routes through if user exists OR has auth cookies
  // The page itself will verify admin role
  if (
    request.nextUrl.pathname.startsWith("/cp") &&
    !request.nextUrl.pathname.startsWith("/cp/login") &&
    !request.nextUrl.pathname.startsWith("/api")
  ) {
    // If we have a user OR auth cookies, let through to the page
    // Page will do the admin role check
    if (!user && !hasAuthCookies) {
      const url = request.nextUrl.clone();
      url.pathname = "/cp/login";
      return NextResponse.redirect(url);
    }
    // If user or cookies exist, allow through
  }
  
  // If user exists OR auth cookies exist, allow access to dashboard
  // This gives time for session to sync

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse;
}

