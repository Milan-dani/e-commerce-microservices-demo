"use client";
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../apiClient';

// Remove static USER_ID, get from user context (example below)
const getUserId = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    if (user) return JSON.parse(user).id;
  }
  return null;
};

interface Order {
  id: string;
  status: string;
  OrderItems: { productId: string; quantity: number }[];
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;
    apiFetch(`/orders/${userId}`)
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main style={{ padding: 32 }}>
      <h1>Order History</h1>
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {orders.map(order => (
            <li key={order.id} style={{ border: '1px solid #eee', marginBottom: 16, padding: 16, borderRadius: 8 }}>
              <h2>Order #{order.id}</h2>
              <p>Status: {order.status}</p>
              <ul>
                {order.OrderItems.map((item, idx) => (
                  <li key={idx}>Product: {item.productId}, Quantity: {item.quantity}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default OrdersPage;
