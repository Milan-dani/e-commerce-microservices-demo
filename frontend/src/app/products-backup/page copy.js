"use client";

import React from 'react';
import { useListProductsQuery } from '@/api/services/productsApi';
import ProductList from '@/components/ProductList';

export default function DemoProductsPage() {
  // fetch with default params (empty)
  const { data, isLoading, error } = useListProductsQuery();

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Demo Products</h1>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-600">Failed to load products</p>}

      {data && <ProductList products={data} />}
      {!data && !isLoading && !error && (
        <div>
          <p>No products from API. You can test by seeding your backend or mocking responses.</p>
        </div>
      )}
    </div>
  );
}
