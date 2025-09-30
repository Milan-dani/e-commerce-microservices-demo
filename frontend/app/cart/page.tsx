"use client";
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../apiClient';

interface CartItem {
  productId: string;
  quantity: number;
  name?: string;
  price?: number;
}

const getUserId = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    if (user) return JSON.parse(user).id;
  }
  return null;
};

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;
    apiFetch(`/cart/${userId}`)
      .then(async data => {
        if (data.items) {
          const items = await Promise.all(
            data.items.map(async (item: CartItem) => {
              const prod = await apiFetch(`/products/${item.productId}`);
              return { ...item, name: prod.name, price: prod.price };
            })
          );
          setCart(items);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const removeItem = async (productId: string) => {
    setError('');
    const userId = getUserId();
    if (!userId) return;
    await apiFetch(`/cart/${userId}/remove`, {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
    setCart(cart.filter(item => item.productId !== productId));
  };

  return (
    <main style={{ padding: 32 }}>
      <h1>Your Cart</h1>
      {loading ? (
        <p>Loading cart...</p>
      ) : cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {cart.map(item => (
            <li key={item.productId} style={{ border: '1px solid #eee', marginBottom: 16, padding: 16, borderRadius: 8 }}>
              <h2>{item.name}</h2>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ${item.price}</p>
              <button onClick={() => removeItem(item.productId)} style={{ marginTop: 8 }}>Remove</button>
            </li>
          ))}
        </ul>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
};

export default CartPage;
