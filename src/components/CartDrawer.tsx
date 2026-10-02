import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Truck,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQty,
    removeFromCart,
    cartTotal,
    discountCode,
    discountAmount,
    finalTotal,
    applyPromoCode,
    removePromoCode,
    setIsCheckoutOpen,
  } = useCart();

  const { navigate } = useNavigation();
  const { formatPrice } = useAuth();
  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 25000;
  const isFreeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
  const freeShippingProgress = Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100);
  const shippingCost = isFreeShipping || cartTotal === 0 ? 0 : 2000;
  const totalWithShipping = finalTotal + shippingCost;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const result = applyPromoCode(promoInput);
    setPromoFeedback(result);
    if (result.success) {
      setPromoInput('');
    }
  };

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-left">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-purple-600" />
            <h2 className="font-bold text-slate-900 text-lg">Your Cart</h2>
            <span className="bg-purple-100 text-purple-700 text-xs font-extrabold px-2 py-0.5 rounded-full">
              {cart.reduce((acc, i) => acc + i.qty, 0)} items
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="bg-purple-50/70 p-3.5 border-b border-purple-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-900 mb-1.5">
            <Truck className="w-4 h-4 text-purple-600 shrink-0" />
            {isFreeShipping ? (
              <span className="text-emerald-700 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> You unlocked FREE Nationwide Shipping!
              </span>
            ) : (
              <span>
                Add <span className="font-extrabold text-purple-700">{formatPrice(amountToFreeShipping)}</span> more to get{' '}
                <span className="font-bold">FREE Shipping</span>
              </span>
            )}
          </div>
          <div className="h-1.5 bg-purple-200/60 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isFreeShipping ? 'bg-emerald-500' : 'bg-purple-600'
              }`}
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Your shopping cart is empty</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1 mb-6">
                Discover thousands of products and flash deals on Fibrex Store today!
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/');
                }}
                className="bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-full hover:bg-purple-600 transition-colors shadow-xs"
              >
                Start Shopping Now
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.key}
                className="flex gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate(`/product/${item.id}`);
                  }}
                  className="w-16 h-16 rounded-lg bg-white overflow-hidden shrink-0 border border-slate-200 cursor-pointer"
                >
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate(`/product/${item.id}`);
                      }}
                      className="text-xs font-semibold text-slate-800 line-clamp-1 hover:text-purple-600 cursor-pointer"
                    >
                      {item.name}
                    </h4>

                    {item.variant && Object.keys(item.variant).length > 0 && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {Object.entries(item.variant)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ')}
                      </p>
                    )}

                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xs font-bold text-slate-900">
                        {formatPrice(item.price)}
                      </span>
                      {item.original_price && item.original_price > item.price && (
                        <span className="text-[10px] text-slate-400 line-through">
                          {formatPrice(item.original_price)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/60">
                    <div className="flex items-center border border-slate-200 rounded-md bg-white">
                      <button
                        onClick={() => updateQty(item.key, item.qty - 1)}
                        className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-slate-900 tabular-nums">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.key, item.qty + 1)}
                        className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.key)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-white space-y-3">
            {/* Promo Code Input */}
            <div>
              {discountCode ? (
                <div className="flex items-center justify-between bg-purple-50 text-purple-700 px-3 py-2 rounded-lg text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-purple-600" />
                    <span>Promo code: <strong>{discountCode}</strong> applied</span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-red-500 hover:text-red-700 text-xs font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-1.5">
                  <div className="relative flex-1">
                    <input
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Enter promo code (e.g. FIBREX10)"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-purple-600"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}

              {promoFeedback && !discountCode && (
                <p className="text-[11px] text-red-500 mt-1">{promoFeedback.message}</p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 tabular-nums">{formatPrice(cartTotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-purple-600 font-semibold">
                  <span>Promo Discount</span>
                  <span className="tabular-nums">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingCost === 0 ? (
                    <strong className="text-emerald-600 font-bold">FREE</strong>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>Total</span>
                <span className="text-base text-purple-700 tabular-nums">{formatPrice(totalWithShipping)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleProceedCheckout}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsCartOpen(false)}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 py-1"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
