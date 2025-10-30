"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  User,
  Package,
  CreditCard,
  Settings,
  Heart,
  MapPin,
  Bell,
  ShoppingBag,
  Star,
  ArrowRight,
  Edit,
  Eye,
  Trash2,
  ShoppingCart,
  Phone,
  CheckCircle,
} from "lucide-react";
import Button from "@/components/Button";
import OrderHistoryTable from "@/components/dashboardComponents/user/OrderHistoryTable";
import { useListOrdersQuery } from "@/api/services/orderApi";
import { getStatusColor } from "@/utils/statusHelpers";
import Cookies from "js-cookie";

export default function Dashboard() {
  // Orders Fetching
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "all",
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const {
    data,
    isLoading: or,
    isError,
  } = useListOrdersQuery({
    page: filters.page,
    limit: filters.limit,
    status: filters.status,
  });
  useEffect(() => {
    if (data) {
      setOrders(data.orders);
      setTotalPages(data.totalPages);
      setTotalOrders(data.total);
      // const total
      setTotalSpent(data.orders.reduce((sum, order) => sum + order.total, 0));
    }
  }, [data]);
  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1, // reset page on any filter change except page
    }));
  };

  const [activeTab, setActiveTab] = useState("overview");

  const defaultUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    memberSince: "January 2024",
    totalOrders: 12,
    totalSpent: 1250.5,
  };


  const userFromCookies = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
  const user = userFromCookies || { ...defaultUser };
  console.log(user);
  

  const recentOrders = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      status: "Delivered",
      total: 199.99,
      items: 2,
    },
    {
      id: "ORD-002",
      date: "2024-01-10",
      status: "Shipped",
      total: 89.99,
      items: 1,
    },
    {
      id: "ORD-003",
      date: "2024-01-05",
      status: "Processing",
      total: 149.99,
      items: 3,
    },
  ];

  const wishlistItems = [
    {
      id: 1,
      name: "Wireless Headphones",
      price: 99.99,
      image: "/api/placeholder/80/80",
      addedDate: "2024-01-12",
      quantity: 2,
      inStock: true,
    },
    {
      id: 2,
      name: "Smart Watch",
      price: 199.99,
      image: "/api/placeholder/80/80",
      addedDate: "2024-01-10",
      quantity: 1,
      inStock: false,
    },
  ];

  const addresses = [
    {
      id: 1,
      name: "John Doe",
      address: "123 Main Street",
      city: "New York, NY 10001",
      phone: "+1 (555) 123-4567",
      isDefault: true,
    },
    {
      id: 2,
      name: "Jane Smith",
      address: "456 Oak Avenue",
      city: "Los Angeles, CA 90001",
      phone: "+1 (555) 987-6543",
      isDefault: false,
    },
  ];

  const tabs = [
    { id: "overview", name: "Overview", icon: User },
    { id: "orders", name: "Orders", icon: Package },
    { id: "wishlist", name: "Wishlist", icon: Heart },
    { id: "addresses", name: "Addresses", icon: MapPin },
    { id: "settings", name: "Settings", icon: Settings },
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          {/* <p className="text-gray-600 mt-2">Welcome back, {user.name}!</p> */}
          <p className="text-gray-600 mt-2">Welcome back, {user.firstName}!</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {/* {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")} */}
                      {/* {user.firstName[0].toUpperCase()}{user.lastName[0].toUpperCase()} */}
                      {`${user?.firstName?.[0]?.toUpperCase() ?? ""}${user?.lastName?.[0]?.toUpperCase() ?? ""}`}

                  </span>
                </div>
                <div>
                  {/* <h3 className="font-semibold text-gray-900">{user.name}</h3> */}
                  <h3 className="font-semibold text-gray-900">{user.firstName}{" "}{user.lastName}</h3>
                  {/* <p className="text-sm text-gray-600">{user.email}</p> */}
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.name}
                    </motion.button>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Total Orders
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {/* {user.totalOrders} */}
                          {totalOrders}
                        </p>
                      </div>
                      <Package className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Total Spent
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {/* ${user.totalSpent} */}${totalSpent}
                        </p>
                      </div>
                      <CreditCard className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Member Since
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {user.memberSince}
                        </p>
                      </div>
                      <User className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                {/* <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                    <Link href="/orders">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                      >
                        View All
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {recentOrders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{order.id}</h3>
                            <p className="text-sm text-gray-600">{order.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${order.total}</p>
                          <p className="text-sm text-gray-600">{order.items} items</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'Delivered' 
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'Shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                          <button className="p-2 text-gray-400 hover:text-gray-600">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div> */}
                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Recent Orders
                    </h2>
                    <Link href="/orders">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-2 justify-center sm:justify-end"
                      >
                        View All
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </Link>
                  </div>

                  {/* Orders List */}
                  <div className="space-y-4">
                    {orders?.slice(0, 3)?.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {/* Mobile (stacked) */}
                        <div className="flex flex-col gap-4 sm:hidden">
                          {/* Top: Order ID + Date */}
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <ShoppingBag className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {order.orderNumber}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {order?.createdAt?.split("T")?.[0] ?? "Unknown date"}
                              </p>
                            </div>
                          </div>

                          {/* Middle: Total + Items */}
                          <div>
                            <p className="font-semibold text-gray-900">
                              ${order.total}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.items.length} items
                            </p>
                          </div>

                          {/* Bottom: Status + View */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                             {order.status}
                            </span>
                            {/* <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === "Delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "Shipped"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.status}
                            </span> */}
                            <Link href={`/orders/${order.id}`}>
                              <button className="p-2 text-gray-400 hover:text-gray-600">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                          </div>
                        </div>

                        {/* Desktop (row layout) */}
                        <div className="hidden sm:flex items-center justify-between">
                          {/* Left: ID + Date */}
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <ShoppingBag className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {order.orderNumber}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {order?.createdAt?.split("T")?.[0] ?? "Unknown date"}
                              </p>
                            </div>
                          </div>

                          {/* Middle: Total */}
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ${order.total}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.items.length} items
                            </p>
                          </div>

                          {/* Right: Status + Action */}
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                            >
                              {order.status}
                            </span>
                            <Link href={`/orders/${order.id}`}>
                              <button className="p-2 text-gray-400 hover:text-gray-600">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Order History
                  </h2>
                  <OrderHistoryTable
                    {...{ totalOrders, totalPages, orders, filters, updateFilter }}
                  />
                  <div className="overflow-x-auto hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Order ID
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Date
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Total
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order, index) => (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-4 px-4 font-medium text-gray-900">
                              {order.id}
                            </td>
                            <td className="py-4 px-4 text-gray-600">
                              {order.date}
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  order.status === "Delivered"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "Shipped"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-semibold text-gray-900">
                              ${order.total}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-400 hover:text-blue-600">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-green-600">
                                  <ShoppingBag className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Wishlist Tab */}
            {/* {activeTab === "wishlist" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Wishlist
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {wishlistItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {item.name}
                          </h3>
                          <p className="text-lg font-semibold text-blue-600">
                            ${item.price}
                          </p>
                          <p className="text-sm text-gray-600">
                            Added {item.addedDate}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Heart className="w-5 h-5 fill-current" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Add to Cart
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )} */}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      Wishlist
                    </h2>

                    <div className="grid grid-cols-1 gap-6">
                      {wishlistItems.map((item, index) => (
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
                          <div className="flex justify-center sm:justify-start  gap-4">
                            <Button
                              icon={ShoppingCart}
                              disabled={!item.inStock}
                              className="disabled:opacity-50 disabled:cursor-not-allowed sm:w-full"
                            >
                              Add to Cart
                            </Button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              // onClick={() => setWishlisted(!wishlisted)}
                              className={`w-10 h-10 flex items-center justify-center rounded-full border ${
                                wishlisted || true
                                  ? "bg-red-100 text-red-500 border-red-300"
                                  : "bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200"
                              }`}
                            >
                              <Heart
                                className={`w-5 h-5 ${
                                  wishlisted || true ? "fill-current" : ""
                                }`}
                              />
                            </motion.button>
                          </div>

                          {/* Remove Button */}
                          {/* <motion.button
                         whileHover={{ scale: 1.1 }}
                         whileTap={{ scale: 0.9 }}
                         onClick={() => removeItem(item.id)}
                         className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mx-auto sm:mx-0"
                       >
                         <Trash2 className="w-5 h-5" />
                       </motion.button> */}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Saved Addresses
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add New Address
                    </motion.button>
                  </div>

                  {!addresses?.length && (
                    <div className="text-center py-12">
                      <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No saved addresses
                      </h3>
                      <p className="text-gray-600">
                        Add an address to make checkout faster
                      </p>
                    </div>
                  )}

                  {addresses?.length && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.map((addr, index) => (
                        <motion.div
                          key={addr.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className={`relative border rounded-lg p-4 shadow-sm ${
                            addr.isDefault
                              ? "border-blue-500 ring-2 ring-blue-200"
                              : "border-gray-200"
                          }`}
                        >
                          {/* Default Badge */}
                          {addr.isDefault && (
                            <span className="absolute top-2 right-2 flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                              <CheckCircle className="w-4 h-4" />
                              Default
                            </span>
                          )}

                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {addr.name}
                              </h3>
                              <p className="text-gray-700">{addr.address}</p>
                              <p className="text-gray-700">{addr.city}</p>
                              <p className="text-gray-600 flex items-center gap-2 mt-1">
                                <Phone className="w-4 h-4 text-gray-500" />
                                {addr.phone}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-end gap-2 mt-4">
                            {/* <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </motion.button> */}
                            <Button icon={Edit} variant="secondary">
                              Edit
                            </Button>
                            {/* <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </motion.button> */}
                            <Button icon={Trash2} variant="danger" className="">
                              Delete
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Account Settings
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={`${user.firstName} ${user.lastName}`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue={user.email}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter your phone number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Email Notifications
                        </h3>
                        <p className="text-sm text-gray-600">
                          Receive updates about your orders and promotions
                        </p>
                      </div>
                      {/* Switch */}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          // checked={enabled}
                          // onChange={() => setEnabled(!enabled)}
                        />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
                        <span className="absolute left-0.5 top-0.5 h-4 w-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                      </label>
                      {/* <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                      </button> */}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          SMS Notifications
                        </h3>
                        <p className="text-sm text-gray-600">
                          Receive text messages about order updates
                        </p>
                      </div>
                      {/* <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                      </button> */}
                      {/* Switch */}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          // checked={enabled}
                          // onChange={() => setEnabled(!enabled)}
                        />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
                        <span className="absolute left-0.5 top-0.5 h-4 w-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                      </label>
                    </div>

                    <div className="pt-4">
                      {/* <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Save Changes
                      </motion.button> */}
                      <Button variant="primary" className="px-6 py-3">
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
