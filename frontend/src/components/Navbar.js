"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { Menu, X, ShoppingCart, Heart, User } from "lucide-react"; // install: npm i lucide-react
import { useDispatch, useSelector } from "react-redux";
import { useGetCartQuery } from "@/api/services/cartApi";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { logout } from "@/store/slices/authSlice";

const Dropdown = ({
  userDropdown,
  dropdownVariants,
  logoutHandle,
  role = "customer",
  children,
}) => {
  // const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    // <AnimatePresence>
    //   {isOpen && (
    //     <motion.div
    //       initial={{ opacity: 0, y: -10 }}
    //       animate={{ opacity: 1, y: 0 }}
    //       exit={{ opacity: 0, y: -10 }}
    //       transition={{ duration: 0.2 }}
    //       className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 border"
    //     >
    //       {children}
    //     </motion.div>
    //   )}
    // </AnimatePresence>
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
        //   className="flex items-center space-x-1 px-2 py-1 border rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <User className="w-5 h-5" />
      </button>
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
            className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 border"
          >
            {userDropdown[role].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
              >
                {item.name}
              </Link>
            ))}
            <button
              onClick={() => {
                logoutHandle();
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 transition-colors"
              //   className="w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function CountCartItems ({ token, role }) {
  
  // 🔥 Skip API call unless logged in and customer
  const { data: cart, isLoading, isError } = useGetCartQuery(undefined, {
    skip: !token || role !== "customer",
  });

  if (!token || role !== "customer" || isLoading || isError) return 0;

  return cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
}
export default function Navbar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  // const { data: cart } = useGetCartQuery();
  const { user, token } = useSelector((state) => state.auth);
  // const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;


  // const [user, setUser] = useState(null);
  // const [role, setRole] = useState("guest");

  // useEffect(() => {
  //   const userFromCookie = Cookies.get("user")
  //     ? JSON.parse(Cookies.get("user"))
  //     : null;
  //   setUser(userFromCookie);
  //   console.log("Role:", userFromCookie);

  //   setRole(userFromCookie?.role || "guest");
  // }, []);


  const role = user?.role || "guest";
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const rightLinks = {
    guest: [
      { name: "Login", href: "/login" },
      { name: "Signup", href: "/signup" },
    ],
    customer: [
      {
        name: "Wishlist",
        icon: <Heart className="w-5 h-5" />,
        href: "/wishlist",
      },
      {
        name: "Cart",
        icon: <ShoppingCart className="w-5 h-5" />,
        href: "/cart",
      },
    ],
    admin: [],
  };

  const userDropdown = {
    customer: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Orders", href: "/orders" },
      //   { name: "Logout", href: "/logout" },
    ],
    admin: [
      { name: "Admin Dashboard", href: "/admin/dashboard" },
      { name: "Admin Products", href: "/admin/products" },
      //   { name: "Logout", href: "/logout" },
    ],
  };

  // Motion variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -5, transition: { duration: 0.15 } },
  };

  const menuVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { height: 0, opacity: 0, transition: { duration: 0.25 } },
  };

  // Logout handler
  const logoutHandle = () => {
    toast.success("Logged out successfully");
    dispatch(logout());
    // Cookies.remove('token');
    // Cookies.remove('user');
    router.push("/login");
  };
  // Hide navbar on login page
