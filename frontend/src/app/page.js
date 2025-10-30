"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShoppingBag,
  Star,
  Truck,
  Shield,
  ArrowRight,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useListProductsQuery } from "@/api/services/productsApi";
import Button from "@/components/Button";
import FeaturedProductCard from "@/components/FeaturedProductCard";
import { FeaturedProductCardSkeleton } from "@/components/SkeletonLoaders";
import Image from "next/image";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const { data, isLoading, isError } = useListProductsQuery({
    sortBy: "featured",
  });

  useEffect(() => {
    if (data) {
      setFeaturedProducts(data.products);
    }
  }, [data]);

  const featuredProducts_Old = [
    {
      id: 1,
      name: "Wireless Headphones",
      price: 99.99,
      image: "/api/placeholder/300/300",
      rating: 4.5,
      reviews: 128,
    },
    {
      id: 2,
      name: "Smart Watch",
      price: 199.99,
      image: "/api/placeholder/300/300",
      rating: 4.8,
      reviews: 256,
    },
    {
      id: 3,
      name: "Laptop Stand",
      price: 49.99,
      image: "/api/placeholder/300/300",
      rating: 4.3,
      reviews: 89,
    },
    {
      id: 4,
      name: "Bluetooth Speaker",
      price: 79.99,
      image: "/api/placeholder/300/300",
      rating: 4.6,
      reviews: 203,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Discover Amazing
                <span className="block text-yellow-300">Products</span>
              </h1>
              <p className="text-xl text-blue-100 max-w-lg">
                Shop the latest trends and find everything you need at
                unbeatable prices. Fast shipping, quality guaranteed.
              </p>
              {/* <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products" className="inline-block">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-colors"
                  >
                    Shop Now
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Learn More
                </motion.button>
              </div> */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Shop Now Button (Link) */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto"
                >
                  <Link
                    href="/products"
                    className="inline-block bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-colors text-center w-full"
                  >
                    Shop Now
                  </Link>
                </motion.div>

                {/* Learn More Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors w-full sm:w-auto"
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((item) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + item * 0.1 }}
                      className="bg-white/20 rounded-lg p-4 text-center"
                    >
                      <div className="w-16 h-16 bg-white/30 rounded-lg mx-auto mb-2"></div>
                      <p className="text-sm font-medium">Product {item}</p>
                    </motion.div>
                  ))}
                </div>
              </div> */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
                  {isLoading &&
                    [1, 2, 3, 4].map((item) => (
                      <motion.div
                        key={`loadingHero${item}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 + item * 0.1 }}
                        className="relative w-full rounded-lg overflow-hidden shadow-sm cursor-pointer"
                      >
                        <div className="w-full pt-[100%] relative overflow-hidden rounded-lg animate-pulse">
                          <div className="absolute top-0 left-0 w-full h-full w-16 h-16 object-cover transition-transform duration-300 hover:scale-105 animate-pulse"></div>
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/60 to-transparent pointer-events-none animate-pulse"></div>
                          <div className="absolute top-2 left-2 right-2 z-10 animate-pulse"></div>
                        </div>
                      </motion.div>
                    ))}

                  {featuredProducts?.slice(0, 4).map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      className="relative w-full rounded-lg overflow-hidden shadow-sm cursor-pointer"
                    >
                      <Link href={`products/${item._id}`}>
                        {/* Square Image Container */}
                        <div className="w-full pt-[100%] relative overflow-hidden rounded-lg">
                          {/* Image */}
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="absolute top-0 left-0 w-full h-full w-16 h-16 object-cover transition-transform duration-300 hover:scale-105"
                          />

                          {/* Gradient Overlay */}
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/60 to-transparent pointer-events-none"></div>

                          {/* Product Name */}
                          <p className="absolute top-2 left-2 right-2 text-white font-semibold text-sm line-clamp-2 z-10">
                            {item.name}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We&apos;re committed to providing the best shopping experience
              with quality products and excellent service.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Truck className="w-8 h-8" />,
                title: "Fast Shipping",
                description:
                  "Free shipping on orders over $50. Get your products delivered quickly and safely.",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Secure Payment",
                description:
                  "Your payment information is protected with bank-level security encryption.",
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "Quality Guarantee",
                description:
                  "We stand behind our products with a 30-day money-back guarantee.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow"
              >
                <div className="text-blue-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl md:text-4xl font-bold text-white-600 mb-4" // changed text-gray-900 to text-white-600
            >
              Featured Products
            </h2>
            <p
              className="text-xl text-gray-400 max-w-2xl mx-auto" // changed text-gray-600 to text-gray-400
            >
              Check out our most popular items that customers love.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 hidden">
            {featuredProducts?.slice(0, 4)?.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="aspect-square bg-gray-200 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-20"></div>
                  {/* Product Image or Fallback */}
                  {product?.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShoppingBag className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating) ? "fill-current" : ""
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                      ({product.reviews} reviews)
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-blue-600">
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      icon={ShoppingCart}
                      iconPosition="left"
                      variant="primary"
                      size="md"
                      disabled={!product.inStock}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                        product.inStock
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      // onClick={() => handleAddToCart(product._id, 1)}
                      // isLoading={isLoading}
                    >
                      {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
            {/* {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="aspect-square bg-gray-200 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 text-gray-400" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating) ? 'fill-current' : ''
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                      ({product.reviews} reviews)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      ${product.price}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add to Cart
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))} */}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading &&
              [1, 2, 3, 4].map((index) => (
                <FeaturedProductCardSkeleton
                  key={`loadingFeaturedProducts${index}`}
                  index={index}
                />
              ))}
            {featuredProducts?.slice(0, 4)?.map((product, index) => (
              <FeaturedProductCard
                key={product._id}
                product={product}
                index={index}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
              >
                View All Products
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Stay Updated
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Subscribe to our newsletter and get 10% off your first order plus
              exclusive deals and updates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-400" // border-0 removed
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
