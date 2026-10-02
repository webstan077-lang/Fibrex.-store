import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Truck,
  Tag,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import { useNavigation } from '../context/NavigationContext';

export const CartPage: React.FC = () => {
  const {
    cart,
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
  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

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

  if (cart.length === 0) {
    return (
      <div className="max-w-[1600px] mx-auto px-3 md:px-6 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Your Shopping Cart is Empty</h1>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2 mb-6">
          Looks like you haven't added anything to your cart yet. Explore our flash deals and discover thousands of top products.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-slate-900 hover:bg-purple-600 text-white font-bold text-sm px-8 py-3.5 rounded-full transition-colors shadow-md cursor-pointer"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-3 md:px-6 py-8 pb-20">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">
        Shopping Cart ({cart.reduce((acc, i) => acc + i.qty, 0)} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Shipping Meter */}
          <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 shadow-2xs">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-purple-900 mb-2">
              <Truck className="w-4 h-4 text-purple-600 shrink-0" />
              {isFreeShipping ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Congratulations! You qualified for FREE
                  Nationwide Shipping!
                </span>
              ) : (
                <span>
                  Add{' '}
                  <strong className="text-purple-700 font-bold">
                    {formatPrice(amountToFreeShipping)}
                  </strong>{' '}
                  more to get <strong>FREE Shipping</strong>
                </span>
              )}
            </div>
            <div className="h-2 bg-purple-200/60 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isFreeShipping ? 'bg-emerald-500' : 'bg-purple-600'
                }`}
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {cart.map((item) => (
              <div key={item.key} className="p-4 sm:p-5 flex gap-4 items-center">
                {/* Thumbnail */}
                <div
                  onClick={() => navigate(`/product/${item.id}`)}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 cursor-pointer"
                >
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3
                    onClick={() => navigate(`/product/${item.id}`)}
                    className="text-xs sm:text-sm font-bold text-slate-900 leading-snug hover:text-purple-600 cursor-pointer line-clamp-2"
                  >
                    {item.name}
                  </h3>

                  {item.variant && Object.keys(item.variant).length > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      {Object.entries(item.variant)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' | ')}
                    </p>
                  )}

                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-sm sm:text-base font-black text-slate-950 tabular-nums">
                      {formatPrice(item.price)}
                    </span>
                    {item.original_price && item.original_price > item.price && (
                      <span className="text-xs text-slate-400 line-through tabular-nums">
                        {formatPrice(item.original_price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls & Total for Item */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                    <button
                      onClick={() => updateQty(item.key, item.qty - 1)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-900 tabular-nums">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.key, item.qty + 1)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="font-bold text-xs sm:text-sm text-slate-900 tabular-nums hidden sm:inline">
                    {formatPrice(item.price * item.qty)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.key)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/')}
            className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1.5 pt-2"
          >
            <span>← Continue Shopping</span>
          </button>
        </div>

        {/* Right Column: Order Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="font-black text-base text-slate-900">Order Summary</h2>

            {/* Promo Code Input */}
            <div>
              {discountCode ? (
                <div className="flex items-center justify-between bg-purple-50 text-purple-700 p-2.5 rounded-xl text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-purple-600" />
                    <span>Promo: <strong>{discountCode}</strong> applied</span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-red-500 hover:text-red-700 text-xs font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Promo code (e.g. FIBREX10)"
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-purple-600"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-purple-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shrink-0"
                  >
                    Apply
                  </button>
                </form>
              )}
              {promoFeedback && !discountCode && (
                <p className="text-[11px] text-red-500 mt-1">{promoFeedback.message}</p>
              )}
            </div>

            {/* Price Calculations Breakdown */}
            <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900 tabular-nums">{formatPrice(cartTotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-purple-600 font-semibold">
                  <span>Promo Discount ({discountCode})</span>
                  <span className="tabular-nums">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span>
                  {shippingCost === 0 ? (
                    <strong className="text-emerald-600 font-bold">FREE</strong>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-950 pt-3 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-lg text-purple-700 tabular-nums">{formatPrice(totalWithShipping)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe & 256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
