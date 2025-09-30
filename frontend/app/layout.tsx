"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


import Link from 'next/link';
import { AuthProvider, useAuth } from './AuthContext';


function LayoutNav() {
  const { user, logout } = useAuth();
  return (
    <nav style={{ background: '#222', color: '#fff', padding: '16px 32px', display: 'flex', gap: 24, alignItems: 'center' }}>
      <Link href="/products" style={{ color: '#fff', textDecoration: 'none' }}>Products</Link>
      <Link href="/cart" style={{ color: '#fff', textDecoration: 'none' }}>Cart</Link>
      <Link href="/checkout" style={{ color: '#fff', textDecoration: 'none' }}>Checkout</Link>
      <Link href="/orders" style={{ color: '#fff', textDecoration: 'none' }}>Order History</Link>
      {!user && <Link href="/auth" style={{ color: '#fff', textDecoration: 'none' }}>Login/Signup</Link>}
      {user?.role === 'admin' && <Link href="/admin/products" style={{ color: '#fff', textDecoration: 'none' }}>Admin Products</Link>}
      {user?.role === 'admin' && <Link href="/admin/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Admin Dashboard</Link>}
      {user && (
        <span style={{ marginLeft: 'auto', color: '#fff' }}>
          {user.username} ({user.role})
          <button onClick={logout} style={{ marginLeft: 16, padding: '4px 12px', background: '#fff', color: '#222', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Logout</button>
        </span>
      )}
    </nav>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`} style={{ margin: 0 }}>
        <AuthProvider>
          <LayoutNav />
          <div style={{ minHeight: '80vh' }}>{children}</div>
          <footer style={{ background: '#222', color: '#fff', textAlign: 'center', padding: 16 }}>
            &copy; 2025 E-Commerce Microservices Demo
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
