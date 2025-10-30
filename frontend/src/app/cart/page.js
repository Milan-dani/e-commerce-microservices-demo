"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import Button from "@/components/Button";
import {
  useAddToCartMutation,
  useGetCartQuery,
  useRemoveFromCartMutation,
  useUpdateCartItemMutation,
} from "@/api/services/cartApi";
import {
  useGetProductQuery,
  useListProductsQuery,
} from "@/api/services/productsApi";
import toast from "react-hot-toast";
import CheckoutButton from "@/components/CheckoutButton";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ResourceNotFound } from "@/components/ResourceNotFound";
import { EmptyState } from "@/components/EmptyState";
import CartItemSkeleton from "@/components/SkeletonLoaders";
import Image from "next/image";

const CartItem = ({
  item,
  index,
  onQuantityChange,
  onRemove,
  onProductLoaded,
}) => {
  const { data: product, isLoading } = useGetProductQuery(item.productId);
  const [quantity, setQuantity] = useState(item.quantity);

  useEffect(() => setQuantity(item.quantity), [item.quantity]);
  // const handleChange = (e) => {
  //   const value = parseInt(e.target.value);
  //   if (!isNaN(value) && value > 0) {
  //     setQuantity(value);
  //     onQuantityChange(item.productId, value);
  //   }
  // };
  const handleChange = (e) => {
    let value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) value = 1;
    if (value > product.stock) value = product.stock;
    setQuantity(value);
    onQuantityChange(item.productId, value);
  };

  useEffect(() => {
    if (!product) return;
    if (product) onProductLoaded(item.productId, product);
  }, [product, item.productId, onProductLoaded]);

  if (isLoading || !product) {
    return (
      <div className="p-4 border rounded-lg flex items-center justify-center">
        Loading product...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-gray-200 rounded-lg w-full"
    >
      {/* Image */}
      {product?.image ? (
        <div className="relative w-24 h-24 sm:w-20 sm:h-20 mx-auto sm:mx-0">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 640px) 96px, 80px"
            unoptimized
          />
        </div>
      ) : (
        <div className="w-24 h-24 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
          <ShoppingBag className="w-8 h-8 text-gray-400" />
        </div>
      )}

      {/* Item Details */}
      <div className="flex-1 text-center sm:text-left">
        <h3 className="text-lg font-semibold text-gray-900">
          {product?.name || "Loading..."}
        </h3>
        <p className="text-gray-600">${product?.price?.toFixed(2) || "N/A"}</p>
        {!product.inStock && (
          <p className="text-red-600 text-sm font-medium mt-1">Out of Stock</p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 sm:mt-0">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onQuantityChange(item.productId, quantity - 1)}
          disabled={quantity <= 1}
          className="p-2 sm:p-1 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900"
        >
          <Minus className="w-4 h-4" />
        </motion.button>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 w-16 text-center"
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onQuantityChange(item.productId, quantity + 1)}
          disabled={quantity >= product.stock}
          className="p-2 sm:p-1 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Price */}
      <div className="text-center sm:text-right mt-2 sm:mt-0">
        <p className="text-lg font-semibold text-gray-900">
          ${((product.price || 0) * quantity).toFixed(2)}
        </p>
      </div>

      {/* Remove Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onRemove(item.productId)}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mx-auto sm:mx-0 mt-2 sm:mt-0"
      >
        <Trash2 className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
};

export default function Cart() {
  const { data: cart, isLoading, isError, refetch } = useGetCartQuery();
  const [addToCart] = useAddToCartMutation();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  const [quantities, setQuantities] = useState({});

  const handleAdd = async (productId) => {
    const quantity = quantities[productId]
      ? parseInt(quantities[productId])
      : 1;
    try {
      await addToCart({ productId, quantity }).unwrap();
      setQuantities({ ...quantities, [productId]: 1 }); // reset input
      refetch(); // refresh cart
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart({ productId }).unwrap();
      refetch(); // refresh cart
      toast.success("Item removed from cart");
    } catch (err) {
      console.error("Failed to remove from cart:", err);
      toast.error("Failed to remove item from cart");
    }
  };

  // const handleQuantityChange = (productId, value) => {
  //   if (value < 1) value = 1;
  //   setQuantities({ ...quantities, [productId]: value });
  // };
  const handleQuantityChange = async (productId, value) => {
    if (value < 1) value = 1;
    setQuantities({ ...quantities, [productId]: value });

    try {
      await updateCartItem({ productId, quantity: parseInt(value) }).unwrap();
      refetch(); // updates cart UI
    } catch (err) {
      console.error("Failed to update cart item:", err);
    }
  };

  // ------------------------
  // const subtotal = cart?.items?.reduce(
  //   (total, item) => total + item.price * item.quantity,
  //   0
  // );
  const [productsMap, setProductsMap] = React.useState({});
  const [subTotal, setSubTotal] = React.useState(0);

  // Called by each CartItem when its product data loads
  // const handleProductLoaded = (productId, productData) => {
  //   setProductsMap((prev) => ({ ...prev, [productId]: productData }));
  // };
  //   const handleProductLoaded = useCallback((productId, productData) => {
  //   setProductsMap((prev) => ({ ...prev, [productId]: productData }));
  // }, []);
  const handleProductLoaded = useCallback((productId, productData) => {
    setProductsMap((prev) => {
      if (prev[productId]) return prev; // prevent unnecessary update
      return { ...prev, [productId]: productData };
    });
  }, []);

  // Recalculate subtotal whenever cart or productsMap changes
  React.useEffect(() => {
    if (!cart?.items?.length) {
      setSubTotal(0);
      return;
    }
    let total = 0;
    for (const item of cart.items) {
      const price = productsMap[item.productId]?.price || 0;
      total += price * item.quantity;
    }
    setSubTotal(total);
  }, [cart, productsMap]);

  // const subtotal = total; //  total

  const shipping = subTotal > 50 ? 0 : 9.99;
  const tax = subTotal * 0.08;
  const total = subTotal + shipping + tax;

  // if (isLoading) return <p>Loading cart...</p>;
  // if (isError) return <p>Error loading cart.</p>;

  // if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <ResourceNotFound
        message="Your cart could not be loaded."
        subtext="Something went wrong while fetching your cart. Please try again."
        actionLabel="Go to Home"
        route={"/"}
        resourceType={"cart"}
      />
    );

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
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {cart && cart.items.length
              ? `${cart.items.length} ${
                  cart.items.length === 1 ? "item" : "items"
                } in your cart`
              : "No cart items found"}
          </p>
        </motion.div>

        {isLoading ? (
          // Show skeleton loader while cart is loading
          [1, 2, 3, 4].map((index) => (
            <CartItemSkeleton key={`cartSkeleton${index}`} index={index} />
          ))
        ) : !cart || cart.items.length === 0 ? (
          // <motion.div
          //   initial={{ opacity: 0, y: 20 }}
          //   animate={{ opacity: 1, y: 0 }}
          //   transition={{ duration: 0.6 }}
          //   className="text-center py-16"
          // >
          //   <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          //   <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          //     Your cart is empty
          //   </h2>
          //   <p className="text-gray-600 mb-8">
          //     Looks like you haven&apos;t added any items to your cart yet.
          //   </p>
          //   <Link href="/products">
          //     <motion.button
          //       whileHover={{ scale: 1.05 }}
          //       whileTap={{ scale: 0.95 }}
          //       className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          //     >
          //       Start Shopping
          //     </motion.button>
          //   </Link>
          // </motion.div>
          <EmptyState
            message="Your cart is empty"
            subtext="You haven&rsquo;t added anything yet. Start exploring our products."
            actionLabel="Browse Products"
            route="/products" // if applicable
            resourceType={"cart"}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white rounded-lg shadow-sm"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Cart Items
                  </h2>

                  <div className="space-y-6">
                    {cart.items.map((item, index) => (
                      <CartItem
                        key={`${item.productId}-componenet`}
                        item={item}
                        index={index}
                        onQuantityChange={handleQuantityChange}
                        onRemove={handleRemove}
                        onProductLoaded={handleProductLoaded}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
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
                    <span className="font-semibold text-gray-900">
                      ${subTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-gray-900">
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold text-gray-900">
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-600">Total</span>
                      <span className="text-gray-900">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {shipping > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                      Add ${(50 - subTotal).toFixed(2)} more to get free
                      shipping!
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  {/* <Link href="checkout/0c97cc5d-dd38-4551-ab01-32ca8f2f5a2c">
                  <span className="text-blue-900">
                    static checkout link for testing
                    </span>
                  </Link> */}

                  {/* <Link href="/checkout"> */}
                  {/* <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-5 h-5" />
                    </motion.button> */}
                  <CheckoutButton cartItems={cart} shippingFee={shipping} />
                  {/* <Button
                      icon={ArrowRight}
                      iconPosition="right"
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mb-2"
                    >
                      Proceed to Checkout
                    </Button> */}
                  {/* </Link> */}

                  {/* <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    Save for Later
                  </button> */}
                  <Button
                    variant="secondary"
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Save for Later
                  </Button>
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
