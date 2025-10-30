"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  StarHalf,
  Zap,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/Button";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  useGetProductQuery,
  useListProductsQuery,
} from "@/api/services/productsApi";
import { useAddToCartMutation, useGetCartQuery } from "@/api/services/cartApi";
import { useCreateCheckoutSessionMutation } from "@/api/services/orderApi";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ResourceNotFound } from "@/components/ResourceNotFound";
import Image from "next/image";

function ProductImageZoom({ src }) {
  const [zoom, setZoom] = useState(false);
  const [backgroundPos, setBackgroundPos] = useState("50% 50%");

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setBackgroundPos(`${x}% ${y}%`);
  };

  return (
    <div className="relative w-full lg:w-1/2 h-80 bg-gray-100 rounded-lg flex">
      {/* Main Image */}
      <Image
        src={src}
        alt="Product image"
        fill
        className="object-cover rounded-lg cursor-zoom-in"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
        sizes="(max-width: 1024px) 100vw, 50vw"
        unoptimized
      />

      {/* Zoomed Image */}
      {zoom && (
        <div
          className="absolute top-0 left-full z-50 w-[30rem] h-[30rem] bg-no-repeat rounded-lg border border-gray-300"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: "200%",
            backgroundPosition: backgroundPos,
          }}
        />
      )}

      {/* Fullscreen Zoom Overlay
      {zoom && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 cursor-zoom-out"
          onMouseLeave={() => setZoom(false)}
        >
          <div
            className="w-3/4 h-3/4 bg-no-repeat bg-contain bg-center rounded-lg shadow-lg"
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: "200%",
              backgroundPosition: backgroundPos,
            }}
          ></div>
        </div>
      )} */}
    </div>
  );
}

