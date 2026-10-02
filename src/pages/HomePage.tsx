import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Sparkles,
  Flame,
  Award,
  ArrowRight,
} from 'lucide-react';
import { HeroBanner } from '../components/HeroBanner';
import { FlashDeals } from '../components/FlashDeals';
import { ProductGrid } from '../components/ProductGrid';
import { QuickShopModal } from '../components/QuickShopModal';
import { PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/categories';
import { Product } from '../types';
import { useNavigation } from '../context/NavigationContext';

export const HomePage: React.FC = () => {
  const { navigate } = useNavigation();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [visibleDiscoverCount, setVisibleDiscoverCount] = useState(12);

  // Segment products
  const recommendedProducts = useMemo(
    () => PRODUCTS.filter((p) => p.is_recommended).slice(0, 12),
    []
  );

  const bestSellerProducts = useMemo(
    () => PRODUCTS.filter((p) => p.is_best_seller || (p.sold_count && p.sold_count > 2000)).slice(0, 12),
    []
  );

  const newArrivalProducts = useMemo(
    () => PRODUCTS.filter((p) => p.is_new_arrival).slice(0, 12),
    []
  );

  const allDiscoverProducts = useMemo(() => PRODUCTS, []);

  return (
    <div className="space-y-8 md:space-y-12 pb-12">
      {/* 1. Hero Promotional Banner */}
      <HeroBanner />

      {/* 2. Flash Deals Live Ticker Carousel */}
      <FlashDeals products={PRODUCTS} onQuickView={setQuickViewProduct} />

      {/* 3. Popular Categories Visual Showcase */}
      <section className="max-w-[1600px] mx-auto px-3 md:px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-900">
                Explore Categories
              </h2>
              <p className="text-xs text-slate-500">
                Handpicked collections for your everyday lifestyle
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/category/${cat.slug}`)}
              className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white border border-slate-200/80 cursor-pointer flex flex-col"
            >
              <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <p className="font-bold text-sm leading-tight drop-shadow-xs">{cat.name}</p>
                  <p className="text-[10px] text-slate-200 font-medium mt-0.5">
                    {PRODUCTS.filter((p) => p.category === cat.slug).length} Products
                  </p>
                </div>
              </div>

              <div className="p-2 bg-white flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-purple-600">
                <span className="text-[11px] truncate">View collection</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Recommended For You */}
      <section className="max-w-[1600px] mx-auto px-3 md:px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-900">
                Recommended For You
              </h2>
              <p className="text-xs text-slate-500">
                Curated based on trending demand and customer satisfaction
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/search?q=recommended')}
            className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
          >
            <span>See all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <ProductGrid
          products={recommendedProducts}
          onQuickView={setQuickViewProduct}
        />
      </section>

      {/* 5. Best Sellers Section */}
      <section className="max-w-[1600px] mx-auto px-3 md:px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-900">
                Top Best Sellers
              </h2>
              <p className="text-xs text-slate-500">
                Most purchased products with top verified ratings
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/search?q=bestseller')}
            className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
          >
            <span>See all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <ProductGrid
          products={bestSellerProducts}
          onQuickView={setQuickViewProduct}
        />
      </section>

      {/* 6. New Arrivals */}
      <section className="max-w-[1600px] mx-auto px-3 md:px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-900">
                Fresh New Arrivals
              </h2>
              <p className="text-xs text-slate-500">
                Latest releases added to our catalog this week
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/search?q=new')}
            className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
          >
            <span>See all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <ProductGrid
          products={newArrivalProducts}
          onQuickView={setQuickViewProduct}
        />
      </section>

      {/* 7. Discover All Products with Infinite / Load More */}
      <section className="max-w-[1600px] mx-auto px-3 md:px-6">
        <div className="border-t border-slate-200 pt-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900">
                Discover More Products
              </h2>
              <p className="text-xs text-slate-500">
                Showing {Math.min(visibleDiscoverCount, allDiscoverProducts.length)} of {allDiscoverProducts.length} items
              </p>
            </div>
          </div>

          <ProductGrid
            products={allDiscoverProducts.slice(0, visibleDiscoverCount)}
            onQuickView={setQuickViewProduct}
          />

          {visibleDiscoverCount < allDiscoverProducts.length && (
            <div className="text-center mt-8">
              <button
                onClick={() => setVisibleDiscoverCount((prev) => prev + 12)}
                className="bg-white hover:bg-purple-600 hover:text-white text-slate-900 font-bold text-xs md:text-sm py-3 px-8 rounded-full border border-slate-300 hover:border-purple-600 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                Load More Products ({allDiscoverProducts.length - visibleDiscoverCount} remaining)
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Quick View Dialog */}
      <QuickShopModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
