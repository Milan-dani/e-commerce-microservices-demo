"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { setToken as setTokenAction, setUser as setUserAction } from '@/store/slices/authSlice';

// simple helpers for cookies
const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(
    value
  )};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name) => {
  const match = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[2]) : null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
};

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    // Try cookies first, fallback to localStorage
    const storedToken =
      typeof window !== "undefined"
        ? getCookie("token") || localStorage.getItem("token")
        : null;
    const storedUser =
      typeof window !== "undefined"
        ? getCookie("user") || localStorage.getItem("user")
        : null;

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
        // sync to redux
        try { dispatch(setTokenAction(storedToken)); dispatch(setUserAction(JSON.parse(storedUser))); } catch (e) {}
      } catch {
        setUser(null);
      }
    }
  }, [dispatch]);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);

    // Save to cookies
    setCookie("token", newToken, 7); // 7-day expiry
    setCookie("user", JSON.stringify(newUser), 7);

    // Also keep in localStorage as fallback
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    try { dispatch(setTokenAction(newToken)); dispatch(setUserAction(newUser)); } catch (e) {}
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    // Remove from cookies
    deleteCookie("token");
    deleteCookie("user");

    // Remove from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    try { dispatch(setTokenAction(null)); dispatch(setUserAction(null)); } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};


