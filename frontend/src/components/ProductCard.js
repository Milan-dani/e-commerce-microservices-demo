import React from "react";
import { motion } from "framer-motion";
import Button from "./Button";
import { Heart, ShoppingBag, ShoppingCart, Star } from "lucide-react";
import { useAddToCartMutation, useGetCartQuery } from "@/api/services/cartApi";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

const ProductCard = ({ product, viewMode, index }) => {
  // const {
  //   data: cart,
  //   isLoading: loadingCart,
  //   isError,
  //   refetch,
  // } = useGetCartQuery();
  const [addToCart, { isLoading }] = useAddToCartMutation();

  const handleAddToCart = async (productId, quantity = 1) => {
    console.log(productId, quantity, isLoading);

    try {
      await addToCart({ productId, quantity }).unwrap();
      // refetch(); // refresh cart
      toast.success("Product added to cart");
    } catch (err) {
      console.error("Failed to add to cart:", err);
      toast.error("Failed to add to cart");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${
        viewMode === "list" ? "flex" : ""
      }`}
    >
      {/* <div
        className={`${
          viewMode === "list" ? "w-48 h-full" : "aspect-square"
        } bg-gray-200 relative`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <ShoppingCart className="w-16 h-16 text-gray-400" />
        </div>

        {product.isNewProduct && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            New
          </div>
        )}
        <button className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
          <Heart className="w-5 h-5 text-gray-600" />
        </button>
      </div> */}
      <div
        className={`${
          viewMode === "list" ? "w-48 h-full" : "aspect-square"
        } bg-gray-200 relative overflow-hidden rounded-lg`}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-20" />

        {/* Product Image or Fallback */}
        {product?.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <ShoppingBag className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {/* New Product Badge */}
        {product.isNewProduct && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            New
          </div>
        )}

        {/* Favorite (Heart) Button */}
        <button className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
          <Heart className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{product.category}</span>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
          </div>
        </div>

        <h3
          className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]"
          title={product.name}
        >
          {product.name}
        </h3>

        <div className="flex items-center mb-3">
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
          {!product.inStock && (
            <span className="text-sm text-red-600 font-medium">
              Out of Stock
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {/* <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={!product.inStock}
                            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors hidden ${
                              product.inStock
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            {product.inStock ? "Add to Cart" : "Out of Stock"}
                          </motion.button> */}
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
            onClick={() => handleAddToCart(product._id, 1)}
            isLoading={isLoading}
          >
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
          {/* <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors hidden"
                          >
                            View
                          </motion.button> */}
          <Link href={`products/${product._id}`}>
            <Button
              iconPosition="left"
              variant="ghost"
              size="md"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors hidden"
            >
              View
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
