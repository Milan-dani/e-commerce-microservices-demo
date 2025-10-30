import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthContext";
import ReduxProvider from "@/components/ReduxProvider";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MicroMerce Store - Your One-Stop Shopping Destination",
  description:
    "Discover amazing products at great prices. Fast shipping, excellent customer service, and quality guaranteed.",
};

export default function RootLayout({ children }) {

  
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          {/* <AuthProvider> */}
            {/* <Navigation /> */}
           <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <Toaster
              position="top-center"
              toastOptions={{
                // Default options for all toasts
                style: {
                  background: "#333", // dark background
                  color: "#fff", // light text
                  borderRadius: "8px",
                  padding: "16px",
                },
              }}
            />
          {/* </AuthProvider> */}
        </ReduxProvider>
      </body>
    </html>
  );
}
