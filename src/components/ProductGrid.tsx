import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onQuickView: (product: Product) => void;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onQuickView,
  className = '',
}) => {
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 md:gap-3.5 ${className}`}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
};
