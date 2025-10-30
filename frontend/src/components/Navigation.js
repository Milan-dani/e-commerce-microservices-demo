'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, User, Menu, X, Search, Heart, ChevronDown } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const { user, token } = useSelector((state) => state.auth);
  // const user = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null;
  // const token = Cookies.get('token') ? JSON.parse(Cookies.get('user')) : null;
  const isLoggedIn = Boolean(user && token);
  const isAdmin = user?.role === 'admin';

  // Logout handler
  const logoutHandle = () => {
    toast.success('Logged out successfully');
    dispatch(logout());
    // Cookies.remove('token');
    // Cookies.remove('user');
    router.push('/login');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Generate nav links dynamically
  const navLinks = useMemo(() => {
    const links = [
      { name: 'Home', href: '/' },
      { name: 'Products', href: '/products' },
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ];

    if (isLoggedIn && !isAdmin) {
      links.push({ name: 'Cart', href: '/cart' });
      links.push({ name: 'Orders', href: '/orders' });
    }

    if (isAdmin) {
      links.push({ name: 'Admin Dashboard', href: '/admin-dashboard' });
      links.push({ name: 'Admin Products', href: '/admin-products' });
    }

    return links;
  }, [isLoggedIn, isAdmin]);

  // Mobile links
  const mobileLinks = useMemo(
    () => navLinks.filter(link => link.href !== '/dashboard'), // dashboard will be in dropdown
    [navLinks]
  );

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">MicroMerce</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-gray-700 hover:text-blue-600 transition-colors">
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:flex items-center max-w-md mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Wishlist */}
            <Link href="/wishlist" className="p-2 text-gray-700 hover:text-red-500 transition-colors">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Heart className="w-5 h-5" />
              </motion.div>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  0
                </span>
              </motion.div>
            </Link>

            {/* User Dropdown */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1 px-2 py-1 border rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm">{user?.name || user?.email || 'Account'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg py-1 z-50"
                  >
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={logoutHandle}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <Link href="/login" className="p-2 text-gray-700 hover:text-blue-600 transition-colors">
                <User className="w-5 h-5" />
              </Link>
            )}

            {/* Mobile menu button */}
            <button onClick={toggleMenu} className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: isMenuOpen ? 1 : 0, height: isMenuOpen ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
            {mobileLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile search */}
            <div className="px-3 py-2">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Mobile dashboard & logout */}
            {isLoggedIn && (
              <div className="px-3 py-2 space-y-1 border-t">
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { logoutHandle(); setIsMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </nav>
  );
}
