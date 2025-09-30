"use client";
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../apiClient';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  category: string;
  }

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Partial<Product>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/products')
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await apiFetch(`/products/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(form)
      });
    } else {
      await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify(form)
      });
    }
    setForm({});
    setEditingId(null);
    setLoading(true);
    apiFetch('/products')
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  };

  const handleEdit = (product: Product) => {
    setForm(product);
    setEditingId(product._id);
  };

  const handleDelete = async (id: string) => {
    await apiFetch(`/products/${id}`, { method: 'DELETE' });
    setLoading(true);
    apiFetch('/products')
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  };

  return (
    <main style={{ padding: 32 }}>
      <h1>Admin Product Management</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
        <input name="name" placeholder="Name" value={form.name || ''} onChange={handleChange} required />
        <input name="price" type="number" placeholder="Price" value={form.price || ''} onChange={handleChange} required />
        <input name="description" placeholder="Description" value={form.description || ''} onChange={handleChange} required />
        <input name="stock" type="number" placeholder="Stock" value={form.stock || ''} onChange={handleChange} required />
        <input name="category" placeholder="Category" value={form.category || ''} onChange={handleChange} required />
        <button type="submit">{editingId ? 'Update' : 'Add'} Product</button>
        {editingId && <button type="button" onClick={() => { setForm({}); setEditingId(null); }}>Cancel</button>}
      </form>
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
              <button onClick={() => handleEdit(product)} style={{ marginRight: 8 }}>Edit</button>
              <button onClick={() => handleDelete(product._id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default AdminProductsPage;
