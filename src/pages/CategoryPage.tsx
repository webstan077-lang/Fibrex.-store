import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, ArrowUpDown, Check, SlidersHorizontal } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { CATEGORIES, CATEGORIES_MAP } from '../data/categories';
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

export const CategoryPage: React.FC = () => {
  const { categorySlug = 'electronics', navigate } = useNavigation();
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  const [sortOption, setSortOption] = useState<SortOption>('recommended');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const categoryMeta = CATEGORIES.find((c) => c.slug === categorySlug) || {
    id: categorySlug,
    name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
    slug: categorySlug,
    image: 'https://media.base44.com/images/public/6a881422fe75f0c2d78f956b/b60466a12_generated_228e74e2.png',
    subcategories: CATEGORIES_MAP[categorySlug]?.subcategories || [],
  };

  const subcategories = categoryMeta.subcategories || CATEGORIES_MAP[categorySlug]?.subcategories || [];

  useEffect(() => {
    setSelectedSubcategory(null);
    setFilters({});
    setSortOption('recommended');
  }, [categorySlug]);

  const rawCategoryProducts = useMemo(() => {
    return PRODUCTS.filter((p) => p.category.toLowerCase() === categorySlug.toLowerCase());
  }, [categorySlug]);

  const categoryBrands = useMemo(() => {
    return [...new Set(rawCategoryProducts.map((p) => p.brand).filter(Boolean) as string[])].sort();
  }, [rawCategoryProducts]);

  const displayedProducts = useMemo(() => {
    const combinedFilters: FilterState = {
      ...filters,
      category: categorySlug,
      subcategory: selectedSubcategory,
    };

    const filtered = filterProducts(PRODUCTS, combinedFilters);
    return sortProducts(filtered, sortOption);
  }, [categorySlug, selectedSubcategory, filters, sortOption]);

  const activeSortLabel = SORT_OPTIONS.find((s) => s.value === sortOption)?.label;

  return (
    <div className="pb-16">
      {/* Category Banner */}
      <div className="relative h-44 sm:h-56 md:h-64 overflow-hidden bg-slate-900">
        <img
          src={categoryMeta.image}
          alt={categoryMeta.name}
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/60 to-transparent" />

        <div className="absolute inset-0 max-w-[1600px] mx-auto px-3 md:px-6 flex flex-col justify-end pb-6 text-white">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-300 mb-2">
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors">
              Home
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-purple-300 font-semibold">{categoryMeta.name}</span>
          </nav>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight">
            {categoryMeta.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {rawCategoryProducts.length} premium products curated in this category
          </p>
        </div>
      </div>

      {/* Subcategories Horizontal Bar */}
      {subcategories.length > 0 && (
        <div className="border-b border-slate-200 bg-white sticky top-14 md:top-16 z-20 shadow-xs">
          <div className="max-w-[1600px] mx-auto px-3 md:px-6 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedSubcategory(null)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedSubcategory === null
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              All {categoryMeta.name}
            </button>

            {subcategories.map((sub) => {
              const isSelected = selectedSubcategory === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(isSelected ? null : sub)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Layout with Sidebar Filters and Product Grid */}
      <div className="max-w-[1600px] mx-auto px-3 md:px-6 pt-6">
        <div className="flex gap-6 items-start">
          {/* Filters Sidebar */}
          <FiltersSidebar
            products={rawCategoryProducts}
            filters={filters}
            setFilters={setFilters}
            brands={categoryBrands}
          />

          {/* Right Product Grid Area */}
          <div className="flex-1 min-w-0">
            {/* Controls Bar: Total Results + Sorting Dropdown */}
            <div className="flex items-center justify-between gap-3 mb-4 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  Showing <strong className="text-slate-900 font-bold">{displayedProducts.length}</strong> products
                </span>
                {selectedSubcategory && (
                  <span className="text-[11px] bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
                    {selectedSubcategory}
                  </span>
                )}
              </div>

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

            {/* Products or Empty State */}
            {displayedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                  <SlidersHorizontal className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No products match your filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                  Try clearing some filter criteria or selecting another subcategory to explore more options.
                </p>
                <button
                  onClick={() => {
                    setFilters({});
                    setSelectedSubcategory(null);
                  }}
                  className="bg-purple-600 text-white font-bold text-xs px-5 py-2.5 rounded-full hover:bg-purple-700 transition-colors shadow-xs"
                >
                  Reset All Filters
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
