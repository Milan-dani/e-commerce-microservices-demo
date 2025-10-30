import React from "react";
import { motion } from "framer-motion";
import { Edit, Eye, Search, ShoppingBag, Trash2 } from "lucide-react";
import { getStatusColor } from "@/utils/statusHelpers";
import Link from "next/link";
import Button from "@/components/Button";
import { renderItemsSummary } from "@/utils/utilityFunctions";
import { useUpdateOrderStatusMutation } from "@/api/services/orderApi";
import toast from "react-hot-toast";

function OrderHistoryTable({
  totalOrders,
  totalPages,
  orders,
  filters,
  updateFilter,
}) {
  const [updateStatus] = useUpdateOrderStatusMutation();
  const changeOrderStatus = (orderId, newStatus) => {
    try {
      updateStatus({ orderId, status: newStatus });
      toast.success("Order status updated");
    } catch (err) {
      console.error("Failed to update order status:", err);
      toast.error("Failed to update order status");
    }
  };
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-900">All Orders</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {totalOrders} {totalOrders === 1 ? "order" : "orders"} found
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          {/* <h2 className="text-xl font-semibold text-gray-900">All Orders</h2> */}

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Filter by status:
              </span>
              <select
                value={filters.status}
                onChange={(e) => updateFilter("status", e.target.value)}
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
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder="Search orders..."
                className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 
                   text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Order ID
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Customer
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Items
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Total
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Date
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4 font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.shippingInfo?.firstName}{" "}
                        {order.shippingInfo?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.shippingInfo?.email}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    <div>
                      <p className="truncate">
                        {renderItemsSummary(order.items, 1)}
                      </p>
                    </div>
                    {/* {order.items.length} */}
                  </td>
                  <td className="py-4 px-4 font-semibold text-gray-900">
                    ${order.total}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {order.createdAt.split("T")[0]}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/orders/${order.id}`}>
                        <button className="p-2 text-gray-400 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      {/* <button className="p-2 text-gray-400 hover:text-green-600">
                        <Edit className="w-4 h-4" />
                      </button> */}

                      {/* {order.status !== "fulfilled" && (
                        <span
                          onClick={() =>
                            changeOrderStatus(order.id, "fulfilled")
                          }
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            "fulfilled"
                          )}`}
                        >
                          Mark
                          Fulfilled
                        </span>
                      )} */}

                      {order.status !== "fulfilled" ? (
                        <select
                          // value={order.status}
                          defaultValue={order.status}
                          onChange={(e) =>
                            changeOrderStatus(order.id, e.target.value)
                          }
                          className="px-2 py-1 rounded-full text-xs font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                          <option
                            className={`${getStatusColor("pending")}`}
                            value="pending"
                          >
                            Pending
                          </option>
                          <option
                            className={`${getStatusColor("paid")}`}
                            value="paid"
                          >
                            Paid
                          </option>
                          <option
                            className={`${getStatusColor("processing")}`}
                            value="processing"
                          >
                            Processing
                          </option>
                          <option
                            className={`${getStatusColor("shipped")}`}
                            value="shipped"
                          >
                            Shipped
                          </option>
                          <option
                            className={`${getStatusColor("delivered")}`}
                            value="delivered"
                          >
                            Delivered
                          </option>
                          <option
                            className={`${getStatusColor("cancelled")}`}
                            value="cancelled"
                          >
                            Cancelled
                          </option>

                          <option
                            className={`${getStatusColor("fulfilled")}`}
                            value="fulfilled"
                            disabled={order.status !== "delivered"}
                          >
                            Fulfilled
                          </option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            "fulfilled"
                          )}`}
                        >
                          Fulfilled
                        </span>
                      )}

                      {/* <button className="p-2 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button> */}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
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
    </>
  );
}

export default OrderHistoryTable;