export default function ProductPage() {
  const { productId } = useParams();
  const router = useRouter();
  const { data: product, isLoading } = useGetProductQuery(productId);
  const {
    data: relatedProducts,
    isLoading: isLoadingRelatedProduct,
    isError: isErrorInRelatedProduct,
  } = useListProductsQuery({ category: product?.category }); // Related products API
  // const {
  //   data: cart,
  //   isLoading: loadingCart,
  //   isError,
  //   refetch,
  // } = useGetCartQuery();
  const [addToCart, { isLoading: isLoadingAddToCart }] = useAddToCartMutation();
  const [createOrder, { isLoading: isLoadingCreateOrder }] =
    useCreateCheckoutSessionMutation();
  const [quantity, setQuantity] = useState(1);
  // const [subTotal, setSubTotal] = useState(0);
  const subTotal = (product?.price || 0) * quantity;
  const shipping = subTotal > 50 ? 0 : 9.99;
  const tax = subTotal * 0.08;
  const total = subTotal + shipping + tax;

  useEffect(() => {
    if (!productId) {
      router.push("/products");
      toast.error("No product selected.");
    }
  }, [productId, router]);

  useEffect(() => {
    if (product) toast.success("Product loaded successfully.");
  }, [product]);

  const handleAddToCart = async () => {
    // console.log(productId, quantity, isLoading);

    try {
      await addToCart({ productId, quantity }).unwrap();
      // refetch(); // refresh cart
      toast.success("Product added to cart");
    } catch (err) {
      console.error("Failed to add to cart:", err);
      toast.error("Failed to add to cart");
    }
  };
  const handleCheckout = async () => {
    try {
      const order = await createOrder({
        items: [
          {
            productId,
            quantity,
          },
        ],
        shippingFee: shipping,
      }).unwrap();

      console.log("✅ Order created:", order);
      toast.success("Order placed successfully!");
      // ✅ redirect to checkout page (e.g. /checkout/[orderId])
      if (order.id) {
        router.push(`/checkout/${order.id}`);
      }
    } catch (err) {
      console.error("❌ Failed to create order:", err);
      toast(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } flex items-center`}
          >
            <span>Failed to create order</span>
            <Button onClick={() => toast.dismiss(t.id)} className="ml-4">
              Dismissc
            </Button>
          </div>
        ),
        { duration: Infinity }
      );

      //   toast.error("Failed to create order");
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
      //   onQuantityChange(item.productId, value);
    }
  };
  const increment = () => setQuantity((q) => Math.min(q + 1, product.stock));
  const decrement = () => setQuantity((q) => Math.max(q - 1, 1));

  const renderRating = () => {
    const fullStars = Math.floor(product.rating);
    const halfStar = product.rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-1 text-yellow-500">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="w-4 h-4" />
        ))}
        {halfStar && <StarHalf className="w-4 h-4" />}
        <span className="text-gray-600 ml-2">({product.reviews} reviews)</span>
      </div>
    );
  };

  // if (isLoading) return <p className="p-6">Loading...</p>;
  // if (!product) return <p className="p-6">Product not found.</p>;
  if (isLoading) return <LoadingSpinner />;
  if (!product)
    return (
      <ResourceNotFound
        message="This product could not be loaded."
        subtext="It may have been removed or is temporarily unavailable."
        actionLabel="Back to Products"
        // onAction={() => navigate("/products")}
        route={"/products"}
        resourceType={"product"}
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
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Image & Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6 flex flex-col lg:flex-row gap-6"
            >
              {/* Image */}
              {/* <div className="flex-shrink-0 w-full lg:w-1/2 h-80 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div> */}
              {/* Image with zoom */}
              {/* <div className="flex-shrink-0 w-full lg:w-1/2 relative">
                <div
                  className={`w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden cursor-zoom-in ${
                    zoomed
                      ? "z-50 fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-80 items-center justify-center"
                      : ""
                  }`}
                  onClick={() => setZoomed(!zoomed)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`object-cover transition-transform duration-300 ${
                      zoomed ? "scale-150" : "scale-100"
                    } rounded-lg`}
                  />
                  {zoomed && (
                    <button
                      className="absolute top-5 right-5 text-white text-xl font-bold"
                      onClick={() => setZoomed(false)}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div> */}
              {/* Image with hover zoom */}
              <ProductImageZoom src={product.image} />

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div>
                  {product.isNewProduct && (
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
                      New
                    </span>
                  )}
                  <h1 className="text-2xl font-bold text-gray-900">
                    {product.name}
                  </h1>
                  <p className="text-sm text-gray-500">{product.category}</p>
                  {renderRating()}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </p>
                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <span className="line-through text-gray-400">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                  </div>

                  <p
                    className={`text-sm font-medium ${
                      product.inStock ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {product.inStock
                      ? `In Stock (${product.stock})`
                      : "Out of Stock"}
                  </p>

                  {/* Quantity
                  {product.inStock && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">Quantity:</span>
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <button
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                          onClick={decrement}
                        >
                          -
                        </button>
                        <span className="px-4 py-1">{quantity}</span>
                        <button
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                          onClick={increment}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )} */}
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">Quantity:</span>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 sm:mt-0 ms-auto">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        //   onClick={() => onQuantityChange(item.productId, quantity - 1)}
                        onClick={decrement}
                        disabled={quantity <= 1}
                        className="p-2 sm:p-1 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900"
                      >
                        <Minus className="w-4 h-4" />
                      </motion.button>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 w-16 text-center"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        //   onClick={() => onQuantityChange(item.productId, quantity + 1)}
                        onClick={increment}
                        disabled={quantity >= product.stock}
                        className="p-2 sm:p-1 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900"
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  {/* <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Button
                      className="w-full sm:w-auto"
                      icon={ShoppingCart}
                      //   variant="primary"
                      variant="primary-outline"
                      disabled={!product.inStock}
                    >
                      Add to Cart
                    </Button>
                    <Button
                      icon={Zap}
                      className="w-full sm:w-auto"
                      //   variant="primary-outline"
                      variant="primary"
                      disabled={!product.inStock}
                    >
                      Buy Now
                    </Button>
                  </div> */}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row w-full mt-4">
                    <Button
                      className="flex-1 rounded-none rounded-l-md sm:rounded-l-md sm:rounded-none"
                      icon={ShoppingCart}
                      variant="primary-outline"
                      disabled={!product.inStock}
                      onClick={handleAddToCart}
                      isLoading={isLoadingAddToCart}
                    >
                      Add to Cart
                    </Button>
                    <Button
                      icon={Zap}
                      className="flex-1 rounded-none rounded-r-md sm:rounded-r-md sm:rounded-none"
                      variant="primary"
                      disabled={!product.inStock}
                      onClick={handleCheckout}
                    >
                      Buy Now
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Product Description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Product Description
              </h2>
              <p className="text-gray-700">{product.description}</p>
            </motion.div>
          </div>

          {/* Sticky Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6 sticky top-8 space-y-6"
          >
            <h3 className="text-xl font-semibold text-gray-900">
              Quick Summary
            </h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                Price:{" "}
                <span className="font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-600">
                  {" "}
                  &nbsp; x{quantity}
                </span>
              </p>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <p className="text-gray-500 line-through">
                    Original Price: ${product.originalPrice.toFixed(2)}
                  </p>
                )}
              <p
                className={product.inStock ? "text-green-600" : "text-red-600"}
              >
                {product.inStock ? "In Stock" : "Out of Stock"}
              </p>
            </div>

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
                  Add ${(50 - subTotal).toFixed(2)} more to get free shipping!
                </p>
              </div>
            )}
            <div>
              <Button
                className="w-full mb-4"
                icon={ShoppingCart}
                variant="primary-outline"
                disabled={!product.inStock}
                onClick={handleAddToCart}
                isLoading={isLoadingAddToCart}
              >
                Add to Cart
              </Button>
              <Button
                icon={Zap}
                className="w-full"
                variant="primary"
                disabled={!product.inStock}
                onClick={handleCheckout}
              >
                Buy Now
              </Button>
            </div>
          </motion.div>
        </div>
        {/* Related Products with Snaping*/}
        {relatedProducts?.products && relatedProducts.products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Related Products
            </h2>
            <div className="flex gap-4 pb-2 overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar">
              {relatedProducts.products.map((p) => (
                <Link
                  key={p._id}
                  href={`/products/${p._id}`}
                  className="flex-shrink-0 w-48 bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow snap-start"
                >
                  <div className="relative w-full h-32">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="192px"
                      unoptimized
                    />
                  </div>

                  <div className="p-2">
                    <h3 className="text-sm font-medium text-gray-900">
                      {p.name}
                    </h3>
                    <p className="text-sm text-gray-700">
                      ${p.price.toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
