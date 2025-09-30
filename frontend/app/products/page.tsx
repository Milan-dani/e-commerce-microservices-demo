"use client";
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../apiClient';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  category: string;
  }

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const params = [];
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (category) params.push(`category=${encodeURIComponent(category)}`);
    apiFetch(`/products${params.length ? '?' + params.join('&') : ''}`)
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, category]);

  return (
    <main style={{ padding: 32 }}>
      <h1>Products</h1>
      <div style={{ marginBottom: 24 }}>
        <input
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginRight: 16 }}
        />
        <input
          placeholder="Category..."
          value={category}
          onChange={e => setCategory(e.target.value)}
        />
      </div>
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {products.map(product => (
            <li key={product._id} style={{ border: '1px solid #eee', marginBottom: 16, padding: 16, borderRadius: 8 }}>
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <p>Price: ${product.price}</p>
              <p>Stock: {product.stock}</p>
              <p>Category: {product.category}</p>
              <a href={`/products/${product._id}`}>View Details</a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default ProductsPage;
