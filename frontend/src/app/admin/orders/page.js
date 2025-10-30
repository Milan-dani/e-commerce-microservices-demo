"use client";

import { useListOrdersAdminQuery, useUpdateOrderStatusMutation } from "@/api/services/orderApi";

// import { useListOrdersQuery, useUpdateOrderStatusMutation } from "@/redux/services/orderApi";

export default function AdminOrders() {
  
  const { data: orders } = useListOrdersAdminQuery({ page: 1, limit: 20 });
  const [updateStatus] = useUpdateOrderStatusMutation();

  const handleStatusChange = (orderId, status) => {
    updateStatus({ orderId, status });
  };


  // ✅ Add a loading and error-safe fallback
  if (!orders) {
    return <div>Loading orders...</div>;
  }

  const orderList = orders?.orders ?? [];

  return (
    <div>
      <h2>Admin Orders</h2>
      {orders.orders?.map(order => (
        <div key={order.id} className="p-2 border mb-2">
          <p>ID: {order.id} | Status: {order.status}</p>
          <select onChange={e => handleStatusChange(order.id, e.target.value)} defaultValue={order.status}>
            {["pending", "paid", "processing", "shipped", "delivered", "fulfilled", "cancelled"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
