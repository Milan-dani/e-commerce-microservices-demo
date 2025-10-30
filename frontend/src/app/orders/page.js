"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Package,
  Eye,
  Download,
  RefreshCw,
  ArrowLeft,
  Truck,
} from "lucide-react";
import Button from "@/components/Button";
import { useLazyDownloadInvoiceQuery, useListOrdersQuery } from "@/api/services/orderApi";
import { getStatusColor, getStatusIcon } from "@/utils/statusHelpers";
import { EmptyState } from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ResourceNotFound } from "@/components/ResourceNotFound";
import { OrderCardShimmerSkeleton } from "@/components/SkeletonLoaders";
import toast from "react-hot-toast";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "all",
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
    const [triggerDownload , {isLoading: isLoadingDownload}] = useLazyDownloadInvoiceQuery();
  const { data, isLoading, isError } = useListOrdersQuery({
    page: filters.page,
    limit: filters.limit,
    status: filters.status,
  });
  useEffect(() => {
    if (data) {
      setOrders(data.orders);
      setTotalPages(data.totalPages);
      setTotalOrders(data.total);
    }
  }, [data]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1, // reset page on any filter change except page
    }));
  };
  const handleStatusChange = (value) => updateFilter("status", value);

 const handleDownload = async (orderId, orderNumber) => {
  if (orderId) {
    
    const blob = await triggerDownload(orderId).unwrap();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${orderNumber || orderId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    toast.warn("no order ID");
  }
  };

  // const getStatusIcon = (status) => {
  //   switch (status) {
  //     case "Delivered":
  //       return <CheckCircle className="w-5 h-5 text-green-600" />;
  //     case "Shipped":
  //       return <Truck className="w-5 h-5 text-blue-600" />;
  //     case "Processing":
  //       return <Clock className="w-5 h-5 text-yellow-600" />;
  //     case "Cancelled":
  //       return <XCircle className="w-5 h-5 text-red-600" />;
  //     default:
  //       return <Package className="w-5 h-5 text-gray-600" />;
  //   }
  // };

  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case "Delivered":
  //       return "bg-green-100 text-green-800";
  //     case "Shipped":
  //       return "bg-blue-100 text-blue-800";
  //     case "Processing":
  //       return "bg-yellow-100 text-yellow-800";
  //     case "Cancelled":
  //       return "bg-red-100 text-red-800";
  //     default:
  //       return "bg-gray-100 text-gray-800";
  //   }
  // };

  // const filteredOrders =
  //   filterStatus === "all"
  //     ? orders
  //     : orders.filter(
  //         (order) => order.status.toLowerCase() === filterStatus.toLowerCase()
  //       );

  // if (isLoading) return <LoadingSpinner />;
  // if (!data)
  if (isError)
    return (
      <ResourceNotFound
        message="Orders Could not be loaded."
        subtext="there is some issues and Orders could not be loaded."
        actionLabel="Back to Home"
        route={"/"}
        resourceType={"order"}
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
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </motion.button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
          <p className="text-gray-600 mt-2">Track and manage your orders</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Filter by status:
              </span>
              <select
                value={filters.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="fulfilled">Fulfilled</option>

                {/* <option value="all">All Orders</option>
                <option value="delivered">Delivered</option>
                <option value="shipped">Shipped</option>
                <option value="processing">Processing</option>
                <option value="cancelled">Cancelled</option> */}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {totalOrders} {totalOrders === 1 ? "order" : "orders"} found
              </span>
            </div>
          </div>
        </motion.div>

        {/* Orders List */}
        <div className="space-y-6">

          {/* Skleton Loader  */}
          {isLoading &&
            [1, 2, 3, 4, 5].map((index) => (
              <OrderCardShimmerSkeleton
                key={`loadingFeaturedProducts${index}`}
                index={index}
              />
            ))}

          {orders.length === 0 && !isLoading ? (
            // <motion.div
            //   initial={{ opacity: 0, y: 20 }}
            //   animate={{ opacity: 1, y: 0 }}
            //   transition={{ duration: 0.6 }}
            //   className="bg-white rounded-lg shadow-sm p-12 text-center"
            // >
            //   <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            //   <h3 className="text-lg font-medium text-gray-900 mb-2">
            //     No orders found
            //   </h3>
            //   <p className="text-gray-600 mb-6">
            //     {filters.status === "all"
            //       ? "You haven't placed any orders yet."
            //       : `No orders with status "${filters.status}" found.`}
            //   </p>
            //   <Link href="/products">
            //     <motion.button
            //       whileHover={{ scale: 1.05 }}
            //       whileTap={{ scale: 0.95 }}
            //       className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            //     >
            //       Start Shopping
            //     </motion.button>
            //   </Link>
            // </motion.div>
            <EmptyState
              message="No orders found"
              subtext="Try changing your filters or check back later for new orders."
              actionLabel="Start Shopping"
              route="/products" // if applicable
              resourceType={"order"}
            />
          ) : (
            orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {/* ===== Order Header ===== */}
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Left side: order ID + date */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Ordered on {order.createdAt.split("T")[0]}
                        </p>
                      </div>
                    </div>

                    {/* Right side: total + status */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-base sm:text-lg font-semibold text-gray-900">
                          ${order.total}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {order.items.length} items
                        </p>
                      </div>
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ===== Order Details ===== */}
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Items Ordered */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Items Ordered
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex items-center justify-between py-2 border-b last:border-0 border-gray-100"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              ${item.price}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Info */}
                    {/* Shipping Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Shipping Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* Name */}
                        <div className="bg-gray-50 px-3 py-2 rounded-lg flex flex-col">
                          <span className="text-xs font-medium text-gray-500">
                            Name
                          </span>
                          <span className="text-sm text-gray-900">
                            {order.shippingInfo?.firstName}{" "}
                            {order.shippingInfo?.lastName}
                          </span>
                        </div>

                        {/* Email */}
                        <div className="bg-gray-50 px-3 py-2 rounded-lg flex flex-col">
                          <span className="text-xs font-medium text-gray-500">
                            Email
                          </span>
                          <span className="text-sm text-gray-900">
                            {order.shippingInfo?.email}
                          </span>
                        </div>

                        {/* Phone */}
                        <div className="bg-gray-50 px-3 py-2 rounded-lg flex flex-col">
                          <span className="text-xs font-medium text-gray-500">
                            Phone
                          </span>
                          <span className="text-sm text-gray-900">
                            {order.shippingInfo?.phone}
                          </span>
                        </div>

                        {/* Address */}
                        <div className="bg-gray-50 px-3 py-2 rounded-lg flex flex-col col-span-1 sm:col-span-2 lg:col-span-3">
                          <span className="text-xs font-medium text-gray-500">
                            Address
                          </span>
                          <span className="text-sm text-gray-900">
                            {order.shippingInfo?.address},{" "}
                            {order.shippingInfo?.city},{" "}
                            {order.shippingInfo?.state}{" "}
                            {order.shippingInfo?.zipCode}
                          </span>
                        </div>

                        {/* Country */}
                        <div className="bg-gray-50 px-3 py-2 rounded-lg flex flex-col">
                          <span className="text-xs font-medium text-gray-500">
                            Country
                          </span>
                          <span className="text-sm text-gray-900">
                            {order.shippingInfo?.country}
                          </span>
                        </div>

                        {/* Optional: Tracking Number */}
                        {order.trackingNumber && (
                          <div className="bg-gray-50 px-3 py-2 rounded-lg flex flex-col">
                            <span className="text-xs font-medium text-gray-500">
                              Tracking
                            </span>
                            <span className="text-sm text-gray-900">
                              {order.trackingNumber}
                            </span>
                          </div>
                        )}

                        {/* Optional: Estimated Delivery */}
                        {order.estimatedDelivery && (
                          <div className="bg-gray-50 px-3 py-2 rounded-lg flex flex-col">
                            <span className="text-xs font-medium text-gray-500">
                              Est. Delivery
                            </span>
                            <span className="text-sm text-gray-900">
                              {order.estimatedDelivery}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="hidden">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Shipping Information
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>{order.shippingAddress}</p>
                        {order.trackingNumber && (
                          <p className="font-medium">
                            Tracking: {order.trackingNumber}
                          </p>
                        )}
                        {order.estimatedDelivery && (
                          <p>Est. Delivery: {order.estimatedDelivery}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ===== Actions ===== */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex flex-wrap gap-3">
                      <Link href={`/orders/${order.id}`}>
                        <Button
                          icon={Eye}
                          variant="ghost"
                          className="border border-gray-300"
                        >
                          View Details
                        </Button>
                      </Link>

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

                      {(order.status === "paid"||  order.status === "fulfilled" ) && (
                        <Button
                          icon={Download}
                          variant="ghost-outline"
                          isLoading={isLoadingDownload} onClick={()=>handleDownload(order.id, order.orderNumber)}
                          // className="border border-gray-300"
                        >
                          Download Invoice
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex justify-center"
          >
            <div className="flex items-center space-x-2">
              <button
                disabled={filters.page <= 1}
                onClick={() => updateFilter("page", filters.page - 1)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {/* <span className="text-gray-900">
                              {filters.page} / {totalPages}
                            </span> */}
              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => updateFilter("page", pageNum)}
                    className={`px-3 py-2 border rounded-lg transition-colors ${
                      filters.page === pageNum
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-gray-300 text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}
              {/* <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">
                                1
                              </button>
                              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900">
                                2
                              </button>
                              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900">
                                3
                              </button> */}
              <button
                disabled={filters.page >= totalPages}
                onClick={() => updateFilter("page", filters.page + 1)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
