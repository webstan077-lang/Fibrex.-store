import React, { useState } from 'react';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../types';
import { formatCount, calculateDiscount } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
}) => {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const { navigate } = useNavigation();
  const { formatPrice } = useAuth();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const wishlisted = isWishlisted(product.id);
  const discount = product.discount_percent || calculateDiscount(product.price, product.original_price);
  const hasMultipleImages = product.images && product.images.length > 1;

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 flex flex-col justify-between"
      onMouseEnter={() => hasMultipleImages && setActiveImageIndex(1)}
      onMouseLeave={() => setActiveImageIndex(0)}
    >
      {/* Product Image Stage */}
      <div
        onClick={handleCardClick}
        className="block relative aspect-[4/5] bg-slate-100 overflow-hidden cursor-pointer"
      >
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[activeImageIndex] || product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ShoppingBag className="w-10 h-10" />
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] md:text-[11px] font-black px-2 py-0.5 rounded-full shadow-sm">
            {discount}% OFF
          </span>
        )}

        {/* Badge like Best Seller / Flash Deal */}
        {product.badge && (
          <span className="absolute top-2 right-11 bg-slate-900 text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
            {product.badge}
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-md transition-all focus:outline-none ${
            wishlisted
              ? 'bg-purple-600 text-white'
              : 'bg-white/90 text-slate-700 hover:bg-white hover:text-purple-600'
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button on Card Hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute left-2.5 right-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/95 hover:bg-white text-slate-900 text-xs font-bold py-2 px-3 rounded-lg shadow-lg flex items-center justify-center gap-1.5 backdrop-blur-sm hover:text-purple-600 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Quick View</span>
        </button>
      </div>

      {/* Content Details */}
      <div className="p-2.5 md:p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3
            onClick={handleCardClick}
            className="text-[13px] md:text-sm font-semibold text-slate-800 leading-snug line-clamp-2 min-h-[2.4rem] hover:text-purple-600 transition-colors cursor-pointer"
          >
            {product.name}
          </h3>

          {/* Pricing */}
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-base md:text-lg font-black tabular-nums text-slate-950">
              {formatPrice(product.price)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs text-slate-400 line-through tabular-nums">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= Math.round(product.rating || 0)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-200 fill-slate-100'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-slate-500 font-medium ml-0.5">
              {product.rating ? product.rating.toFixed(1) : '0.0'}
              {product.review_count ? ` (${formatCount(product.review_count)})` : ''}
            </span>
          </div>

          {/* Sold Count & Shipping Tag */}
          <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-500 gap-1">
            <span>
              {product.sold_count ? `${formatCount(product.sold_count)} sold` : 'New arrival'}
            </span>
            {product.shipping_info && (
              <span className="text-[10px] text-emerald-600 font-semibold truncate bg-emerald-50 px-1.5 py-0.5 rounded">
                {product.shipping_info.includes('Free') ? 'Free shipping' : 'Fast delivery'}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product, 1);
          }}
          className="mt-3 w-full bg-slate-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Add to cart</span>
        </button>
      </div>
    </div>
  );
};
