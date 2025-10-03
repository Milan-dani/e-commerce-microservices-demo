"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  ArrowRight,
  BarChart3,
  PieChart,
  Activity,
  MessageCircleMore,
  UserLock,
  Download,
} from "lucide-react";
import Button from "@/components/Button";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = {
    totalRevenue: 125430.5,
    totalOrders: 1247,
    totalCustomers: 892,
    totalProducts: 156,
    revenueGrowth: 12.5,
    ordersGrowth: 8.3,
    customersGrowth: 15.2,
    productsGrowth: 5.7,
  };

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "John Doe",
      email: "john@example.com",
      total: 199.99,
      status: "Delivered",
      date: "2024-01-15",
      items: 2,
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      email: "jane@example.com",
      total: 89.99,
      status: "Shipped",
      date: "2024-01-14",
      items: 1,
    },
    {
      id: "ORD-003",
      customer: "Bob Johnson",
      email: "bob@example.com",
      total: 149.99,
      status: "Processing",
      date: "2024-01-13",
      items: 3,
    },
    {
      id: "ORD-004",
      customer: "Alice Brown",
      email: "alice@example.com",
      total: 79.99,
      status: "Cancelled",
      date: "2024-01-12",
      items: 1,
    },
  ];

  const topProducts = [
    { name: "Wireless Headphones", sales: 156, revenue: 15544.44 },
    { name: "Smart Watch", sales: 98, revenue: 19598.02 },
    { name: "Laptop Stand", sales: 234, revenue: 11666.66 },
    { name: "Bluetooth Speaker", sales: 87, revenue: 6959.13 },
    { name: "Phone Case", sales: 312, revenue: 7796.88 },
  ];

  const customers = [
    {
      id: "CUST001",
      name: "John Doe",
      email: "johndoe@example.com",
      joinedDate: "2023-01-15",
      active: true,
    },
    {
      id: "CUST002",
      name: "Jane Smith",
      email: "janesmith@example.com",
      joinedDate: "2023-02-20",
      active: true,
    },
    {
      id: "CUST003",
      name: "Michael Johnson",
      email: "michaelj@example.com",
      joinedDate: "2023-03-05",
      active: false,
    },
    {
      id: "CUST004",
      name: "Emily Davis",
      email: "emilyd@example.com",
      joinedDate: "2023-04-10",
      active: true,
    },
    {
      id: "CUST005",
      name: "David Brown",
      email: "davidb@example.com",
      joinedDate: "2023-05-25",
      active: false,
    },
    {
      id: "CUST006",
      name: "Sophia Wilson",
      email: "sophiaw@example.com",
      joinedDate: "2023-06-08",
      active: true,
    },
    {
      id: "CUST007",
      name: "James Taylor",
      email: "jamest@example.com",
      joinedDate: "2023-07-12",
      active: true,
    },
    {
      id: "CUST008",
      name: "Olivia Martinez",
      email: "oliviam@example.com",
      joinedDate: "2023-08-30",
      active: false,
    },
  ];
  

  const tabs = [
    { id: "overview", name: "Overview", icon: BarChart3 },
    { id: "orders", name: "Orders", icon: ShoppingCart },
    { id: "products", name: "Products", icon: Package },
    { id: "customers", name: "Customers", icon: Users },
    { id: "analytics", name: "Analytics", icon: PieChart },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Shipped":
        return "bg-blue-100 text-blue-800";
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Manage your e-commerce store</p>
            </div>
            <div className="flex items-center gap-4">
              {/* <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Export Data
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New
              </motion.button> */}
              <Button icon={Download} variant="ghost" className="border border-gray-300">Export Data</Button>

              <Button icon={Plus}>Add New</Button>
            </div>
          </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* lg:grid-cols-4 ^ removed from above*/}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Total Revenue
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${stats.totalRevenue.toLocaleString()}
                        </p>
                        <p className="text-sm text-green-600 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />+
                          {stats.revenueGrowth}%
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Total Orders
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.totalOrders.toLocaleString()}
                        </p>
                        <p className="text-sm text-green-600 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />+
                          {stats.ordersGrowth}%
                        </p>
                      </div>
                      <ShoppingCart className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Total Customers
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.totalCustomers.toLocaleString()}
                        </p>
                        <p className="text-sm text-green-600 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />+
                          {stats.customersGrowth}%
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Total Products
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.totalProducts}
                        </p>
                        <p className="text-sm text-green-600 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />+
                          {stats.productsGrowth}%
                        </p>
                      </div>
                      <Package className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                </div>

                {/* Charts Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Revenue Overview
                    </h3>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">
                          Chart will be rendered here
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Order Status
                    </h3>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">
                          Chart will be rendered here
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Orders
                    </h3>
                    <Link href="/admin-orders">
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
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {order.customer}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {order.email}
                                </p>
                              </div>
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
                              {order.date}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-400 hover:text-blue-600">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-green-600">
                                  <Edit className="w-4 h-4" />
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

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-lg shadow-sm p-6">
                  {/* <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">All Orders</h2>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search orders..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 text-gray-900 placeholder-gray-400"
                        />
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        <Filter className="w-4 h-4" />
                        Filter
                      </button>
                    </div>
                  </div> */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      All Orders
                    </h2>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {/* Search Box */}
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search orders..."
                          className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 
                   text-gray-900 placeholder-gray-400"
                        />
                      </div>

                      {/* Filter Button */}
                      <button className="h-11 flex items-center justify-center gap-2 px-3 sm:px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline">Filter</span>
                      </button>
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
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {order.customer}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {order.email}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-600">
                              {order.items}
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
                              {order.date}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-400 hover:text-blue-600">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-green-600">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-red-600">
                                  <Trash2 className="w-4 h-4" />
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

            {/* Products Tab */}
            {activeTab === "products" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Top Products
                    </h2>
                    <Link href="/admin-products">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                      >
                        Manage Products
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <motion.div
                        key={product.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {product.sales} sales
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${product.revenue.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">Revenue</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Other tabs would be implemented similarly */}
            {/* {activeTab === "customers" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm p-12 text-center"
              >
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Customer Management
                </h3>
                <p className="text-gray-600">
                  Customer management features will be implemented here
                </p>
              </motion.div>
            )} */}
            {activeTab === "customers" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Customers
                  </h2>
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Search customers..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     text-gray-900 placeholder-gray-400"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Customer List */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {customers.map((customer, index) => (
                        <motion.tr
                          key={customer.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {customer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {customer.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {customer.joinedDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      customer.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                            >
                              {customer.active ? "Active" : "Blocked"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                            {/* <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                              View
                            </button>
                            <button className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200">
                              Message
                            </button>
                            <button className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                              {customer.active ? "Block" : "Unblock"}
                            </button> */}
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-400 hover:text-blue-600">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-green-600">
                                  <MessageCircleMore className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-red-600">
                                  <UserLock className="w-4 h-4" />
                                </button>
                              </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm p-12 text-center"
              >
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Analytics
                </h3>
                <p className="text-gray-600">
                  Advanced analytics and reporting features will be implemented
                  here
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
