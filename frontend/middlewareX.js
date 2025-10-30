import { NextResponse } from "next/server";

// Define route groups
const publicRoutes = [
  "/",
  "/about",
  "/contact",
  "/products",
  "/login",
  "/signup",
];

const userProtectedPrefixes = [
  "/cart",
  "/orders",
  "/checkout",
  "/dashboard",
];

const adminProtectedPrefixes = [
  "/admin-dashboard",
  "/admin-products",
];

function isPathInList(pathname, exactList) {
  return exactList.includes(pathname);
}

function startsWithAny(pathname, prefixes) {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/_next") ||
    /\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value || null;
  const userCookie = request.cookies.get("user")?.value || null;

  let role = null;
  if (userCookie) {
    try {
      const parsed = JSON.parse(userCookie);
      role = parsed?.role || null;
    } catch (_) {
      role = null;
    }
  }

  const isPublic = isPathInList(pathname, publicRoutes);
  const isUserProtected = startsWithAny(pathname, userProtectedPrefixes);
  const isAdminProtected = startsWithAny(pathname, adminProtectedPrefixes);

  // If user is authenticated and tries to visit auth pages, redirect to dashboard
  if (token && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Enforce user routes
  if (isUserProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Enforce admin routes
  if (isAdminProtected) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    if (role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Public and all other routes pass through
  if (isPublic || (!isUserProtected && !isAdminProtected)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths except Next.js internals and static files. Fine-tuned inside middleware.
  matcher: ["/:path*"],
};


