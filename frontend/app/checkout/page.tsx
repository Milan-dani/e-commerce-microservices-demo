"use client";
import React, { useState } from 'react';
import { apiFetch } from '../apiClient';

const getUserId = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    if (user) return JSON.parse(user).id;
  }
  return null;
};

const CheckoutPage: React.FC = () => {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setError('');
    setStatus('');
    // Example: create order with cart items
    const userId = getUserId();
    if (!userId) return setError('User not logged in');
    try {
      await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({ userId, items: [] }) // Replace with actual cart items
      });
      setStatus('Order placed!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main style={{ padding: 32 }}>
      <h1>Checkout</h1>
      <button onClick={handleCheckout} style={{ padding: 12 }}>Place Order</button>
      {status && <p style={{ color: 'green', marginTop: 16 }}>{status}</p>}
      {error && <p style={{ color: 'red', marginTop: 16 }}>{error}</p>}
    </main>
  );
};

export default CheckoutPage;
