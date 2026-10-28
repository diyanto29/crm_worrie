import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/';
  // Sanitize next parameter to prevent open redirect (only allow relative path starting with / and not //)
  const safeNext = (rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.includes('://')) 
    ? rawNext 
    : '/';

  if (code) {
    const supabaseResponse = NextResponse.redirect(`${origin}${safeNext}`);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              supabaseResponse.cookies.set(name, value, options);
            });
          },
        },
      });

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return supabaseResponse;
      }
      console.error('Auth callback exchangeCodeForSession error:', error);
    }
  }

  // Jika gagal, redirect kembali ke login dengan parameter error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
