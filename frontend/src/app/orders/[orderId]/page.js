"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Truck,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  CreditCard,
  ClipboardCheck,
  ArrowLeft,
  Check,
  CreditCardIcon,
  LucideCreditCard,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetOrderQuery,
  useLazyDownloadInvoiceQuery,
} from "@/api/services/orderApi";
import { getStatusColor, getStatusIcon } from "@/utils/statusHelpers";
import Button from "@/components/Button";
import toast from "react-hot-toast";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ResourceNotFound } from "@/components/ResourceNotFound";
import Image from "next/image";

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const { data: order, isLoading } = useGetOrderQuery(orderId);
  const [triggerDownload, { isLoading: isLoadingDownload }] =
    useLazyDownloadInvoiceQuery();

  useEffect(() => {
    if (!orderId) {
      router.push("/orders");
      toast.error("No order found. Please Select any Order.");
    } // else remain on the page to complete checkout
  }, [orderId, router]);

  useEffect(() => {
    if (order) {
      toast.success("Order details loaded successfully.");
    }
  }, [order]);

  const handleDownload = async () => {
    const blob = await triggerDownload(orderId).unwrap();
    // const blob = responce.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${orderId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // if (isLoading) return <p className="p-6">Loading...</p>;
  // if (!order) return <p className="p-6">Order not found.</p>;
  if (isLoading) return <LoadingSpinner />;
  if (!order)
    return (
      <ResourceNotFound
        message="This order could not be loaded."
        subtext="It may not exist or there was an issue fetching the details."
        actionLabel="Back to Orders"
        route={"/orders"}
        resourceType={"order"}
      />
    );

  return (
    <>
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
              <Link href="/orders">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Orders
                </motion.button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Header */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Order #{order.orderNumber}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Ordered on {order.createdAt.split("T")[0]}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </motion.div>

              {/* Items Ordered */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Items Ordered
                </h3>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="relative w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {item?.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover rounded-lg"
                            sizes="64px"
                            unoptimized
                          />
                        ) : (
                          <CreditCard className="w-8 h-8 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Shipping Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Shipping Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-700">
                  <div className="bg-gray-50 px-3 py-2 rounded-lg flex flex-col">
                    <span className="text-xs font-medium text-gray-500">
                      Name
                    </span>
                    <span className="text-sm text-gray-900">
                      {order.shippingInfo?.firstName}{" "}
                      {order.shippingInfo?.lastName}
                    </span>
                  </div>
                  <div className="bg-gray-50 px-3 py-2 rounded-lg flex flex-col">
                    <span className="text-xs font-medium text-gray-500">
                      Email
                    </span>
                    <span className="text-sm text-gray-900">
                      {order.shippingInfo?.email}
                    </span>
                  </div>
                  <div className="bg-gray-50 px-3 py-2 rounded-lg flex flex-col">
                    <span className="text-xs font-medium text-gray-500">
                      Phone
                    </span>
                    <span className="text-sm text-gray-900">
                      {order.shippingInfo?.phone}
                    </span>
                  </div>
                  <div className="bg-gray-50 px-3 py-2 rounded-lg flex flex-col col-span-1 sm:col-span-2 lg:col-span-3">
                    <span className="text-xs font-medium text-gray-500">
                      Address
                    </span>
                    <span className="text-sm text-gray-900">
                      {order.shippingInfo?.address}, {order.shippingInfo?.city},{" "}
                      {order.shippingInfo?.state} {order.shippingInfo?.zipCode}
                    </span>
                  </div>
                  <div className="bg-gray-50 px-3 py-2 rounded-lg flex flex-col">
                    <span className="text-xs font-medium text-gray-500">
                      Country
                    </span>
                    <span className="text-sm text-gray-900">
                      {order.shippingInfo?.country}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Order Summary (Sticky) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6 sticky top-8 space-y-6"
            >
              <h3 className="text-xl font-semibold text-gray-900">
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ${order.subtotal}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {parseInt(order.shippingFee) === 0
                      ? "Free"
                      : `$${order.shippingFee}`}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-600">Total</span>
                    <span className="text-gray-900">${order.total}</span>
                  </div>
                </div>
              </div>
              {/* <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-green-800">
                  Secure checkout with SSL encryption
                </span>
              </div> */}
              {order.trackingNumber && (
                <Button className="w-full" icon={Truck} variant="ghost">
                  Track Package
                </Button>
              )}
              {(order.status === "paid" || order.status === "fulfilled") && (
                <Button
                  className="w-full"
                  icon={Download}
                  variant="ghost-outline"
                  isLoading={isLoadingDownload}
                  onClick={handleDownload}
                >
                  Download Invoice
                </Button>
              )}
              {order.status === "pending" && (
                <Link href={`/checkout/${order.id}`}>
                  <Button
                    // icon={CreditCardIcon}
                    icon={LucideCreditCard}
                    variant="primary"
                    className="w-full"
                  >
                    Continue Checkout
                  </Button>
                </Link>
              )}
              {order.status === "Delivered" && (
                <Button
                  icon={RefreshCw}
                  variant="ghost"
                  className="border border-gray-300"
                >
                  Reorder
                </Button>
              )}
              {order.trackingNumber && (
                <Button
                  icon={Truck}
                  variant="ghost"
                  className="border border-gray-300"
                >
                  Track Package
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
