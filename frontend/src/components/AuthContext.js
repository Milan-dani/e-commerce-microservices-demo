"use client";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { setUser } from "@/store/slices/authSlice";

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  // const user = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null;
  // const token = Cookies.get('token') ? JSON.parse(Cookies.get('user')) : null;
  // console.log(user);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    console.log({user});
    
    // 🔹 Try to recover user from localStorage if Redux is empty
    if (!user) {
      const storedUser = JSON.parse(localStorage.getItem("user") || null);
      console.log(storedUser);

      if (storedUser) {
        try {
          // const parsedUser = JSON.parse(storedUser);
          // dispatch(setUser(parsedUser));
          dispatch(setUser(storedUser));
        } catch (err) {
          console.error("Failed to parse user from localStorage:", err);
          // localStorage.removeItem("user");
        }
      }
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (!pathname) return; // Safety check

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
    const adminProtectedPrefixes = ["/admin", "/admin"];

    const isUserProtected = userProtectedPrefixes.some((route) =>
      pathname.startsWith(route)
    );
    const isAdminProtected = adminProtectedPrefixes.some((route) =>
      pathname.startsWith(route)
    );

    const handleRedirects = () => {
      // ⛔ Not logged in & accessing protected route
      if (!user && (isUserProtected || isAdminProtected)) {
        router.replace("/login");
        return;
      }

      // 🚫 Logged in but not admin trying to access admin routes
      if (user && user.role !== "admin" && isAdminProtected) {
        router.replace("/dashboard");
        
        return;
      }

      // 🔁 Logged in user visiting login/signup
      if (user && ["/login", "/signup"].includes(pathname)) {
        router.replace("/dashboard");
        return;
      }
    };

    handleRedirects();
    setLoading(false);
  }, [pathname, user, router]);

  // 🌀 Show a loading screen while checking auth
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2rem",
        }}
      >
        Loading...
      </div>
    );
  }
  return children;
};
