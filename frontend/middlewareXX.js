import { NextResponse } from 'next/server';

// Public routes that anyone can access
const publicRoutes = ['/', '/about', '/contact', '/products', '/login', '/signup'];

// User protected routes (requires login)
const userProtectedPrefixes = ['/cart', '/orders', '/checkout', '/dashboard'];

// Admin protected routes (requires admin role)
const adminProtectedPrefixes = ['/admin-dashboard', '/admin-products'];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Get token or user info from cookies (or headers, depending on your auth)
  const token = req.cookies.get('token')?.value;
  const user = req.cookies.get('user')?.value; // 'admin' or 'user'
const role = user.role || null;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // User-protected routes
  if (userProtectedPrefixes.some(prefix => pathname.startsWith(prefix))) {
    if (!token) {
      // Redirect to login if not logged in
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // Admin-protected routes
  if (adminProtectedPrefixes.some(prefix => pathname.startsWith(prefix))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (role !== 'admin') {
      // Redirect to 403 page if not admin
      return NextResponse.redirect(new URL('/403', req.url));
    }
    return NextResponse.next();
  }

  // Default: allow
  return NextResponse.next();
}

// Apply middleware to all routes
export const config = {
  matcher: [
    /*
      Match all routes except static files, _next, api routes.
      This prevents blocking public assets.
    */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
