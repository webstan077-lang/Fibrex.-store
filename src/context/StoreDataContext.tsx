import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  Category,
  Store,
  Order,
  CustomerProfile,
  Promotion,
  SeasonalCampaign,
  AIDoctorRecommendation,
  SmartDealOpportunity,
  ProductOpportunityRadarItem,
  Review,
  OrderStatus,
  FulfillmentStatus,
  OrderDetails,
} from '../types';
import { PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/categories';
import {
  INITIAL_STORES,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_PROMOTIONS,
  INITIAL_SEASONAL_CAMPAIGNS,
  INITIAL_AI_DOCTOR_RECOMMENDATIONS,
  INITIAL_SMART_DEALS,
  INITIAL_OPPORTUNITY_RADAR,
  INITIAL_REVIEWS,
} from '../data/mockStoresData';

interface StoreDataContextType {
  products: Product[];
  stores: Store[];
  categories: Category[];
  orders: Order[];
  customers: CustomerProfile[];
  promotions: Promotion[];
  seasonalCampaigns: SeasonalCampaign[];
  aiDoctorRecommendations: AIDoctorRecommendation[];
  smartDealOpportunities: SmartDealOpportunity[];
  opportunityRadar: ProductOpportunityRadarItem[];
  reviews: Review[];

  // Product CRUD
  addProduct: (product: Partial<Product>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => Product;
  publishProduct: (id: string, publish: boolean) => void;

  // Category CRUD
  addCategory: (category: Partial<Category>) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Order Operations
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    fulfillmentStatus?: FulfillmentStatus,
    trackingNumber?: string
  ) => void;
  createOrder: (details: OrderDetails) => Order;

  // Inventory
  updateInventory: (productId: string, newStock: number, lowStockThreshold?: number) => void;

  // Promotions & Marketing
  addPromotion: (promo: Partial<Promotion>) => void;
  togglePromotion: (id: string) => void;
  deletePromotion: (id: string) => void;
  addSeasonalCampaign: (campaign: Partial<SeasonalCampaign>) => void;

  // AI Store Intelligence
  applyAIDoctorRecommendation: (id: string) => void;
  dismissAIDoctorRecommendation: (id: string) => void;
  approveSmartDeal: (id: string) => void;
  rejectSmartDeal: (id: string) => void;

  // Reviews
  addReview: (review: Review) => void;

  // Store Management
  createStore: (storeData: Partial<Store>) => Store;
  updateStore: (storeId: string, updates: Partial<Store>) => void;
}

const StoreDataContext = createContext<StoreDataContextType | undefined>(undefined);

export const StoreDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Products State
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('fibrex_custom_products');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        // Merge with existing products
        const existingIds = new Set(parsed.map((p) => p.id));
        const originalMissing = PRODUCTS.filter((p) => !existingIds.has(p.id));
        return [...parsed, ...originalMissing];
      }
    } catch {
      // Fallback
    }
    return PRODUCTS;
  });

  // 2. Stores State
  const [stores, setStores] = useState<Store[]>(() => {
    try {
      const saved = localStorage.getItem('fibrex_stores');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_STORES;
  });

  // 3. Categories State
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('fibrex_categories');
      if (saved) return JSON.parse(saved);
    } catch {}
    return CATEGORIES;
  });

  // 4. Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('fibrex_orders');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ORDERS;
  });

  // 5. Customers State
  const [customers, setCustomers] = useState<CustomerProfile[]>(() => {
    try {
      const saved = localStorage.getItem('fibrex_customers');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CUSTOMERS;
  });

  // 6. Promotions State
  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    try {
      const saved = localStorage.getItem('fibrex_promotions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PROMOTIONS;
  });

  // 7. Seasonal Campaigns
  const [seasonalCampaigns, setSeasonalCampaigns] = useState<SeasonalCampaign[]>(() => {
    try {
      const saved = localStorage.getItem('fibrex_seasonal_campaigns');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SEASONAL_CAMPAIGNS;
  });

  // 8. AI Doctor Recommendations
  const [aiDoctorRecommendations, setAIDoctorRecommendations] = useState<AIDoctorRecommendation[]>(() => {
    try {
      const saved = localStorage.getItem('fibrex_ai_recommendations');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_AI_DOCTOR_RECOMMENDATIONS;
  });

  // 9. Smart Deals
  const [smartDealOpportunities, setSmartDealOpportunities] = useState<SmartDealOpportunity[]>(() => {
    try {
      const saved = localStorage.getItem('fibrex_smart_deals');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SMART_DEALS;
  });

  // 10. Opportunity Radar
  const [opportunityRadar, setOpportunityRadar] = useState<ProductOpportunityRadarItem[]>(() => {
    return INITIAL_OPPORTUNITY_RADAR;
  });

  // 11. Reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('fibrex_reviews');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_REVIEWS;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('fibrex_custom_products', JSON.stringify(products.slice(0, 100)));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('fibrex_stores', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem('fibrex_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('fibrex_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('fibrex_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('fibrex_promotions', JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    localStorage.setItem('fibrex_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Product CRUD
  const addProduct = useCallback((newProdData: Partial<Product>): Product => {
    const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cost = newProdData.cost_price || Math.round((newProdData.price || 10000) * 0.65);
    const sellingPrice = newProdData.price || 10000;
    const originalPrice = newProdData.original_price || Math.round(sellingPrice * 1.35);
    const discount = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);

    const product: Product = {
      id,
      name: newProdData.name || 'Untitled Product',
      category: newProdData.category || 'electronics',
      subcategory: newProdData.subcategory || 'Accessories',
      price: sellingPrice,
      original_price: originalPrice,
      cost_price: cost,
      currency: '₦',
      discount_percent: discount > 0 ? discount : 0,
      rating: 5.0,
      review_count: 1,
      sold_count: 0,
      stock: newProdData.stock !== undefined ? newProdData.stock : 50,
      sku: newProdData.sku || `FBX-${Math.floor(100000 + Math.random() * 900000)}`,
      low_stock_threshold: newProdData.low_stock_threshold || 10,
      track_inventory: true,
      brand: newProdData.brand || 'Apex Brand',
      badge: newProdData.badge || 'New',
      description: newProdData.description || 'Verified merchant product with official guarantee.',
      specifications: newProdData.specifications || null,
      images:
        newProdData.images && newProdData.images.length > 0
          ? newProdData.images
          : [
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
            ],
      variants: newProdData.variants || [],
      tags: newProdData.tags || ['merchant-verified', 'new-arrival'],
      shipping_info: 'Ships in 24h',
      status: newProdData.status || 'published',
      is_new_arrival: true,
      is_recommended: true,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };

    setProducts((prev) => [product, ...prev]);
    return product;
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== id) return prod;
        const updated = { ...prod, ...updates, updated_date: new Date().toISOString() };
        if (updates.price || updates.original_price) {
          const selling = updates.price !== undefined ? updates.price : prod.price;
          const original =
            updates.original_price !== undefined ? updates.original_price : prod.original_price;
          if (original && original > selling) {
            updated.discount_percent = Math.round(((original - selling) / original) * 100);
          }
        }
        return updated;
      })
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const duplicateProduct = useCallback(
    (id: string): Product => {
      const target = products.find((p) => p.id === id);
      if (!target) throw new Error('Product not found');

      const clonedId = `prod_${Date.now()}_copy`;
      const cloned: Product = {
        ...target,
        id: clonedId,
        name: `${target.name} (Copy)`,
        sku: `${target.sku || 'FBX'}-COPY`,
        sold_count: 0,
        review_count: 0,
        badge: 'New',
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      };

      setProducts((prev) => [cloned, ...prev]);
      return cloned;
    },
    [products]
  );

  const publishProduct = useCallback((id: string, publish: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: publish ? 'published' : 'draft' } : p))
    );
  }, []);

  // Category CRUD
  const addCategory = useCallback((catData: Partial<Category>): Category => {
    const slug = (catData.name || 'custom-category').toLowerCase().replace(/\s+/g, '-');
    const newCat: Category = {
      id: `cat_${Date.now()}`,
      name: catData.name || 'New Category',
      slug,
      image:
        catData.image ||
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      icon: catData.icon || 'Sparkles',
      description: catData.description || 'Explore our verified product category.',
      subcategories: catData.subcategories || ['Featured', 'Accessories', 'New Releases'],
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Order Operations
  const updateOrderStatus = useCallback(
    (
      orderId: string,
      status: OrderStatus,
      fulfillmentStatus?: FulfillmentStatus,
      trackingNumber?: string
    ) => {
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id !== orderId) return ord;
          return {
            ...ord,
            status,
            fulfillmentStatus: fulfillmentStatus || ord.fulfillmentStatus,
            trackingNumber: trackingNumber || ord.trackingNumber,
          };
        })
      );
    },
    []
  );

  const createOrder = useCallback(
    (details: OrderDetails): Order => {
      const newOrder: Order = {
        id: details.orderId,
        storeId: 'store_apex_01',
        customerId: 'cust_01',
        customerName: details.customerName,
        customerEmail: details.email,
        customerPhone: details.phone,
        shippingAddress: {
          address: details.address,
          city: details.city,
          state: details.state,
          country: 'Nigeria',
        },
        items: details.items,
        subtotal: details.subtotal,
        discount: details.discount,
        shipping: details.shipping,
        tax: 0,
        total: details.total,
        currency: '₦',
        status: 'Processing',
        paymentStatus: details.paymentMethod === 'delivery' ? 'Pending' : 'Paid',
        fulfillmentStatus: 'Unfulfilled',
        trackingNumber: `FX-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
        paymentMethod:
          details.paymentMethod === 'card'
            ? 'Credit Card / Visa'
            : details.paymentMethod === 'transfer'
            ? 'Bank Transfer'
            : 'Pay on Delivery',
        createdAt: details.placedAt || new Date().toISOString(),
      };

      setOrders((prev) => [newOrder, ...prev]);

      // Deduct inventory
      details.items.forEach((item) => {
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === item.id && p.stock !== undefined) {
              const remaining = Math.max(0, p.stock - item.qty);
              const sold = (p.sold_count || 0) + item.qty;
              return { ...p, stock: remaining, sold_count: sold };
            }
            return p;
          })
        );
      });

      return newOrder;
    },
    []
  );

  // Inventory
  const updateInventory = useCallback(
    (productId: string, newStock: number, lowStockThreshold?: number) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          return {
            ...p,
            stock: newStock,
            low_stock_threshold:
              lowStockThreshold !== undefined ? lowStockThreshold : p.low_stock_threshold,
          };
        })
      );
    },
    []
  );

  // Marketing
  const addPromotion = useCallback((promoData: Partial<Promotion>) => {
    const promo: Promotion = {
      id: `promo_${Date.now()}`,
      storeId: 'store_apex_01',
      name: promoData.name || 'Seasonal Promo',
      code: (promoData.code || 'DISCOUNT10').toUpperCase().trim(),
      type: promoData.type || 'percentage',
      value: promoData.value || 10,
      minSpend: promoData.minSpend || 10000,
      startDate: promoData.startDate || new Date().toISOString().split('T')[0],
      endDate: promoData.endDate || '2026-12-31',
      status: 'active',
      usageCount: 0,
    };
    setPromotions((prev) => [promo, ...prev]);
  }, []);

  const togglePromotion = useCallback((id: string) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: p.status === 'active' ? 'expired' : 'active' } : p))
    );
  }, []);

  const deletePromotion = useCallback((id: string) => {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addSeasonalCampaign = useCallback((campData: Partial<SeasonalCampaign>) => {
    const camp: SeasonalCampaign = {
      id: `camp_${Date.now()}`,
      name: campData.name || 'Special Campaign',
      themeType: campData.themeType || 'christmas',
      discountPercent: campData.discountPercent || 25,
      startDate: campData.startDate || new Date().toISOString().split('T')[0],
      endDate: campData.endDate || '2026-12-31',
      bannerTitle: campData.bannerTitle || 'Mega Seasonal Clearance',
      bannerSubtitle: campData.bannerSubtitle || 'Special price reductions across all verified store goods.',
      status: 'active',
      eligibleProductCount: campData.eligibleProductCount || 100,
    };
    setSeasonalCampaigns((prev) => [camp, ...prev]);
  }, []);

  // AI Store Doctor
  const applyAIDoctorRecommendation = useCallback((id: string) => {
    setAIDoctorRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'applied' } : r))
    );
  }, []);

  const dismissAIDoctorRecommendation = useCallback((id: string) => {
    setAIDoctorRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'dismissed' } : r))
    );
  }, []);

  // Smart Deals
  const approveSmartDeal = useCallback(
    (id: string) => {
      const deal = smartDealOpportunities.find((d) => d.id === id);
      if (deal) {
        // Auto apply flash deal to product
        updateProduct(deal.productId, {
          is_flash_deal: true,
          discount_percent: Math.max(deal.suggestedDiscount, 15),
          badge: 'Flash Sale',
        });
      }
      setSmartDealOpportunities((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: 'approved' } : d))
      );
    },
    [smartDealOpportunities, updateProduct]
  );

  const rejectSmartDeal = useCallback((id: string) => {
    setSmartDealOpportunities((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'rejected' } : d))
    );
  }, []);

  // Reviews
  const addReview = useCallback((rev: Review) => {
    const newRev = { ...rev, id: `rev_${Date.now()}`, date: 'Just now', verified: true };
    setReviews((prev) => [newRev, ...prev]);
  }, []);

  // Store Management
  const createStore = useCallback((storeData: Partial<Store>): Store => {
    const newStore: Store = {
      id: `store_${Date.now()}`,
      ownerId: 'user_merchant_01',
      name: storeData.name || 'My Fibrex Store',
      logo:
        storeData.logo ||
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80',
      description: storeData.description || 'Welcome to our verified merchant store.',
      category: storeData.category || 'Retail & Lifestyle',
      country: storeData.country || 'Nigeria',
      currency: storeData.currency || 'NGN',
      timezone: storeData.timezone || 'Africa/Lagos',
      urlSlug: (storeData.name || 'my-store').toLowerCase().replace(/\s+/g, '-'),
      primaryColor: storeData.primaryColor || '#7c3aed',
      theme: storeData.theme || 'modern',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setStores((prev) => [...prev, newStore]);
    return newStore;
  }, []);

  const updateStore = useCallback((storeId: string, updates: Partial<Store>) => {
    setStores((prev) => prev.map((s) => (s.id === storeId ? { ...s, ...updates } : s)));
  }, []);

  return (
    <StoreDataContext.Provider
      value={{
        products,
        stores,
        categories,
        orders,
        customers,
        promotions,
        seasonalCampaigns,
        aiDoctorRecommendations,
        smartDealOpportunities,
        opportunityRadar,
        reviews,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        publishProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        updateOrderStatus,
        createOrder,
        updateInventory,
        addPromotion,
        togglePromotion,
        deletePromotion,
        addSeasonalCampaign,
        applyAIDoctorRecommendation,
        dismissAIDoctorRecommendation,
        approveSmartDeal,
        rejectSmartDeal,
        addReview,
        createStore,
        updateStore,
      }}
    >
      {children}
    </StoreDataContext.Provider>
  );
};

export const useStoreData = (): StoreDataContextType => {
  const context = useContext(StoreDataContext);
  if (!context) {
    throw new Error('useStoreData must be used within StoreDataProvider');
  }
  return context;
};