const hideNavbarRoutes = ["/login", "/signup", "/forgot-password"];
if (hideNavbarRoutes.includes(pathname)) return null;
  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  MicroMerce
                </span>
              </Link>
            </motion.div>

            {/* Center Nav (Desktop only) */}
            <div className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-700 hover:text-blue-600  transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Side (Desktop only) */}
            <div className="hidden md:flex items-center space-x-4">
              {role === "guest" && (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Signup
                  </Link>
                </>
              )}

              {role === "customer" && (
                <>
                  <Link
                    href="/wishlist"
                    title="Wishlist"
                    className="p-2 text-gray-700 hover:text-red-500 transition-colors"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart className="w-5 h-5" />
                    </motion.div>
                  </Link>
                  <Link
                    href="/cart"
                    title="Cart"
                    className="relative w-5 h-5 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {/* 0 */}
                        {/* {countCartItems(cart)} */}
                        <CountCartItems token={token} role={role}/>
                      </span>
                    </motion.div>
                  </Link>
                  <Dropdown
                    userDropdown={userDropdown}
                    dropdownVariants={dropdownVariants}
                    logoutHandle={logoutHandle}
                    role={role}
                  />

                  {/* <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
                      //   className="flex items-center space-x-1 px-2 py-1 border rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <User className="w-5 h-5" />
                    </button>
                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={dropdownVariants}
                          className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 border"
                        >
                          {userDropdown.customer.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                            >
                              {item.name}
                            </Link>
                          ))}
                          <button
                            onClick={() => {
                              logoutHandle();
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 transition-colors"
                            //   className="w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                          >
                            Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div> */}
                </>
              )}

              {role === "admin" && (
                <Dropdown
                  userDropdown={userDropdown}
                  dropdownVariants={dropdownVariants}
                  logoutHandle={logoutHandle}
                  role={role}
                />
                // <div className="relative">
                //   <button
                //     onClick={() => setDropdownOpen(!dropdownOpen)}
                //     className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
                //     //   className="flex items-center space-x-1 px-2 py-1 border rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                //     //
                //   >
                //     <User className="w-5 h-5" />
                //   </button>
                //   <AnimatePresence>
                //     {dropdownOpen && (
                //       <motion.div
                //         initial="hidden"
                //         animate="visible"
                //         exit="exit"
                //         variants={dropdownVariants}
                //         className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 border"
                //       >
                //         {userDropdown.admin.map((item) => (
                //           <Link
                //             key={item.name}
                //             href={item.href}
                //             className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                //           >
                //             {item.name}
                //           </Link>
                //         ))}
                //         <button
                //           onClick={() => {
                //             logoutHandle();
                //           }}
                //           className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 transition-colors"
                //           //   className="w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                //         >
                //           Logout
                //         </button>
                //       </motion.div>
                //     )}
                //   </AnimatePresence>
                // </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden flex items-center">
              {role === "customer" && (
                <Link href="/cart" className="mr-3">
                  <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-blue-600" />
                </Link>
              )}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {menuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            //   <motion.div
            //     initial={{ opacity: 0, height: 0 }}
            //     animate={{
            //       opacity: menuOpen ? 1 : 0,
            //       height: menuOpen ? "auto" : 0,
            //     }}
            //     transition={{ duration: 0.3 }}
            //     className="md:hidden bg-white shadow-md border-t"
            //   >
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={menuVariants}
              className="fixed top-16 left-0 w-full h-[calc(100vh-4rem)] bg-white/95 backdrop-blur-md z-40 border-t"
            >
              <div className="flex flex-col px-4 py-2 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    //   className="text-gray-700 hover:text-blue-600"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}

                {role === "guest" && (
                  <>
                    <Link href="/login" className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors">Login</Link>
                    <Link href="/signup" className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors">Signup</Link>
                  </>
                )}

                {role === "customer" && (
                  <>
                    <Link
                      href="/wishlist"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Wishlist
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Orders
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Dashboard
                    </Link>
                    {/* <Link
                    href="/logout"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Logout
                  </Link> */}
                    <button
                      onClick={() => {
                        logoutHandle();
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                )}

                {role === "admin" && (
                  <>
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      href="/admin/products"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Admin Products
                    </Link>
                    {/* <Link
                    href="/logout"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Logout
                  </Link> */}
                    <button
                      onClick={() => {
                        logoutHandle();
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <nav className="bg-white shadow-md fixed w-full z-50 hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo */}
            <Link href="/" className="text-2xl font-bold text-gray-800">
              MyStore
            </Link>

            {/* Center Nav (Desktop only) */}
            <div className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Side (Desktop only) */}
            <div className="hidden md:flex items-center space-x-4">
              {role === "guest" && (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                  >
                    Signup
                  </Link>
                </>
              )}

              {role === "customer" && (
                <>
                  <Link href="/wishlist" title="Wishlist">
                    <Heart className="w-5 h-5 text-gray-700 hover:text-blue-600" />
                  </Link>
                  <Link href="/cart" title="Cart">
                    <ShoppingCart className="w-5 h-5 text-gray-700 hover:text-blue-600" />
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
                    >
                      <User className="w-5 h-5" />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 border">
                        {userDropdown.customer.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {role === "admin" && (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 border">
                      {userDropdown.admin.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden flex items-center">
              {role === "customer" && (
                <Link href="/cart" className="mr-3">
                  <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-blue-600" />
                </Link>
              )}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {menuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white shadow-md border-t">
            {/* <div className="fixed top-16 left-0 w-full h-[calc(100vh-4rem)] bg-white/95 backdrop-blur-md z-40 border-t"> */}

            <div className="flex flex-col px-4 py-2 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-700 hover:text-blue-600"
                >
                  {link.name}
                </Link>
              ))}

              {role === "guest" && (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-blue-600 transition-colors">Login</Link>
                  <Link href="/signup" className="text-gray-700 hover:text-blue-600 transition-colors">Signup</Link>
                </>
              )}

              {role === "customer" && (
                <>
                  <Link href="/wishlist">Wishlist</Link>
                  <Link href="/orders">Orders</Link>
                  <Link href="/dashboard">Dashboard</Link>
                  <Link href="/logout">Logout</Link>
                </>
              )}

              {role === "admin" && (
                <>
                  <Link href="/admin/dashboard">Admin Dashboard</Link>
                  <Link href="/admin/products">Admin Products</Link>
                  <Link href="/logout">Logout</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
