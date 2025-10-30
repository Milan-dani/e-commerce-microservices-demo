import Button from "@/components/Button";
import { logout } from "@/store/slices/authSlice";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import toast from "react-hot-toast";

const baseUrl = "/api"; // Nginx will forward to api-gateway
// const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
// const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030";

// const tagTypes = [
//   "Auth",
//   "Users",
//   "Products",
//   "Cart",
//   "Orders",
//   "Payments",
//   "Inventory",
//   "Recommendations",
//   "Analytics",
//   "Categories",
// ];
//
// const baseApi = createApi({
//   reducerPath: "api",
//   baseQuery: fetchBaseQuery({
//     baseUrl,
//     prepareHeaders: (
//       headers,
//       { endpoint, type, getState, signal, fetchArgs }
//     ) => {
//       try {
//         const token =
//           typeof window !== "undefined" ? localStorage.getItem("token") : null;
//         if (token) headers.set("Authorization", `Bearer ${token}`);
//       } catch (e) {
//         // ignore access errors in SSR
//       }
//       // DO NOT set Content-Type here. Let the individual query/mutation handle it.
//       // For FormData, the browser sets it automatically with the boundary.
//       // For JSON, we can set it in the query like this:
//       // body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' }
//       return headers;
//     },
//   }),
//   tagTypes,
//   endpoints: () => ({}),
// });

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) headers.set("Authorization", `Bearer ${token}`);
    } catch {
      // ignore SSR errors
    }
    return headers;
  },
});

const baseQueryWithLogout = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    // 🚫 Do NOT redirect if already on login page
    if (
      typeof window !== "undefined" &&
      window.location.pathname === "/login"
    ) {
      return result;
    }

    console.warn("Unauthorized (401) — logging out");

    // 🔥 Show toast (client-side only)
    if (typeof window !== "undefined") {
     

      toast(
        (t) => (
          <div className={`${t.visible ? "animate-enter" : "animate-leave"} flex items-center`}>
         
          <span>
            Your session has expired. Please log in again.
            </span>
            <Button
              onClick={() => {
                toast.dismiss(t.id);
                window.location.href = "/login";
              }}
              className="ml-4"
              // className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Login
            </Button>
          </div>
        ),
        { duration: Infinity }
      );
      // toast.error("Your session has expired. Please log in again.");
    }

    // Dispatch logout (clears Redux state)
    api.dispatch(logout());

    // Clear localStorage and redirect
    if (typeof window !== "undefined") {
      // dispatch(logout());
      // localStorage.removeItem("token");
      // localStorage.removeItem("user");
      setTimeout(() => {
        // window.location.href = "/login";
      }, 1500);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithLogout,
  tagTypes: [
    "Auth",
    "Users",
    "Products",
    "Cart",
    "Orders",
    "Payments",
    "Inventory",
    "Recommendations",
    "Analytics",
    "Categories",
  ],
  endpoints: () => ({}),
});

export default baseApi;
