import React from "react";
import { motion } from "framer-motion";
import Button from "./Button";
import { Heart, ShoppingBag, ShoppingCart, Star } from "lucide-react";
import { useAddToCartMutation, useGetCartQuery } from "@/api/services/cartApi";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

const FeaturedProductCard = ({ product,  index }) => {
  const router = useRouter();
  // const {
  //   data: cart,
  //   isLoading: loadingCart,
  //   isError,
  //   refetch,
  // } = useGetCartQuery();
  const [addToCart, { isLoading }] = useAddToCartMutation();

  const handleAddToCart = async (productId, quantity = 1, e) => {
    e.stopPropagation(); // prevent card click
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
   const handleCardClick = () => {
    router.push(`/products/${product._id}`);
  };

  return (
   <motion.div
      key={product._id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="flex flex-col bg-white rounded-xl shadow-md hover:shadow-2xl transition-shadow overflow-hidden cursor-pointer"
      onClick={handleCardClick} // card click
    >
      {/* Image */}
      <div className="aspect-square bg-gray-200 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-20"></div>
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

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        {/* Product Name (2-line clamp + tooltip) */}
        <h3
          className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-current" : ""}`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            ({product.reviews} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4 mt-auto">
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

        {/* Add to Cart */}
        <Button
          icon={ShoppingCart}
          iconPosition="left"
          variant="primary"
          size="md"
          disabled={!product.inStock}
          className={`w-full flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
            product.inStock
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          onClick={(e) => handleAddToCart(product._id, 1, e)}
          isLoading={isLoading}
        >
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </Button>
        
      </div>
    </motion.div>
  );
};

export default FeaturedProductCard;
