import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';

export const WishlistModal: React.FC = () => {
  const { wishlist, isWishlistOpen, setIsWishlistOpen, toggleWishlist, addToCart } = useCart();
  const { formatPrice } = useAuth();
  const { navigate } = useNavigation();

  if (!isWishlistOpen) return null;

  const wishlistedProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  const handleAddAllToCart = () => {
    wishlistedProducts.forEach((p) => addToCart(p, 1));
    setIsWishlistOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-600 fill-purple-600" />
            <h2 className="font-bold text-slate-900 text-lg">My Wishlist</h2>
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {wishlistedProducts.length} saved
            </span>
          </div>
          <button
            onClick={() => setIsWishlistOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {wishlistedProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-purple-400 mx-auto mb-3">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Your wishlist is empty</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-6">
                Tap the heart icon on any product to save it to your wishlist for later.
              </p>
              <button
                onClick={() => {
                  setIsWishlistOpen(false);
                  navigate('/');
                }}
                className="bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-full hover:bg-purple-600 transition-colors shadow-xs"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {wishlistedProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div
                    onClick={() => {
                      setIsWishlistOpen(false);
                      navigate(`/product/${p.id}`);
                    }}
                    className="flex items-center gap-3 min-w-0 cursor-pointer"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-14 h-14 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 truncate hover:text-purple-600">
                        {p.name}
                      </h4>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => addToCart(p, 1)}
                      className="bg-slate-900 hover:bg-purple-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Add to Cart</span>
                    </button>
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {wishlistedProducts.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Continue Browsing
            </button>
            <button
              onClick={handleAddAllToCart}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>Add All to Cart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
