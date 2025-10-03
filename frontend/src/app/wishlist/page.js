"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
} from "lucide-react";
import Button from "@/components/Button";

export default function WishlistPage() {
  const [wishlistedItems, setWishlistedItems] = useState([
    {
      id: 1,
      name: "Wireless Headphones",
      price: 99.99,
      image: "/api/placeholder/150/150",
      quantity: 2,
      inStock: true,
    },
    {
      id: 2,
      name: "Smart Watch",
      price: 199.99,
      image: "/api/placeholder/150/150",
      quantity: 1,
      inStock: true,
    },
    {
      id: 3,
      name: "Laptop Stand",
      price: 49.99,
      image: "/api/placeholder/150/150",
      quantity: 1,
      inStock: false,
    },
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setWishlistedItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setWishlistedItems((items) => items.filter((item) => item.id !== id));
  };

  const subtotal = wishlistedItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    // <div className="max-w-7xl mx-auto px-4 py-8">
    //   <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>
    //   <p className="text-gray-600">No items in your wishlist yet.</p>
    // </div>

    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Continue Shopping
              </motion.button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Your Wishlist</h1>
          <p className="text-gray-600 mt-2">
            {wishlistedItems.length}{" "}
            {wishlistedItems.length === 1 ? "item" : "items"} in your wishlist
          </p>
        </motion.div>

        {wishlistedItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven&apos;t added any items to your wishlist yet.
            </p>
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Exploring
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            {/* <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white rounded-lg shadow-sm"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Saved Items
                  </h2>
                  <div className="space-y-6">
                    {wishlistedItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.name}
                          </h3>
                          <p className="text-gray-600">${item.price}</p>
                          {!item.inStock && (
                            <p className="text-red-600 text-sm font-medium">
                              Out of Stock
                            </p>
                          )}
                        </div>

                        <Button
                          icon={ShoppingCart}
                          disabled={!item.inStock}
                          className={"disabled:opacity-50 disabled:cursor-not-allowed "}
                        >
                          Add to Cart
                        </Button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div> */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white rounded-lg shadow-sm"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Saved Items
                  </h2>

                  <div className="space-y-6">
                    {wishlistedItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-gray-200 rounded-lg"
                      >
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                          <ShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.name}
                          </h3>
                          <p className="text-gray-600">${item.price}</p>
                          {!item.inStock && (
                            <p className="text-red-600 text-sm font-medium">
                              Out of Stock
                            </p>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <div className="flex justify-center sm:justify-start">
                          <Button
                            icon={ShoppingCart}
                            disabled={!item.inStock}
                            className="disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Add to Cart
                          </Button>
                        </div>

                        {/* Remove Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mx-auto sm:mx-0"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 hidden">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm p-6 sticky top-8"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {shipping > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                      Add ${(50 - subtotal).toFixed(2)} more to get free
                      shipping!
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <Link href="/checkout">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>

                  <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    Save for Later
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Security & Privacy
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>SSL encrypted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>30-day returns</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
