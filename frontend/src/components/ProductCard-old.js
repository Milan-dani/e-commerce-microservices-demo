"use client";

import Image from 'next/image';
import React from 'react';

export default function ProductCard({ product }) {
  if (!product) return null;
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="h-40 bg-gray-100 rounded mb-4 flex items-center justify-center"> 
        <Image src={product.image || '/api/placeholder/300/300'} alt={product.name} className="max-h-full max-w-full" fill/>
      </div>
      <div>
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.category}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-blue-600 font-bold">${product.price}</span>
          {!product.inStock && <span className="text-sm text-red-600">Out</span>}
        </div>
      </div>
    </div>
  );
}
