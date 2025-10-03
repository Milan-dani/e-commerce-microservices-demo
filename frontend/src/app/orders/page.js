'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Package, 
  Eye, 
  Download, 
  RefreshCw, 
  ArrowLeft,
  Truck,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import Button from '@/components/Button';

export default function Orders() {
  const [filterStatus, setFilterStatus] = useState('all');

  const orders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'Delivered',
      total: 199.99,
      items: [
        { name: 'Wireless Headphones', quantity: 1, price: 99.99 },
        { name: 'Phone Case', quantity: 2, price: 49.99 }
      ],
      shippingAddress: '123 Main St, New York, NY 10001',
      trackingNumber: 'TRK123456789',
      estimatedDelivery: '2024-01-20'
    },
    {
      id: 'ORD-002',
      date: '2024-01-10',
      status: 'Shipped',
      total: 89.99,
      items: [
        { name: 'Laptop Stand', quantity: 1, price: 89.99 }
      ],
      shippingAddress: '123 Main St, New York, NY 10001',
      trackingNumber: 'TRK987654321',
      estimatedDelivery: '2024-01-18'
    },
    {
      id: 'ORD-003',
      date: '2024-01-05',
      status: 'Processing',
      total: 149.99,
      items: [
        { name: 'Smart Watch', quantity: 1, price: 149.99 }
      ],
      shippingAddress: '123 Main St, New York, NY 10001',
      trackingNumber: null,
      estimatedDelivery: '2024-01-25'
    },
    {
      id: 'ORD-004',
      date: '2023-12-28',
      status: 'Cancelled',
      total: 79.99,
      items: [
        { name: 'Bluetooth Speaker', quantity: 1, price: 79.99 }
      ],
      shippingAddress: '123 Main St, New York, NY 10001',
      trackingNumber: null,
      estimatedDelivery: null
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Shipped':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'Processing':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === filterStatus.toLowerCase());

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
              <span className="text-sm font-medium text-gray-700">Filter by status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
              >
                <option value="all">All Orders</option>
                <option value="delivered">Delivered</option>
                <option value="shipped">Shipped</option>
                <option value="processing">Processing</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
              </span>
            </div>
          </div>
        </motion.div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-lg shadow-sm p-12 text-center"
            >
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-6">
                {filterStatus === 'all' 
                  ? "You haven't placed any orders yet." 
                  : `No orders with status "${filterStatus}" found.`
                }
              </p>
              <Link href="/products">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Shopping
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            filteredOrders.map((order, index) => (
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
                          Order #{order.id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Ordered on {order.date}
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
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}
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
                    <div>
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
                      <Button
                        icon={Eye}
                        variant="ghost"
                        className="border border-gray-300"
                      >
                        View Details
                      </Button>
            
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
            
                      <Button
                        icon={Download}
                        variant="ghost"
                        className="border border-gray-300"
                      >
                        Download Invoice
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
            
            // filteredOrders.map((order, index) => (
            //   <motion.div
            //     key={order.id}
            //     initial={{ opacity: 0, y: 20 }}
            //     animate={{ opacity: 1, y: 0 }}
            //     transition={{ duration: 0.5, delay: index * 0.1 }}
            //     className="bg-white rounded-lg shadow-sm overflow-hidden"
            //   >
            //     {/* Order Header */}
            //     <div className="p-6 border-b border-gray-200">
            //       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            //         <div className="flex items-center gap-4">
            //           <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            //             {getStatusIcon(order.status)}
            //           </div>
            //           <div>
            //             <h3 className="text-lg font-semibold text-gray-900">{order.id}</h3>
            //             <p className="text-sm text-gray-600">Ordered on {order.date}</p>
            //           </div>
            //         </div>
                    
            //         <div className="flex items-center gap-4">
            //           <div className="text-right">
            //             <p className="text-lg font-semibold text-gray-900">${order.total}</p>
            //             <p className="text-sm text-gray-600">{order.items.length} items</p>
            //           </div>
            //           <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            //             {order.status}
            //           </span>
            //         </div>
            //       </div>
            //     </div>

            //     {/* Order Details */}
            //     <div className="p-6">
            //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            //         {/* Items */}
            //         <div>
            //           <h4 className="font-medium text-gray-900 mb-3">Items Ordered</h4>
            //           <div className="space-y-2">
            //             {order.items.map((item, itemIndex) => (
            //               <div key={itemIndex} className="flex items-center justify-between py-2">
            //                 <div>
            //                   <p className="text-sm font-medium text-gray-900">{item.name}</p>
            //                   <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
            //                 </div>
            //                 <p className="text-sm font-semibold text-gray-900">${item.price}</p>
            //               </div>
            //             ))}
            //           </div>
            //         </div>

            //         {/* Shipping Info */}
            //         <div>
            //           <h4 className="font-medium text-gray-900 mb-3">Shipping Information</h4>
            //           <div className="space-y-2 text-sm text-gray-600">
            //             <p>{order.shippingAddress}</p>
            //             {order.trackingNumber && (
            //               <p>Tracking: {order.trackingNumber}</p>
            //             )}
            //             {order.estimatedDelivery && (
            //               <p>Est. Delivery: {order.estimatedDelivery}</p>
            //             )}
            //           </div>
            //         </div>
            //       </div>

            //       {/* Actions */}
            //       <div className="mt-6 pt-6 border-t border-gray-200">
            //         <div className="flex flex-col sm:flex-row gap-3">
            //           {/* <motion.button
            //             whileHover={{ scale: 1.02 }}
            //             whileTap={{ scale: 0.98 }}
            //             className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            //           >
            //             <Eye className="w-4 h-4" />
            //             View Details
            //           </motion.button> */}
            //           <Button icon={Eye} variant='ghost' className='border border-gray-300'>View Details</Button>
                      
            //           {order.status === 'Delivered' && (
            //             // <motion.button
            //             //   whileHover={{ scale: 1.02 }}
            //             //   whileTap={{ scale: 0.98 }}
            //             //   className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            //             // >
            //             //   <RefreshCw className="w-4 h-4" />
            //             //   Reorder
            //             // </motion.button>
            //             <Button icon={RefreshCw} variant='ghost' className='border border-gray-300'>Reorder</Button>
            //           )}
                      
            //           {order.trackingNumber && (
            //             // <motion.button
            //             //   whileHover={{ scale: 1.02 }}
            //             //   whileTap={{ scale: 0.98 }}
            //             //   className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            //             // >
            //             //   <Truck className="w-4 h-4" />
            //             //   Track Package
            //             // </motion.button>
            //             <Button icon={Truck} variant='ghost' className='border border-gray-300'>Track Package</Button>
            //           )}
                      
            //           {/* <motion.button
            //             whileHover={{ scale: 1.02 }}
            //             whileTap={{ scale: 0.98 }}
            //             className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            //           >
            //             <Download className="w-4 h-4" />
            //             Download Invoice
            //           </motion.button> */}
            //           <Button icon={Download} variant='ghost' className='border border-gray-300'>Download Invoice</Button>
            //         </div>
            //       </div>
            //     </div>
            //   </motion.div>
            // ))
            // 
           
          )}
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex justify-center"
          >
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-400">
                Previous
              </button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-gray-900">1</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900">2</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-90 transition-colors text-gray-900">3</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900">
                Next
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
