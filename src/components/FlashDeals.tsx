import React, { useState, useEffect, useRef } from 'react';
import { Zap, ChevronLeft, ChevronRight, Eye, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { calculateDiscount } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';

interface FlashDealsProps {
  products: Product[];
  onQuickView: (product: Product) => void;
}

export const FlashDeals: React.FC<FlashDealsProps> = ({ products, onQuickView }) => {
  const { addToCart } = useCart();
  const { navigate } = useNavigation();
  const { formatPrice } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const flashProducts = products.filter((p) => p.is_flash_deal);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (flashProducts.length === 0) return null;

  const scroll = (direction: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction * 320,
        behavior: 'smooth',
      });
    }
  };

  const padZero = (n: number) => n.toString().padStart(2, '0');

  return (
    <section className="py-6 md:py-8">
      <div className="px-3 md:px-6 max-w-[1600px] mx-auto">
        <div className="rounded-2xl bg-gradient-to-br from-purple-50 via-white to-purple-50/40 border border-purple-200/80 p-4 md:p-6 shadow-sm">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-600 shrink-0">
                <Zap className="w-5 h-5 fill-purple-600 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                  Flash Deals
                  <span className="text-xs font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">
                    LIVE
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Limited time prices — grab them before stock runs out
                </p>
              </div>
            </div>

            {/* Timer and Slider Controls */}
            <div className="flex items-center justify-between sm:justify-end gap-3">
              {/* Countdown Ticker */}
              <div className="flex items-center gap-1.5 text-slate-900 font-mono text-xs">
                <span className="text-slate-500 font-sans font-medium text-xs mr-1 hidden sm:inline">
                  Ends in:
                </span>
                <span className="bg-slate-900 text-white font-bold px-2 py-1 rounded-md shadow-xs">
                  {padZero(timeLeft.hours)}
                </span>
                <span className="font-bold">:</span>
                <span className="bg-slate-900 text-white font-bold px-2 py-1 rounded-md shadow-xs">
                  {padZero(timeLeft.minutes)}
                </span>
                <span className="font-bold">:</span>
                <span className="bg-purple-600 text-white font-bold px-2 py-1 rounded-md shadow-xs">
                  {padZero(timeLeft.seconds)}
                </span>
              </div>

              {/* Slider Arrows */}
              <div className="hidden md:flex gap-1.5 ml-2">
                <button
                  onClick={() => scroll(-1)}
                  className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-xs"
                  aria-label="Previous flash deals"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scroll(1)}
                  className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-xs"
                  aria-label="Next flash deals"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Flash Deals Horizontal Carousel */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3.5 overflow-x-auto scrollbar-hide pb-2 pt-1 -mx-1 px-1"
          >
            {flashProducts.map((p) => {
              const discount = p.discount_percent || calculateDiscount(p.price, p.original_price);
              const stock = p.stock ?? 25;
              const stockPercent = Math.min(100, Math.max(15, (stock / 60) * 100));

              return (
                <div
                  key={p.id}
                  className="group shrink-0 w-44 sm:w-48 bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-md border border-slate-100 transition-all hover:-translate-y-1 flex flex-col"
                >
                  {/* Image container */}
                  <div
                    onClick={() => navigate(`/product/${p.id}`)}
                    className="relative aspect-square bg-slate-100 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Discount Badge */}
                    <span className="absolute top-2 left-2 bg-purple-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                      -{discount}%
                    </span>

                    {/* Quick View Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickView(p);
                      }}
                      className="absolute bottom-2 right-2 p-2 rounded-full bg-white/90 text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md hover:text-purple-600"
                      title="Quick view"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Body Info */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        onClick={() => navigate(`/product/${p.id}`)}
                        className="text-xs font-semibold text-slate-800 line-clamp-2 min-h-[2rem] hover:text-purple-600 cursor-pointer"
                      >
                        {p.name}
                      </h3>

                      <div className="flex items-baseline gap-1.5 mt-1.5">
                        <span className="text-sm font-black text-purple-600 tabular-nums">
                          {formatPrice(p.price)}
                        </span>
                        {p.original_price && p.original_price > p.price && (
                          <span className="text-[11px] text-slate-400 line-through tabular-nums">
                            {formatPrice(p.original_price)}
                          </span>
                        )}
                      </div>

                      {/* Stock Level Bar */}
                      <div className="mt-2">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            style={{ width: `${stockPercent}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                          Only {stock} left in stock
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(p, 1)}
                      className="mt-3 w-full bg-slate-900 hover:bg-purple-600 text-white text-xs font-bold py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Quick Add</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
