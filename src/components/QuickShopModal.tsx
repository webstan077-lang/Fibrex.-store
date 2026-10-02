import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  Truck,
  CheckCircle2,
  Minus,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Product } from '../types';
import { calculateDiscount } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';

interface QuickShopModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickShopModal: React.FC<QuickShopModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const { navigate } = useNavigation();
  const { formatPrice } = useAuth();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setActiveImageIdx(0);
      setQuantity(1);
      const initialVariants: Record<string, string> = {};
      product.variants?.forEach((v) => {
        if (v.options.length > 0) {
          initialVariants[v.name] = v.options[0];
        }
      });
      setSelectedVariants(initialVariants);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const wishlisted = isWishlisted(product.id);
  const discount = product.discount_percent || calculateDiscount(product.price, product.original_price);
  const images = product.images || [];

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariants);
    onClose();
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariants);
    onClose();
    navigate('/cart');
  };

  const handleViewFullDetails = () => {
    onClose();
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div
        className="relative bg-white w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col md:flex-row overflow-y-auto md:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 text-slate-700 hover:text-slate-900 hover:bg-white shadow-md flex items-center justify-center transition-colors focus:outline-none"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Gallery Column */}
        <div className="md:w-1/2 bg-slate-100 p-4 flex flex-col justify-between shrink-0">
          <div className="aspect-square relative rounded-xl overflow-hidden bg-white shadow-xs">
            {images.length > 0 ? (
              <img
                src={images[activeImageIdx] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <ShoppingBag className="w-16 h-16" />
              </div>
            )}

            {discount > 0 && (
              <span className="absolute top-2.5 left-2.5 bg-purple-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-sm">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide py-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIdx === idx
                      ? 'border-purple-600 ring-2 ring-purple-600/30'
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info Column */}
        <div className="p-5 md:p-6 md:w-1/2 flex flex-col justify-between overflow-y-auto">
          <div>
            {product.brand && (
              <p className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">
                {product.brand}
              </p>
            )}

            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(product.rating || 0)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 fill-slate-100'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {product.rating ? product.rating.toFixed(1) : '0.0'}
                {product.review_count ? ` (${product.review_count} reviews)` : ''}
              </span>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-2xl font-black text-slate-950 tabular-nums">
                {formatPrice(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-sm text-slate-400 line-through tabular-nums">
                    {formatPrice(product.original_price)}
                  </span>
                  <span className="bg-purple-50 text-purple-700 text-xs font-extrabold px-2 py-0.5 rounded-full">
                    Save {formatPrice(product.original_price - product.price)}
                  </span>
                </>
              )}
            </div>

            {/* Shipping & Stock */}
            <div className="space-y-1.5 mt-3 text-xs">
              {product.shipping_info && (
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-md">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{product.shipping_info}</span>
                </div>
              )}
              {product.stock != null && (
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>In Stock ({product.stock} units available)</span>
                </div>
              )}
            </div>

            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-4 space-y-3">
                {product.variants.map((v) => (
                  <div key={v.name}>
                    <p className="text-xs font-bold text-slate-700 mb-1.5">
                      {v.name}: <span className="font-normal text-purple-700">{selectedVariants[v.name]}</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {v.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setSelectedVariants((prev) => ({ ...prev, [v.name]: opt }))
                          }
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                            selectedVariants[v.name] === opt
                              ? 'border-purple-600 bg-purple-50 text-purple-700 ring-1 ring-purple-600'
                              : 'border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 font-bold text-sm text-slate-900 tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 space-y-2 pt-2 border-t border-slate-100">
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-slate-900 hover:bg-purple-600 text-white font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-xs cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors text-sm shadow-xs cursor-pointer"
              >
                Buy Now
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2.5 rounded-xl border transition-colors flex items-center justify-center ${
                  wishlisted
                    ? 'bg-purple-50 text-purple-600 border-purple-300'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
                title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleViewFullDetails}
              className="w-full text-center text-xs font-semibold text-purple-600 hover:text-purple-800 py-1.5 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View full product details & reviews</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
