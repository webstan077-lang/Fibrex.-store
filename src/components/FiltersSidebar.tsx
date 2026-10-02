import React, { useState } from 'react';
import { Filter, X, Check, Star, RotateCcw } from 'lucide-react';
import { FilterState, Product } from '../types';

interface FiltersSidebarProps {
  products: Product[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  brands?: string[];
}

const PRICE_RANGES = [
  { label: 'All Prices', min: null, max: null },
  { label: 'Under ₦10,000', min: 0, max: 10000 },
  { label: '₦10,000 – ₦25,000', min: 10000, max: 25000 },
  { label: '₦25,000 – ₦50,000', min: 25000, max: 50000 },
  { label: '₦50,000 – ₦100,000', min: 50000, max: 100000 },
  { label: 'Over ₦100,000', min: 100000, max: null },
];

export const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  products,
  filters,
  setFilters,
  brands: customBrands,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const availableBrands =
    customBrands ||
    [...new Set(products.map((p) => p.brand).filter(Boolean) as string[])].sort();

  const update = (partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleBrandToggle = (brand: string) => {
    const current = filters.brand || [];
    if (current.includes(brand)) {
      update({ brand: current.filter((b) => b !== brand) });
    } else {
      update({ brand: [...current, brand] });
    }
  };

  const clearAll = () => {
    setFilters({});
  };

  const activeFiltersCount =
    (filters.minPrice != null || filters.maxPrice != null ? 1 : 0) +
    (filters.brand?.length || 0) +
    (filters.minRating != null ? 1 : 0) +
    (filters.minDiscount != null ? 1 : 0) +
    (filters.inStock ? 1 : 0);

  const filterContent = (
    <div className="space-y-6">
      {/* Active filters header / reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </span>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
          Price Range
        </h4>
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => {
            const isSelected =
              filters.minPrice === range.min && filters.maxPrice === range.max;
            return (
              <button
                key={range.label}
                type="button"
                onClick={() =>
                  update({ minPrice: range.min, maxPrice: range.max })
                }
                className={`flex items-center gap-2.5 text-xs w-full text-left px-2.5 py-2 rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-purple-50 text-purple-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-purple-600' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <span className="w-2 h-2 rounded-full bg-purple-600" />}
                </span>
                <span>{range.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Brands */}
      {availableBrands.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
            Brands
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {availableBrands.map((brand) => {
              const checked = (filters.brand || []).includes(brand);
              return (
                <button
                  key={brand}
                  type="button"
                  onClick={() => handleBrandToggle(brand)}
                  className="flex items-center gap-2 text-xs text-slate-700 w-full text-left hover:text-slate-900 py-1"
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      checked
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {checked && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                  <span className={checked ? 'font-bold text-slate-900' : ''}>{brand}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer Rating */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
          Minimum Rating
        </h4>
        <div className="space-y-1">
          {[4, 3, 2, 1].map((rating) => {
            const isSelected = filters.minRating === rating;
            return (
              <button
                key={rating}
                type="button"
                onClick={() =>
                  update({ minRating: isSelected ? null : rating })
                }
                className={`flex items-center gap-2 text-xs px-2.5 py-2 rounded-lg w-full transition-colors ${
                  isSelected
                    ? 'bg-purple-50 text-purple-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        s <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200 fill-slate-100'
                      }`}
                    />
                  ))}
                </div>
                <span>{rating}.0 & up</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Discount */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
          Discount
        </h4>
        <div className="space-y-1">
          {[10, 25, 50].map((d) => {
            const isSelected = filters.minDiscount === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() =>
                  update({ minDiscount: isSelected ? null : d })
                }
                className={`text-xs px-2.5 py-2 rounded-lg w-full text-left transition-colors ${
                  isSelected
                    ? 'bg-purple-50 text-purple-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {d}% off or more
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
          Availability
        </h4>
        <button
          type="button"
          onClick={() => update({ inStock: !filters.inStock })}
          className={`flex items-center gap-2 text-xs px-2.5 py-2 rounded-lg w-full transition-colors ${
            filters.inStock
              ? 'bg-purple-50 text-purple-700 font-bold'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              filters.inStock
                ? 'bg-purple-600 border-purple-600 text-white'
                : 'border-slate-300 bg-white'
            }`}
          >
            {filters.inStock && <Check className="w-3 h-3 stroke-[3]" />}
          </span>
          <span>In Stock Only</span>
        </button>
      </div>

      {/* Clear Button */}
      <button
        type="button"
        onClick={clearAll}
        className="w-full text-xs font-semibold py-2 px-3 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Trigger Button */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-50 cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5 text-purple-600" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-purple-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Mobile Slide-out Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative ml-auto w-[85vw] max-w-sm bg-white h-full p-5 overflow-y-auto shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <h3 className="font-bold text-slate-900 text-base">Filter Products</h3>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {filterContent}
              </div>

              <div className="pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-full bg-purple-600 text-white font-bold py-2.5 rounded-xl text-sm shadow-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block w-56 lg:w-64 shrink-0 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs self-start sticky top-32">
        {filterContent}
      </div>
    </>
  );
};
