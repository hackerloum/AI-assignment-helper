import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Create a Supabase client for use in Server Components and API Routes
 * This uses the anon key and respects RLS policies
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file."
    );
  }

  const cookieStore = await cookies();
  
  // Log cookies for debugging
  const allCookies = cookieStore.getAll();
  const authCookies = allCookies.filter(c => c.name.includes('sb-'));
  console.log('[Server Client] Total cookies:', allCookies.length, '| Auth cookies:', authCookies.length);

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.log('[Server Client] Cookie set skipped (expected in some contexts)');
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase ADMIN client with service role key
 * This bypasses RLS and should ONLY be used for server-side operations
 * like payment processing, admin tasks, etc.
 * 
 * ⚠️ WARNING: This client has full database access - use with caution!
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase admin environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file."
    );
  }

  console.log('[Admin Client] Creating admin client with service role key');

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

