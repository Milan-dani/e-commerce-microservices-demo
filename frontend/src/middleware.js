import { NextResponse } from 'next/server';

const publicRoutes = ['/', '/about', '/contact', '/products', '/login', '/signup'];
const userProtectedPrefixes = ['/cart', '/orders', '/checkout', '/dashboard'];
const adminProtectedPrefixes = ['/admin'];

// Helper to parse JSON safely
function safeParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname)) return NextResponse.next();

  // Get token and user info from cookies
  const token = req.cookies.get('token')?.value;
  const userCookie = req.cookies.get('user')?.value;
  const user = safeParseJSON(userCookie);
  const role = user?.role || null;

  // User-protected routes
  if (userProtectedPrefixes.some(prefix => pathname.startsWith(prefix))) {
    if (!token) {
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
      return NextResponse.redirect(new URL('/403', req.url));
    }
    return NextResponse.next();
  }

  // Default: allow
  return NextResponse.next();
}

// Apply middleware to all routes except static files, API, and _next
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
