"use client";

import React from 'react';
import ProductCard from './ProductCard-old';

export default function ProductList({ products = [] }) {
  if (!products || products.length === 0) return <div>No products found.</div>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((p) => (
        <ProductCard key={p.id || p._id} product={p} />
      ))}
    </div>
  );
}
