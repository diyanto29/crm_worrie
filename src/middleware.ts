import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Jika Supabase belum dikonfigurasi, lewati middleware
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project')) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Ambil data user yang terverifikasi dari token auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Rute publik yang boleh diakses tanpa login
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/auth');

  // 1. KEAMANAN 1: Proteksi URL Dashboard (Cegah URL Injection tanpa Login)
  // Jika user belum login dan mencoba mengakses rute internal dashboard
  if (!user && !isAuthRoute) {
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // 2. Jika user sudah login dan mengakses /login, alihkan langsung ke dashboard
  if (user && pathname === '/login') {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // 3. KEAMANAN 2: Role-Based Access Control (RBAC) - Halaman Khusus Administrator
  // Halaman sensitif: /team (Manajemen Tim) dan /settings (API Key Gateway & Database)
  const isAdminOnlyRoute = pathname.startsWith('/team') || pathname.startsWith('/settings');

  if (user && isAdminOnlyRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('user_id', user.id)
      .maybeSingle();

    let userProfile = profile;
    if (!userProfile && user.email) {
      const { data: profileByEmail } = await supabase
        .from('profiles')
        .select('role, is_active')
        .ilike('email', user.email.toLowerCase())
        .maybeSingle();
      if (profileByEmail) {
        userProfile = profileByEmail;
      }
    }

    // Cek master admin email dari environment variable (tanpa hardcode di source code)
    const masterAdminEmail = process.env.MASTER_ADMIN_EMAIL;
    const isMasterEmail = Boolean(
      masterAdminEmail && user.email && user.email.toLowerCase() === masterAdminEmail.toLowerCase()
    );

    // Jika akun dinonaktifkan oleh Admin
    if (userProfile && userProfile.is_active === false && !isMasterEmail) {
      url.pathname = '/login';
      url.searchParams.set('error', 'account_deactivated');
      return NextResponse.redirect(url);
    }

    // Jika perannya bukan admin/superadmin dan bukan master admin dari environment
    const isAuthorized = userProfile?.role === 'admin' || userProfile?.role === 'superadmin' || isMasterEmail;
    if (!isAuthorized) {
      url.pathname = '/';
      url.searchParams.set('error', 'unauthorized_admin_only');
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Proteksi semua rute aplikasi KECUALI file statis, aset gambar, dan endpoint favicon
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|docx)$).*)',
  ],
};
