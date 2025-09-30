import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../apiClient';
import { useParams } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  category: string;
  }

const ProductDetailPage: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/products/${id}`)
      .then(data => {
        setProduct(data);
        setLoading(false);
        // Fetch recommendations
        apiFetch('/recommendations', {
          method: 'POST',
          body: JSON.stringify({ productId: id })
        })
          .then(rec => setRecommendations(rec.recommendations || []));
      });
  }, [id]);

  if (loading) return <main style={{ padding: 32 }}><p>Loading...</p></main>;
  if (!product) return <main style={{ padding: 32 }}><p>Product not found.</p></main>;

  return (
    <main style={{ padding: 32 }}>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <p>Stock: {product.stock}</p>
      <p>Category: {product.category}</p>
      <h2>Related Products</h2>
      <ul>
        {recommendations.map(rec => (
          <li key={rec.productId}>{rec.name}</li>
        ))}
      </ul>
      {/* Add to cart button and more features can be added here */}
    </main>
  );
};

export default ProductDetailPage;
