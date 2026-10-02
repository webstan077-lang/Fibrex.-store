import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Check, SlidersHorizontal, TrendingUp } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { PRODUCTS } from '../data/products';
import { FilterState, Product, SortOption } from '../types';
import { filterProducts, sortProducts } from '../utils/format';
import { FiltersSidebar } from '../components/FiltersSidebar';
import { ProductGrid } from '../components/ProductGrid';
import { QuickShopModal } from '../components/QuickShopModal';

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Customer Rating', value: 'rating' },
  { label: 'Biggest Discount', value: 'discount' },
];

export const SearchPage: React.FC = () => {
  const { searchQuery = '', navigate } = useNavigation();
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [filters, setFilters] = useState<FilterState>({});
  const [sortOption, setSortOption] = useState<SortOption>('recommended');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Sync state if navigation searchQuery changes
  React.useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  const trendingTags = ['wireless earbuds', 'smartwatch', 'sneakers', 'skincare', 'audio', 'deals'];

  const searchedProducts = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();
    if (!q) return PRODUCTS;

    if (q === 'deals' || q === 'flash') {
      return PRODUCTS.filter((p) => p.is_flash_deal || (p.discount_percent && p.discount_percent >= 25));
    }
    if (q === 'bestseller' || q === 'best seller') {
      return PRODUCTS.filter((p) => p.is_best_seller || (p.sold_count && p.sold_count > 2000));
    }
    if (q === 'new' || q === 'new arrivals') {
      return PRODUCTS.filter((p) => p.is_new_arrival);
    }
    if (q === 'recommended') {
      return PRODUCTS.filter((p) => p.is_recommended);
    }

    return PRODUCTS.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchSub = p.subcategory && p.subcategory.toLowerCase().includes(q);
      const matchBrand = p.brand && p.brand.toLowerCase().includes(q);
      const matchTags = p.tags && p.tags.some((t) => t.toLowerCase().includes(q));
      return matchName || matchCat || matchSub || matchBrand || matchTags;
    });
  }, [searchTerm]);

  const displayedProducts = useMemo(() => {
    const filtered = filterProducts(searchedProducts, filters);
    return sortProducts(filtered, sortOption);
  }, [searchedProducts, filters, sortOption]);

  const activeSortLabel = SORT_OPTIONS.find((s) => s.value === sortOption)?.label;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-3 md:px-6 py-6 pb-20">
      {/* Header Search Stage */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-xs mb-6">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products, brands, or keywords..."
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-purple-600 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Trending Keywords */}
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
            Trending:
          </span>
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSearchTerm(tag);
                navigate(`/search?q=${encodeURIComponent(tag)}`);
              }}
              className={`px-3 py-1 rounded-full border transition-colors ${
                searchTerm.toLowerCase() === tag
                  ? 'bg-purple-600 text-white border-purple-600 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex gap-6 items-start">
        {/* Filters Sidebar */}
        <FiltersSidebar
          products={searchedProducts}
          filters={filters}
          setFilters={setFilters}
        />

        {/* Search Results Area */}
        <div className="flex-1 min-w-0">
          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-3 mb-4 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500">
              Found <strong className="text-slate-900 font-bold">{displayedProducts.length}</strong> results for{' '}
              <strong className="text-purple-700 font-bold">"{searchTerm || 'All Products'}"</strong>
            </span>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortDropdownOpen((prev) => !prev)}
                onBlur={() => setTimeout(() => setSortDropdownOpen(false), 200)}
                className="flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline text-slate-500 font-normal">Sort by:</span>
                <span>{activeSortLabel}</span>
              </button>

              {sortDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-fade-in">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortOption(opt.value);
                        setSortDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition-colors ${
                        sortOption === opt.value
                          ? 'text-purple-600 font-bold bg-purple-50/50'
                          : 'text-slate-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortOption === opt.value && (
                        <Check className="w-3.5 h-3.5 text-purple-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Results Grid */}
          {displayedProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <SlidersHorizontal className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No matching products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                Check spelling, try broader keywords, or reset filters to discover other available products.
              </p>
              <button
                onClick={() => {
                  setFilters({});
                  setSearchTerm('');
                  navigate('/search');
                }}
                className="bg-purple-600 text-white font-bold text-xs px-5 py-2.5 rounded-full hover:bg-purple-700 transition-colors shadow-xs"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <ProductGrid
              products={displayedProducts}
              onQuickView={setQuickViewProduct}
            />
          )}
        </div>
      </div>

      {/* Quick View Dialog */}
      <QuickShopModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
