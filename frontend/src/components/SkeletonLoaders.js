import { motion } from "framer-motion";

export function FeaturedProductCardSkeleton({ index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden animate-pulse cursor-pointer"
    >
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200 relative">
        <div className="absolute inset-0 bg-gray-300"></div>
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-col flex-1 p-6 space-y-3">
        {/* Product Name */}
        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        <div className="h-6 bg-gray-300 rounded w-1/2"></div>

        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-300 rounded-full"></div>
            ))}
          </div>
          <div className="h-4 bg-gray-300 rounded w-12"></div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mt-auto">
          <div className="h-6 bg-gray-300 rounded w-20"></div>
          <div className="h-6 bg-gray-300 rounded w-12"></div>
        </div>

        {/* Button */}
        <div className="h-10 bg-gray-300 rounded-lg mt-2 w-full"></div>
      </div>
    </motion.div>
  );
}


export function ProductCardSkeleton({ index = 0, viewMode = "grid" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className={`bg-white rounded-xl shadow-lg overflow-hidden relative ${
        viewMode === "list" ? "flex" : ""
      }`}
    >
      {/* Image Skeleton */}
      <div
        className={`${
          viewMode === "list" ? "w-48 h-full" : "aspect-square"
        } relative overflow-hidden rounded-lg`}
      >
        <div className="absolute inset-0 bg-gray-200">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-skeleton"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className={`p-6 flex-1 space-y-3`}>
        {/* Category & Rating */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 bg-gray-300 rounded"></div>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-300 rounded-full"></div>
            ))}
            <div className="h-4 w-8 bg-gray-300 rounded ml-1"></div>
          </div>
        </div>

        {/* Product Name */}
        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        <div className="h-6 bg-gray-300 rounded w-1/2"></div>

        {/* Reviews */}
        <div className="h-4 w-16 bg-gray-300 rounded"></div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-20 bg-gray-300 rounded"></div>
          <div className="h-6 w-12 bg-gray-300 rounded"></div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-2">
          <div className="h-10 flex-1 bg-gray-300 rounded-lg"></div>
          <div className="h-10 w-24 bg-gray-300 rounded-lg hidden"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes skeleton {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-skeleton {
          animation: skeleton 1.5s infinite;
        }
      `}</style>
    </motion.div>
  );
}

export function OrderCardShimmerSkeleton({ index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden relative"
    >
      {/* ===== Header ===== */}
      <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg relative overflow-hidden bg-gray-200 shimmer"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 rounded bg-gray-200 relative overflow-hidden shimmer"></div>
            <div className="h-3 w-24 rounded bg-gray-200 relative overflow-hidden shimmer"></div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="space-y-1 text-right flex-1">
            <div className="h-4 w-16 rounded bg-gray-200 relative overflow-hidden shimmer ml-auto"></div>
            <div className="h-3 w-12 rounded bg-gray-200 relative overflow-hidden shimmer ml-auto"></div>
          </div>
          <div className="h-6 w-20 rounded-full bg-gray-200 relative overflow-hidden shimmer"></div>
        </div>
      </div>

      {/* ===== Order Details ===== */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Items Ordered */}
        <div>
          <div className="h-5 w-24 rounded bg-gray-200 relative overflow-hidden shimmer mb-3"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-gray-100"
              >
                <div className="space-y-1 flex-1">
                  <div className="h-4 w-32 rounded bg-gray-200 relative overflow-hidden shimmer"></div>
                  <div className="h-3 w-20 rounded bg-gray-200 relative overflow-hidden shimmer"></div>
                </div>
                <div className="h-4 w-12 rounded bg-gray-200 relative overflow-hidden shimmer"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Info */}
        <div>
          <div className="h-5 w-32 rounded bg-gray-200 relative overflow-hidden shimmer mb-3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-lg bg-gray-200 relative overflow-hidden shimmer"
              ></div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-10 w-28 rounded-lg bg-gray-200 relative overflow-hidden shimmer"
            ></div>
          ))}
        </div>
      </div>

      {/* ===== Gradient Shimmer Animation ===== */}
      <style jsx>{`
        .shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          height: 100%;
          width: 150%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </motion.div>
  );
}

export default function CartItemSkeleton({ index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-gray-200 rounded-lg w-full"
    >
      {/* Image Skeleton */}
      <div className="w-24 h-24 sm:w-20 sm:h-20 rounded-lg relative overflow-hidden bg-gray-200 shimmer mx-auto sm:mx-0"></div>

      {/* Item Details Skeleton */}
      <div className="flex-1 text-center sm:text-left space-y-2">
        <div className="h-4 w-32 rounded bg-gray-200 relative overflow-hidden shimmer mx-auto sm:mx-0"></div>
        <div className="h-3 w-20 rounded bg-gray-200 relative overflow-hidden shimmer mx-auto sm:mx-0"></div>
        <div className="h-3 w-16 rounded bg-gray-200 relative overflow-hidden shimmer mx-auto sm:mx-0"></div>
      </div>

      {/* Quantity Controls Skeleton */}
      <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 sm:mt-0">
        <div className="w-8 h-8 rounded-full bg-gray-200 relative overflow-hidden shimmer"></div>
        <div className="w-16 h-10 rounded-lg bg-gray-200 relative overflow-hidden shimmer"></div>
        <div className="w-8 h-8 rounded-full bg-gray-200 relative overflow-hidden shimmer"></div>
      </div>

      {/* Price Skeleton */}
      <div className="text-center sm:text-right mt-2 sm:mt-0">
        <div className="h-4 w-16 rounded bg-gray-200 relative overflow-hidden shimmer mx-auto sm:mx-0"></div>
      </div>

      {/* Remove Button Skeleton */}
      <div className="w-8 h-8 rounded-lg bg-gray-200 relative overflow-hidden shimmer mx-auto sm:mx-0 mt-2 sm:mt-0"></div>

      {/* Gradient Shimmer Animation */}
      <style jsx>{`
        .shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          height: 100%;
          width: 150%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </motion.div>
  );
}
