"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/Button";
import toast from "react-hot-toast";
import Link from "next/link";
import { useGetProductQuery } from "@/api/services/productsApi";
import Image from "next/image";

export default function ProductPage() {
  const { productId } = useParams();
  const router = useRouter();
  const { data: product, isLoading } = useGetProductQuery(productId);

  useEffect(() => {
    if (!productId) {
      router.push("/products");
      toast.error("No product selected.");
    }
  }, [productId, router]);

  useEffect(() => {
    if (product) {
      toast.success("Product details loaded successfully.");
    }
  }, [product]);

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (!product) return <p className="p-6">Product not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Products
              </motion.button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Image & Details */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6 flex flex-col lg:flex-row gap-6"
            >
              <div className="flex-shrink-0 w-full lg:w-1/2 h-64 lg:h-80 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="object-cover w-full h-full rounded-lg"
                  unoptimized
                />
              </div>

              <div className="flex-1 space-y-4">
                <p className="text-gray-900 font-semibold text-xl">
                  ${product.price.toFixed(2)}{" "}
                  {product.originalPrice && (
                    <span className="line-through text-gray-400 ml-2 text-sm">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </p>
                <p className="text-gray-700">{product.description}</p>
                <p className="text-sm text-gray-500">
                  Category: {product.category}
                </p>
                <p className="text-sm text-gray-500">
                  {product.inStock
                    ? `In Stock (${product.stock})`
                    : "Out of Stock"}
                </p>
                <p className="text-sm text-gray-500">
                  Rating: {product.rating} ⭐ ({product.reviews} reviews)
                </p>
              </div>
            </motion.div>
          </div>

          {/* Product Summary / Action (Sticky) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6 sticky top-8 space-y-6"
          >
            <h3 className="text-xl font-semibold text-gray-900">Buy Now</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Price</span>
                <span className="font-semibold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
              </div>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Price</span>
                    <span className="font-semibold text-gray-900 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  </div>
                )}
              <div className="border-t pt-3">
                <p
                  className={`font-bold ${
                    product.inStock ? "text-gray-900" : "text-red-900"
                  }`}
                >
                  {product.inStock ? "Available" : "Out of Stock"}
                </p>
              </div>
            </div>
            <Button
              className="w-full"
              icon={ShoppingCart}
              variant="primary"
              disabled={!product.inStock}
            >
              Add to Cart
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
