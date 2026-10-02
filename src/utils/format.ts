import { FilterState, Product, SortOption } from '../types';
import { getCountryByCode, DEFAULT_COUNTRY } from '../data/countries';

export function formatPrice(amount?: number | null, customCurrencySymbol?: string): string {
  if (amount == null || isNaN(amount)) {
    return (customCurrencySymbol || '₦') + '0';
  }

  if (customCurrencySymbol) {
    return `${customCurrencySymbol}${Math.round(amount).toLocaleString('en-US')}`;
  }

  // Auto-detect from active saved country
  try {
    const savedCountryCode = localStorage.getItem('fibrex_selected_country') || 'US';
    const config = getCountryByCode(savedCountryCode) || DEFAULT_COUNTRY;
    
    if (config.currencyCode === 'USD') {
      const converted = amount * config.rateAgainstNGN;
      const formatted = converted.toLocaleString('en-US', {
        minimumFractionDigits: config.decimalDigits,
        maximumFractionDigits: config.decimalDigits,
      });
      return `$${formatted}`;
    }

    if (config.currencyCode === 'NGN') {
      return `₦${Math.round(amount).toLocaleString('en-NG')}`;
    }

    const converted = amount * config.rateAgainstNGN;
    const formatted = converted.toLocaleString('en-US', {
      minimumFractionDigits: config.decimalDigits,
      maximumFractionDigits: config.decimalDigits,
    });

    const space = config.currencySymbol.length > 2 ? ' ' : '';
    return config.prefix
      ? `${config.currencySymbol}${space}${formatted}`
      : `${formatted} ${config.currencySymbol}`;
  } catch {
    return `₦${Math.round(amount).toLocaleString('en-NG')}`;
  }
}

export function formatCount(val?: number | null): string {
  if (val == null) return '0';
  if (val >= 1000) {
    const k = val / 1000;
    return (k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, '')) + 'K';
  }
  return String(val);
}

export function calculateDiscount(price: number, originalPrice?: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function filterProducts(products: Product[], filters: FilterState): Product[] {
  let result = [...products];

  if (filters.category) {
    result = result.filter((p) => p.category.toLowerCase() === filters.category!.toLowerCase());
  }

  if (filters.subcategory) {
    result = result.filter(
      (p) => p.subcategory && p.subcategory.toLowerCase() === filters.subcategory!.toLowerCase()
    );
  }

  if (filters.brand && filters.brand.length > 0) {
    result = result.filter((p) => p.brand && filters.brand!.includes(p.brand));
  }

  if (filters.minPrice != null) {
    result = result.filter((p) => p.price >= filters.minPrice!);
  }

  if (filters.maxPrice != null) {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }

  if (filters.minRating != null) {
    result = result.filter((p) => (p.rating || 0) >= filters.minRating!);
  }

  if (filters.minDiscount != null) {
    result = result.filter((p) => {
      const discount = p.discount_percent || calculateDiscount(p.price, p.original_price);
      return discount >= filters.minDiscount!;
    });
  }

  if (filters.inStock) {
    result = result.filter((p) => (p.stock || 0) > 0);
  }

  return result;
}

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const result = [...products];

  switch (sort) {
    case 'price_asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'newest':
      result.sort(
        (a, b) =>
          new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime()
      );
      break;
    case 'popular':
      result.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));
      break;
    case 'discount':
      result.sort((a, b) => {
        const discA = a.discount_percent || calculateDiscount(a.price, a.original_price);
        const discB = b.discount_percent || calculateDiscount(b.price, b.original_price);
        return discB - discA;
      });
      break;
    case 'recommended':
    default:
      result.sort((a, b) => {
        const recA = a.is_recommended ? 1 : 0;
        const recB = b.is_recommended ? 1 : 0;
        if (recA !== recB) return recB - recA;
        return (b.sold_count || 0) - (a.sold_count || 0);
      });
      break;
  }

  return result;
}
