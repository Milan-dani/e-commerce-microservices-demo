"use client";
import { useListOrdersQuery } from "@/redux/services/orderApi";
import Link from "next/link";

export default function OrdersPage() {
  const { data: orders } = useListOrdersQuery({ page: 1, limit: 10 });

  if (!orders?.length) return <p>No orders found.</p>;

  return (
    <div>
      <h2>My Orders</h2>
      {orders.map(order => (
        <div key={order.id} className="p-2 border mb-2">
          <p>Order ID: {order.id}</p>
          <p>Status: {order.status}</p>
          {order.status === "pending" ? <Link href={`/checkout/${order.id}`}>Continue Checkout</Link> : <Link href={`/orders/${order.id}`}>View Details</Link>}
        </div>
      ))}
    </div>
  );
}
