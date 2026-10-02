export interface Variant {
  name: string;
  options: string[];
}

export interface SpecificationItem {
  label: string;
  value: string;
}

export interface ProductVariantItem {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  stock?: number;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  original_price?: number;
  cost_price?: number;
  currency: string;
  discount_percent?: number;
  rating?: number;
  review_count?: number;
  sold_count?: number;
  stock?: number;
  sku?: string;
  low_stock_threshold?: number;
  track_inventory?: boolean;
  brand?: string;
  badge?: string;
  description?: string;
  specifications?: string | SpecificationItem[] | null;
  images: string[];
  variants?: Variant[];
  variant_items?: ProductVariantItem[];
  tags?: string[];
  shipping_info?: string;
  is_flash_deal?: boolean;
  flash_deal_end?: string | null;
  is_recommended?: boolean;
  is_best_seller?: boolean;
  is_new_arrival?: boolean;
  status?: 'published' | 'draft' | 'archived';
  store_id?: string;
  seo_title?: string;
  seo_description?: string;
  seo_slug?: string;
  created_date?: string;
  updated_date?: string;
  created_by_id?: string;
  is_sample?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  icon?: string;
  description?: string;
  subcategories?: string[];
}

export interface CartItem {
  key: string;
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image?: string;
  category?: string;
  qty: number;
  variant?: Record<string, string>;
}

export interface RecentlyViewedItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  category: string;
}

export interface FilterState {
  category?: string;
  subcategory?: string | null;
  brand?: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
  minRating?: number | null;
  minDiscount?: number | null;
  inStock?: boolean;
}

export type SortOption =
  | 'recommended'
  | 'popular'
  | 'newest'
  | 'price_asc'
  | 'price_desc'
  | 'rating'
  | 'discount';

export interface Review {
  id?: string;
  productId?: string;
  name: string;
  rating: number;
  text: string;
  date?: string;
  verified?: boolean;
}

export type OrderStatus =
  | 'Pending'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export type PaymentStatus = 'Paid' | 'Pending' | 'Refunded';
export type FulfillmentStatus = 'Fulfilled' | 'Unfulfilled' | 'Partially Fulfilled';

export interface Order {
  id: string;
  storeId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  trackingNumber?: string;
  paymentMethod: string;
  createdAt: string;
}

export interface OrderDetails {
  orderId: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  paymentMethod: 'card' | 'transfer' | 'delivery';
  deliverySpeed: 'standard' | 'express';
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  placedAt: string;
}

export type CardBrand =
  | 'visa'
  | 'mastercard'
  | 'verve'
  | 'amex'
  | 'discover'
  | 'unionpay'
  | 'jcb'
  | 'unknown';

export interface SavedCard {
  id: string;
  brand: CardBrand;
  last4: string;
  expMonth: string;
  expYear: string;
  holderName: string;
  isDefault?: boolean;
  colorScheme?: string;
}

export type UserRole = 'platform_admin' | 'store_owner' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId?: string;
  avatar?: string;
  phone?: string;
  joinedDate: string;
  status: 'active' | 'suspended';
  googleLinked?: boolean;
  selectedCountry?: string;
  savedCards?: SavedCard[];
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  logo?: string;
  description: string;
  category: string;
  country: string;
  currency: string;
  timezone: string;
  urlSlug: string;
  primaryColor?: string;
  theme: 'modern' | 'vibrant' | 'minimal' | 'luxe';
  status: 'active' | 'inactive';
  bannerImage?: string;
  createdAt: string;
}

export interface CustomerProfile {
  id: string;
  storeId: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  city: string;
  state: string;
  country: string;
  notes?: string;
}

export interface Promotion {
  id: string;
  storeId: string;
  name: string;
  code: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'free_shipping';
  value: number;
  minSpend?: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'expired';
  usageCount: number;
}

export interface SeasonalCampaign {
  id: string;
  name: string;
  themeType: 'new_year' | 'valentines' | 'easter' | 'black_friday' | 'christmas' | 'anniversary' | 'eid';
  discountPercent: number;
  startDate: string;
  endDate: string;
  bannerTitle: string;
  bannerSubtitle: string;
  status: 'active' | 'draft' | 'ended';
  eligibleProductCount: number;
}

export interface AIDoctorRecommendation {
  id: string;
  category: 'Product Quality' | 'Store Design' | 'SEO' | 'Inventory' | 'Conversion';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  actionText: string;
  status: 'pending' | 'applied' | 'dismissed';
}

export interface SmartDealOpportunity {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  currentPrice: number;
  salesVelocity: 'Strong' | 'Moderate' | 'Slow Moving' | 'High Stock';
  reason: string;
  suggestedDiscount: number;
  suggestedDurationHours: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ProductOpportunityRadarItem {
  id: string;
  category: string;
  opportunityLevel: 'High' | 'Medium' | 'Low';
  searchDemandCount: number;
  currentStoreProducts: number;
  insight: string;
  suggestedActions: string[];
}
