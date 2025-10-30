import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/products/uploads/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/products/uploads/:path*`,
      },
    ];
  },

  images: {
    domains: [
      "localhost",
      "picsum.photos",
      "source.unsplash.com",
      "via.placeholder.com",
      "loremflickr.com",
    ],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "api-gateway",
        port: "8080",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**", // ✅ allow all HTTPS sources
      },
      {
        protocol: "http",
        hostname: "**", // ✅ allow all HTTP sources
      },
    ],
  },
  // turbopack: {
  //   resolveAlias: {
  //     "next/image": path.resolve(
  //       __dirname,
  //       "src/components/nextImageWrapper/NextImageWrapper.js"
  //     ),
  //   },
  // },
  // webpack: (config) => {
  //   config.resolve.alias["next/image"] = path.resolve(
  //     __dirname,
  //     "src/components/nextImageWrapper/NextImageWrapper.js"
  //   );
  //   return config;
  // },
};

export default nextConfig;
