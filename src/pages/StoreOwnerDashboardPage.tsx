import React, { useState, useRef } from 'react';
import {
  Store,
  Package,
  Layers,
  ShoppingBag,
  Boxes,
  Users,
  Palette,
  Sparkles,
  TrendingUp,
  Settings,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  DollarSign,
  Tag,
  Trash2,
  Edit,
  Copy,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Calendar,
  Zap,
  Filter,
  Check,
  X,
  RefreshCw,
  Gift,
  Flame,
  Lightbulb,
} from 'lucide-react';
import { useStoreData } from '../context/StoreDataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import {
  Product,
  Category,
  OrderStatus,
  Promotion,
  SeasonalCampaign,
  ProductVariantItem,
} from '../types';

export const StoreOwnerDashboardPage: React.FC = () => {
  const {
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
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    publishProduct,
    addCategory,
    deleteCategory,
    updateOrderStatus,
    updateInventory,
    addPromotion,
    togglePromotion,
    deletePromotion,
    addSeasonalCampaign,
    applyAIDoctorRecommendation,
    dismissAIDoctorRecommendation,
    approveSmartDeal,
    rejectSmartDeal,
    updateStore,
  } = useStoreData();

  const { formatPrice, currentUser } = useAuth();
  const { subSection, productId: routeProductId, navigate } = useNavigation();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (subSection === 'products' || routeProductId) return 'products';
    if (subSection === 'categories') return 'categories';
    if (subSection === 'orders') return 'orders';
    if (subSection === 'inventory') return 'inventory';
    if (subSection === 'customers') return 'customers';
    if (subSection === 'store') return 'store';
    if (subSection === 'marketing') return 'marketing';
    if (subSection === 'analytics') return 'analytics';
    if (subSection === 'ai') return 'ai';
    if (subSection === 'settings') return 'settings';
    return 'overview';
  });

  // Current Store (Apex Tech & Living)
  const currentStore = stores.find((s) => s.ownerId === currentUser.id) || stores[0];

  // ====================== PRODUCT FORM STATE ======================
  const [isProductModalOpen, setIsProductModalOpen] = useState(subSection === 'new');
  const [editingProductId, setEditingProductId] = useState<string | null>(routeProductId && routeProductId !== 'new' ? routeProductId : null);

  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('electronics');
  const [prodSubcategory, setProdSubcategory] = useState('Audio');
  const [prodBrand, setProdBrand] = useState('Apex Elite');
  const [prodSku, setProdSku] = useState(`FX-${Math.floor(100000 + Math.random() * 900000)}`);
  const [prodDescription, setProdDescription] = useState('');
  const [prodSellingPrice, setProdSellingPrice] = useState<number>(25000);
  const [prodCostPrice, setProdCostPrice] = useState<number>(15000);
  const [prodComparePrice, setProdComparePrice] = useState<number>(35000);
  const [prodStock, setProdStock] = useState<number>(50);
  const [prodLowThreshold, setProdLowThreshold] = useState<number>(10);
  const [prodImages, setProdImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80&auto=format&fit=crop',
  ]);
  const [prodVariants, setProdVariants] = useState<string[]>(['Black', 'Silver', 'Midnight Blue']);
  const [prodTags, setProdTags] = useState('audio, wireless, studio');
  const [prodBadge, setProdBadge] = useState('Best Seller');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-calculated profit and profit margin
  const calculatedProfit = Math.max(0, prodSellingPrice - prodCostPrice);
  const calculatedMargin =
    prodSellingPrice > 0 ? Math.round((calculatedProfit / prodSellingPrice) * 100) : 0;

  // Handle image upload from computer via FileReader (base64 Data URLs)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const resultStr = event.target.result as string;
          setProdImages((prev) => [...prev, resultStr]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setProdImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const setAsFeaturedImage = (index: number) => {
    if (index === 0) return;
    setProdImages((prev) => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
  };

  const openNewProductForm = () => {
    setEditingProductId(null);
    setProdName('');
    setProdCategory('electronics');
    setProdSubcategory('Audio');
    setProdBrand('Apex Elite');
    setProdSku(`FX-${Math.floor(100000 + Math.random() * 900000)}`);
    setProdDescription('High quality verified merchant product with warranty.');
    setProdSellingPrice(25000);
    setProdCostPrice(15000);
    setProdComparePrice(35000);
    setProdStock(50);
    setProdLowThreshold(10);
    setProdImages([
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80&auto=format&fit=crop',
    ]);
    setProdVariants(['Black', 'Silver']);
    setProdTags('verified, merchant-original');
    setProdBadge('New');
    setIsProductModalOpen(true);
  };

  const openEditProductForm = (p: Product) => {
    setEditingProductId(p.id);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdSubcategory(p.subcategory || 'General');
    setProdBrand(p.brand || 'Apex Elite');
    setProdSku(p.sku || `FX-${p.id.slice(-6)}`);
    setProdDescription(p.description || '');
    setProdSellingPrice(p.price);
    setProdCostPrice(p.cost_price || Math.round(p.price * 0.6));
    setProdComparePrice(p.original_price || Math.round(p.price * 1.3));
    setProdStock(p.stock !== undefined ? p.stock : 30);
    setProdLowThreshold(p.low_stock_threshold || 10);
    setProdImages(p.images && p.images.length > 0 ? p.images : []);
    setProdVariants(
      p.variants && p.variants[0]?.options ? p.variants[0].options : ['Default']
    );
    setProdTags(p.tags ? p.tags.join(', ') : 'merchant');
    setProdBadge(p.badge || 'Popular');
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    const variantItems: ProductVariantItem[] = prodVariants.map((v, i) => ({
      id: `var_${i}`,
      name: v,
      sku: `${prodSku}-${v.toUpperCase().replace(/\s+/g, '')}`,
      price: prodSellingPrice,
      stock: Math.round(prodStock / (prodVariants.length || 1)),
    }));

    if (editingProductId) {
      updateProduct(editingProductId, {
        name: prodName,
        category: prodCategory,
        subcategory: prodSubcategory,
        brand: prodBrand,
        sku: prodSku,
        description: prodDescription,
        price: Number(prodSellingPrice),
        cost_price: Number(prodCostPrice),
        original_price: Number(prodComparePrice),
        stock: Number(prodStock),
        low_stock_threshold: Number(prodLowThreshold),
        images: prodImages.length > 0 ? prodImages : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop'],
        variants: [{ name: 'Option', options: prodVariants }],
        variant_items: variantItems,
        tags: prodTags.split(',').map((t) => t.trim()).filter(Boolean),
        badge: prodBadge,
      });
    } else {
      addProduct({
        name: prodName,
        category: prodCategory,
        subcategory: prodSubcategory,
        brand: prodBrand,
        sku: prodSku,
        description: prodDescription,
        price: Number(prodSellingPrice),
        cost_price: Number(prodCostPrice),
        original_price: Number(prodComparePrice),
        stock: Number(prodStock),
        low_stock_threshold: Number(prodLowThreshold),
        images: prodImages.length > 0 ? prodImages : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop'],
        variants: [{ name: 'Option', options: prodVariants }],
        variant_items: variantItems,
        tags: prodTags.split(',').map((t) => t.trim()).filter(Boolean),
        badge: prodBadge,
        status: 'published',
      });
    }

    setIsProductModalOpen(false);
  };

  // Product List Filters & Search
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(productSearch.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()));
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  // Calculate High-level Dashboard Statistics
  const totalSalesRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrdersCount = orders.length;
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalSalesRevenue / totalOrdersCount) : 0;
  const lowStockProducts = products.filter((p) => (p.stock || 0) <= (p.low_stock_threshold || 10));

  // ====================== CATEGORY MODAL STATE ======================
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatSubcats, setNewCatSubcats] = useState('Standard, Premium, Accessories');

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName,
      description: newCatDesc,
      subcategories: newCatSubcats.split(',').map((s) => s.trim()).filter(Boolean),
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
    });
    setNewCatName('');
    setNewCatDesc('');
    setIsCategoryModalOpen(false);
  };

  // ====================== PROMOTION MODAL STATE ======================
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoName, setPromoName] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(15);
  const [promoMinSpend, setPromoMinSpend] = useState(20000);

  const handleCreatePromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    addPromotion({
      name: promoName || `${promoDiscount}% Discount Promo`,
      code: promoCode.toUpperCase().trim(),
      value: Number(promoDiscount),
      minSpend: Number(promoMinSpend),
      type: 'percentage',
    });
    setPromoCode('');
    setPromoName('');
    setIsPromoModalOpen(false);
  };

  // Store Customization Form State
  const [storeNameInput, setStoreNameInput] = useState(currentStore.name);
  const [storeDescInput, setStoreDescInput] = useState(currentStore.description);
  const [storeColorInput, setStoreColorInput] = useState(currentStore.primaryColor || '#7c3aed');
  const [storeThemeInput, setStoreThemeInput] = useState<'modern' | 'vibrant' | 'minimal' | 'luxe'>(
    currentStore.theme || 'modern'
  );
  const [storeSaveSuccess, setStoreSaveSuccess] = useState(false);

  const handleSaveStoreCustomization = (e: React.FormEvent) => {
    e.preventDefault();
    updateStore(currentStore.id, {
      name: storeNameInput,
      description: storeDescInput,
      primaryColor: storeColorInput,
      theme: storeThemeInput,
    });
    setStoreSaveSuccess(true);
    setTimeout(() => setStoreSaveSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-900">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        {/* Store Brand Banner */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate">{currentStore.name}</h2>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Merchant Live</span>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[
            { id: 'overview', label: 'Dashboard', icon: BarChart3 },
            { id: 'products', label: 'Products', icon: Package, badge: products.length },
            { id: 'categories', label: 'Categories', icon: Layers, badge: categories.length },
            { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: orders.length },
            { id: 'inventory', label: 'Inventory', icon: Boxes, alert: lowStockProducts.length },
            { id: 'customers', label: 'Customers', icon: Users, badge: customers.length },
            { id: 'store', label: 'Store Customizer', icon: Palette },
            { id: 'marketing', label: 'Marketing & Promos', icon: Tag },
            { id: 'analytics', label: 'Analytics & Funnel', icon: TrendingUp },
            { id: 'ai', label: 'Fibrex AI Intelligence', icon: Sparkles, highlight: true },
            { id: 'settings', label: 'Store Settings', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  navigate(`/dashboard/${item.id !== 'overview' ? item.id : ''}`);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm'
                    : item.highlight
                    ? 'bg-purple-950/50 text-purple-300 border border-purple-800/40 hover:bg-purple-900/60'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${item.highlight && !isActive ? 'text-yellow-400' : ''}`} />
                  <span>{item.label}</span>
                </div>
                {item.alert !== undefined && item.alert > 0 && (
                  <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded-full text-[10px]">
                    {item.alert} low
                  </span>
                )}
                {item.badge !== undefined && !item.alert && (
                  <span className="text-[10px] opacity-70 bg-slate-800 px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="text-[9px] bg-yellow-400 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase">
                    AI Doctor
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin Two Settings Links */}
        <div className="p-3 border-t border-slate-800 space-y-1.5">
          <button
            onClick={() => navigate('/admin')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-purple-900 text-purple-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <span>Platform Admin Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <span>View Customer Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl">
        {/* ========================================================================= */}
        {/* 1. OVERVIEW TAB */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Merchant Dashboard</h1>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Real-time sales, order fulfillment, stock health & AI intelligence for {currentStore.name}.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={openNewProductForm}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className="bg-slate-900 hover:bg-slate-800 text-yellow-300 text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span>Run AI Doctor</span>
                </button>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Sales</span>
                  <DollarSign className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-xl md:text-2xl font-black text-slate-900">
                  {formatPrice(totalSalesRevenue)}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+18.4% this month</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl md:text-2xl font-black text-slate-900">
                  {totalOrdersCount} orders
                </div>
                <div className="text-[11px] text-slate-500 mt-1.5">
                  {orders.filter((o) => o.status === 'Processing' || o.status === 'Pending').length} awaiting fulfillment
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Average Order (AOV)</span>
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl md:text-2xl font-black text-slate-900">
                  {formatPrice(averageOrderValue)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1.5">
                  Across {customers.length} verified buyers
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Store Health</span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-1.5">
                  <span>88</span>
                  <span className="text-sm font-normal text-slate-400">/ 100</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>AI Doctor: Good standing</span>
                </div>
              </div>
            </div>

            {/* AI Doctor Top Alert Banner */}
            {aiDoctorRecommendations.filter((r) => r.status === 'pending').length > 0 && (
              <div className="bg-linear-to-r from-purple-900 to-indigo-900 text-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-purple-800/80 text-yellow-300 shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-yellow-300">
                      Fibrex AI Store Doctor Recommendation
                    </div>
                    <div className="font-bold text-sm md:text-base mt-0.5">
                      {aiDoctorRecommendations.find((r) => r.status === 'pending')?.title}
                    </div>
                    <p className="text-xs text-purple-200 mt-1 max-w-2xl">
                      {aiDoctorRecommendations.find((r) => r.status === 'pending')?.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const firstRec = aiDoctorRecommendations.find((r) => r.status === 'pending');
                      if (firstRec) applyAIDoctorRecommendation(firstRec.id);
                    }}
                    className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Apply Fix
                  </button>
                  <button
                    onClick={() => setActiveTab('ai')}
                    className="bg-purple-800/60 hover:bg-purple-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Review All
                  </button>
                </div>
              </div>
            )}

            {/* Two Column Grid: Recent Orders & Low Stock Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-purple-600" />
                      <span>Recent Store Orders</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-purple-600 hover:underline font-bold"
                    >
                      View all orders
                    </button>
                  </div>

                  <div className="space-y-3">
                    {orders.slice(0, 4).map((ord) => (
                      <div
                        key={ord.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{ord.id}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                ord.status === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.status === 'Shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 truncate">
                            {ord.customerName} · {ord.items.length} items
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-black text-xs text-slate-900">{formatPrice(ord.total)}</div>
                          <div className="text-[10px] text-slate-400">{ord.paymentMethod}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 text-center">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700"
                  >
                    Manage order fulfillment & shipping →
                  </button>
                </div>
              </div>

              {/* Low Stock Alerts & Best Sellers */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>Inventory & Restock Radar</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('inventory')}
                      className="text-xs text-purple-600 hover:underline font-bold"
                    >
                      View all inventory
                    </button>
                  </div>

                  {lowStockProducts.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs font-semibold">All inventory levels are healthy!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lowStockProducts.slice(0, 4).map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-200/70"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-slate-900 truncate">{p.name}</div>
                              <div className="text-[11px] text-amber-800 font-semibold">
                                Only {p.stock} units remaining (Threshold: {p.low_stock_threshold || 10})
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => updateInventory(p.id, (p.stock || 0) + 50)}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-2.5 py-1.5 rounded-lg shrink-0 transition-colors cursor-pointer"
                          >
                            +50 Units
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>Total Active Catalog: {products.length} Products</span>
                  <button
                    onClick={openNewProductForm}
                    className="text-purple-600 hover:underline font-bold"
                  >
                    + Add New Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. PRODUCTS TAB (With Manual Creation & Real Image Upload) */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Product Management</h1>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Add, edit, upload product photos, configure variants, and set prices for your verified products.
                </p>
              </div>
              <button
                onClick={openNewProductForm}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3 justify-between">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by name, brand, SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-600 bg-slate-50 focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-purple-600 font-medium"
                >
                  <option value="all">All Categories ({products.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">SKU / Category</th>
                      <th className="p-3.5">Price / Cost</th>
                      <th className="p-3.5">Profit Margin</th>
                      <th className="p-3.5">Stock Status</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.slice(0, 30).map((prod) => {
                      const cost = prod.cost_price || Math.round(prod.price * 0.65);
                      const profit = prod.price - cost;
                      const margin = Math.round((profit / prod.price) * 100);
                      const isLow = (prod.stock || 0) <= (prod.low_stock_threshold || 10);

                      return (
                        <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                className="w-11 h-11 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                              />
                              <div className="min-w-0 max-w-xs">
                                <div className="font-bold text-slate-900 truncate">{prod.name}</div>
                                <div className="text-[11px] text-slate-400">
                                  {prod.brand || 'Apex Store'} · {prod.images.length} images
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-mono text-slate-600">{prod.sku || `FX-${prod.id.slice(-6)}`}</div>
                            <div className="text-slate-400 capitalize">{prod.category}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{formatPrice(prod.price)}</div>
                            <div className="text-[11px] text-slate-400">Cost: {formatPrice(cost)}</div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              {margin}% ({formatPrice(profit)})
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`font-semibold text-[11px] px-2 py-0.5 rounded-full ${
                                isLow
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {prod.stock || 0} units
                            </span>
                          </td>
                          <td className="p-3.5">
                            <button
                              onClick={() => publishProduct(prod.id, prod.status === 'draft')}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                prod.status !== 'draft'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {prod.status !== 'draft' ? 'Published' : 'Draft'}
                            </button>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditProductForm(prod)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => duplicateProduct(prod.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Duplicate Product"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteProduct(prod.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>Showing {Math.min(30, filteredProducts.length)} of {filteredProducts.length} products</span>
                <span className="font-semibold">All products stored & managed natively in Fibrex Store</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. CATEGORIES TAB */}
        {/* ========================================================================= */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Store Categories</h1>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Organize your merchant catalog into dynamic, customer-friendly shopping categories & subcategories.
                </p>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative h-32 bg-slate-100 overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent flex items-end p-3.5">
                      <h3 className="text-white font-black text-base">{cat.name}</h3>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-slate-500 mb-3">{cat.description || 'Verified product category.'}</p>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Subcategories ({cat.subcategories?.length || 0})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {cat.subcategories?.slice(0, 6).map((sub) => (
                          <span
                            key={sub}
                            className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {products.filter((p) => p.category === cat.slug).length} Products
                      </span>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. ORDERS TAB */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Orders & Fulfillment</h1>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Process orders, update fulfillment statuses, and dispatch shipments with courier tracking codes.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-black text-slate-900">{ord.id}</span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'Shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        Payment: {ord.paymentStatus}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      Placed: {new Date(ord.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Customer info */}
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                        Customer & Delivery
                      </div>
                      <div className="font-bold text-slate-900">{ord.customerName}</div>
                      <div className="text-slate-500">{ord.customerEmail}</div>
                      <div className="text-slate-500">{ord.customerPhone}</div>
                      <div className="text-slate-600 mt-1 font-medium">
                        {ord.shippingAddress.address}, {ord.shippingAddress.city}, {ord.shippingAddress.state}
                      </div>
                    </div>

                    {/* Ordered Items */}
                    <div className="bg-slate-50 p-3 rounded-xl md:col-span-2">
                      <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2">
                        Items in Order ({ord.items.length})
                      </div>
                      <div className="space-y-2">
                        {ord.items.map((item) => (
                          <div key={item.key} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-8 h-8 rounded object-cover"
                                />
                              )}
                              <div>
                                <span className="font-semibold text-slate-900">{item.name}</span>
                                <span className="text-slate-400 ml-1.5">x{item.qty}</span>
                              </div>
                            </div>
                            <span className="font-bold text-slate-800">{formatPrice(item.price * item.qty)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-slate-200 mt-3 pt-2 flex items-center justify-between font-black text-slate-900 text-sm">
                        <span>Total Paid</span>
                        <span className="text-purple-600">{formatPrice(ord.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status update actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-600">Tracking Code:</span>
                      <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        {ord.trackingNumber || 'Unassigned'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Update Status:</span>
                      {(['Processing', 'Shipped', 'Delivered'] as OrderStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => updateOrderStatus(ord.id, st)}
                          className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                            ord.status === st
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. INVENTORY TAB */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Inventory & Stock Levels</h1>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Track warehouse inventory, reorder thresholds, and prevent out-of-stock losses.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">SKU</th>
                    <th className="p-3.5">Current Stock</th>
                    <th className="p-3.5">Threshold</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Quick Stock Adjustment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.slice(0, 25).map((p) => {
                    const isLow = (p.stock || 0) <= (p.low_stock_threshold || 10);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <span className="truncate max-w-xs">{p.name}</span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-500">{p.sku || `FX-${p.id.slice(-6)}`}</td>
                        <td className="p-3.5 font-black text-sm text-slate-900">{p.stock || 0} units</td>
                        <td className="p-3.5 text-slate-500">{p.low_stock_threshold || 10} units</td>
                        <td className="p-3.5">
                          <span
                            className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
                              (p.stock || 0) === 0
                                ? 'bg-red-100 text-red-800'
                                : isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {(p.stock || 0) === 0 ? 'Out of Stock' : isLow ? 'Low Stock Alert' : 'In Stock'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => updateInventory(p.id, Math.max(0, (p.stock || 0) - 10))}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded font-bold text-slate-700"
                            >
                              -10
                            </button>
                            <button
                              onClick={() => updateInventory(p.id, (p.stock || 0) + 10)}
                              className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded font-bold"
                            >
                              +10
                            </button>
                            <button
                              onClick={() => updateInventory(p.id, (p.stock || 0) + 50)}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold"
                            >
                              +50 Restock
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. CUSTOMERS CRM TAB */}
        {/* ========================================================================= */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Customer Relationship Manager (CRM)</h1>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Verified customer directory, purchase histories, and buyer notes.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customers.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-black flex items-center justify-center text-sm">
                        {c.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                        {c.totalOrders} Orders Placed
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">{c.email}</div>
                    <div className="text-xs text-slate-500">{c.phone}</div>
                    <div className="text-xs text-slate-600 mt-1 font-medium">{c.city}, {c.state}</div>

                    {c.notes && (
                      <div className="mt-3 p-2 bg-amber-50 border border-amber-100 rounded-lg text-[11px] text-amber-900">
                        {c.notes}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Lifetime Value:</span>
                    <span className="font-black text-purple-700 text-sm">{formatPrice(c.totalSpent)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 7. STORE CUSTOMIZER & THEMES */}
        {/* ========================================================================= */}
        {activeTab === 'store' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Store Customizer & Themes</h1>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Customize your brand identity, accent colors, banners, and storefront themes with live preview.
                </p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>Preview Marketplace</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Settings Form */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <form onSubmit={handleSaveStoreCustomization} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={storeNameInput}
                      onChange={(e) => setStoreNameInput(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Store Bio / Tagline
                    </label>
                    <textarea
                      rows={3}
                      value={storeDescInput}
                      onChange={(e) => setStoreDescInput(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Theme Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Storefront Theme
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: 'modern', label: 'Modern Clean', color: 'bg-purple-600' },
                        { id: 'vibrant', label: 'Vibrant Pulse', color: 'bg-rose-600' },
                        { id: 'minimal', label: 'Nordic Minimal', color: 'bg-slate-900' },
                        { id: 'luxe', label: 'Luxe Emerald', color: 'bg-emerald-600' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setStoreThemeInput(t.id as any)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            storeThemeInput === t.id
                              ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className={`w-full h-3 rounded-full mb-2 ${t.color}`}></div>
                          <div className="font-bold text-xs text-slate-900">{t.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary Color */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Primary Accent Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={storeColorInput}
                        onChange={(e) => setStoreColorInput(e.target.value)}
                        className="w-10 h-10 rounded-xl border border-slate-200 p-0.5 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={storeColorInput}
                        onChange={(e) => setStoreColorInput(e.target.value)}
                        className="px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl uppercase"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      Save Customizations
                    </button>
                    {storeSaveSuccess && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Saved successfully!</span>
                      </span>
                    )}
                  </div>
                </form>
              </div>

              {/* Live Preview Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-3 uppercase tracking-wider text-slate-400">
                    Live Store Card Preview
                  </h3>
                  <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
                    <div
                      className="h-24 flex items-center justify-center text-white font-black"
                      style={{ backgroundColor: storeColorInput }}
                    >
                      <Store className="w-8 h-8" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-black text-slate-900 text-base">{storeNameInput}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{storeDescInput}</p>
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-600 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{products.length} Products in catalog</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4 text-xs text-slate-400">
                  Changes reflect instantly on your storefront.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 8. MARKETING & PROMOTIONS TAB */}
        {/* ========================================================================= */}
        {activeTab === 'marketing' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Marketing & Promotions</h1>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Launch discount promo codes, seasonal sales campaigns, flash deals, and product bundles.
                </p>
              </div>
              <button
                onClick={() => setIsPromoModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Promo Code</span>
              </button>
            </div>

            {/* Active Promo Codes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {promotions.map((promo) => (
                <div
                  key={promo.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-black text-lg text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                        {promo.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          promo.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {promo.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mt-2">{promo.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {promo.value}% OFF on orders over {formatPrice(promo.minSpend || 0)}
                    </p>
                    <div className="text-[11px] text-slate-400 mt-2">
                      Redeemed {promo.usageCount} times by shoppers
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                    <button
                      onClick={() => togglePromotion(promo.id)}
                      className="text-xs font-semibold text-purple-600 hover:underline cursor-pointer"
                    >
                      {promo.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deletePromotion(promo.id)}
                      className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Seasonal Campaigns Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-600" />
                <span>Configured Seasonal Campaigns</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {seasonalCampaigns.map((camp) => (
                  <div
                    key={camp.id}
                    className="p-4 rounded-xl bg-linear-to-br from-slate-900 to-slate-800 text-white flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-purple-600 px-2 py-0.5 rounded">
                          {camp.themeType.replace('_', ' ')}
                        </span>
                        <span className="text-yellow-400 font-bold text-xs">{camp.discountPercent}% OFF</span>
                      </div>
                      <h4 className="font-bold text-sm text-white mt-1">{camp.name}</h4>
                      <p className="text-xs text-slate-300 mt-1">{camp.bannerSubtitle}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-700 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>{camp.eligibleProductCount} Products Eligible</span>
                      <span className="text-emerald-400 font-bold capitalize">{camp.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 9. ANALYTICS & SALES FUNNEL TAB */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Analytics & Sales Funnel</h1>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Deep customer drop-off funnel, average order value, conversion rates, and revenue margins.
                </p>
              </div>
            </div>

            {/* Visual Sales Funnel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-base font-black text-slate-900">Store Conversion Funnel</h2>
              <div className="space-y-3">
                {[
                  { step: '1. Store Visitors', count: '14,280', pct: 100, color: 'bg-purple-600' },
                  { step: '2. Product Detail Views', count: '8,920', pct: 62.5, color: 'bg-purple-500' },
                  { step: '3. Added to Cart', count: '2,450', pct: 27.5, color: 'bg-indigo-500' },
                  { step: '4. Initiated Checkout', count: '940', pct: 10.5, color: 'bg-blue-500' },
                  { step: '5. Completed Purchase', count: `${orders.length * 40}`, pct: 4.8, color: 'bg-emerald-500' },
                ].map((funnel) => (
                  <div key={funnel.step} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>{funnel.step}</span>
                      <span>{funnel.count} ({funnel.pct}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${funnel.color}`}
                        style={{ width: `${funnel.pct}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Gross Merchandise Volume</div>
                <div className="text-2xl font-black text-slate-900">{formatPrice(totalSalesRevenue)}</div>
                <div className="text-xs text-emerald-600 font-semibold mt-1">Verified merchant revenue</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Total Verified Sold Units</div>
                <div className="text-2xl font-black text-slate-900">
                  {products.reduce((s, p) => s + (p.sold_count || 0), 0).toLocaleString()} units
                </div>
                <div className="text-xs text-slate-500 mt-1">Across all product variants</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Average Profit Margin</div>
                <div className="text-2xl font-black text-slate-900">38.4%</div>
                <div className="text-xs text-emerald-600 font-semibold mt-1">Healthy merchant margins</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 10. AI STORE INTELLIGENCE TAB (Store Doctor + Smart Deals + Radar) */}
        {/* ========================================================================= */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="bg-linear-to-r from-slate-950 via-purple-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-purple-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-yellow-300 font-black text-xs uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>Fibrex AI Store Intelligence Suite</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white">Fibrex AI Store Doctor</h1>
                  <p className="text-xs md:text-sm text-purple-200 mt-1 max-w-xl">
                    Automated audit on product descriptions, pricing completeness, inventory turnover, and conversion gaps.
                  </p>
                </div>

                <div className="bg-purple-900/60 border border-purple-500/40 p-4 rounded-2xl text-center shrink-0">
                  <div className="text-xs font-bold text-purple-300">Store Health Score</div>
                  <div className="text-3xl font-black text-yellow-300">88 / 100</div>
                  <div className="text-[10px] text-emerald-400 font-bold mt-0.5">Top 15% of Merchants</div>
                </div>
              </div>
            </div>

            {/* 1. AI Store Doctor Recommendations */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                <span>AI Store Doctor Recommendations</span>
              </h2>

              <div className="space-y-3">
                {aiDoctorRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className={`p-4 rounded-xl border transition-all ${
                      rec.status === 'applied'
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : rec.status === 'dismissed'
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                              rec.severity === 'high'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {rec.category}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{rec.title}</span>
                        </div>
                        <p className="text-xs text-slate-600">{rec.description}</p>
                        <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Estimated Impact: {rec.impact}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {rec.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => applyAIDoctorRecommendation(rec.id)}
                              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              {rec.actionText}
                            </button>
                            <button
                              onClick={() => dismissAIDoctorRecommendation(rec.id)}
                              className="text-xs text-slate-400 hover:text-slate-600 font-semibold px-2 py-1 cursor-pointer"
                            >
                              Dismiss
                            </button>
                          </>
                        ) : rec.status === 'applied' ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Applied to Store</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Dismissed</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Fibrex Smart Deal Engine */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                <span>Fibrex Smart Deal Engine</span>
              </h2>
              <p className="text-xs text-slate-500">
                AI analyzes your store data and identifies products suitable for flash promotions or bundles.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {smartDealOpportunities.map((deal) => (
                  <div
                    key={deal.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                          {deal.salesVelocity}
                        </span>
                        <span className="font-bold text-xs text-rose-600">
                          {deal.suggestedDiscount}% Suggested Promo
                        </span>
                      </div>
                      <h4 className="font-bold text-xs md:text-sm text-slate-900 line-clamp-2">{deal.productName}</h4>
                      <p className="text-xs text-slate-600 mt-1.5">{deal.reason}</p>
                      <div className="text-[11px] text-slate-500 mt-2">
                        Stock: {deal.currentStock} units · Current Price: {formatPrice(deal.currentPrice)}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 mt-3 flex items-center justify-between">
                      {deal.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => approveSmartDeal(deal.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                          >
                            Approve Promo
                          </button>
                          <button
                            onClick={() => rejectSmartDeal(deal.id)}
                            className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 capitalize">
                          Status: {deal.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Fibrex Product Opportunity Radar */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <span>Fibrex Product Opportunity Radar</span>
              </h2>
              <p className="text-xs text-slate-500">
                Discovers untapped product demand based on actual search queries, product views, and category gaps in your store.
              </p>

              <div className="space-y-3">
                {opportunityRadar.map((opp) => (
                  <div key={opp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                          {opp.opportunityLevel} Opportunity
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{opp.category}</h4>
                      </div>
                      <span className="text-xs font-bold text-slate-500">
                        {opp.searchDemandCount.toLocaleString()} Monthly Shopper Searches
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-2">{opp.insight}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {opp.suggestedActions.map((act) => (
                        <span
                          key={act}
                          className="text-[11px] font-medium bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-lg"
                        >
                          💡 {act}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 11. SETTINGS TAB */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h1 className="text-2xl font-black text-slate-900">Store Settings & Preferences</h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Configure your store location, time zone, multi-currency settings, and order notification endpoints.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Store Identifier</span>
                  <div className="font-bold text-sm text-slate-900">{currentStore.id}</div>
                  <div className="text-slate-500">Owner: {currentUser.name} ({currentUser.email})</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Store URL & Slug</span>
                  <div className="font-bold text-sm text-purple-700">fibrex.store/{currentStore.urlSlug}</div>
                  <div className="text-slate-500">Country: {currentStore.country} · Timezone: {currentStore.timezone}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* PRODUCT MODAL (MANUAL ADD / EDIT WITH REAL IMAGE UPLOADS) */}
      {/* ========================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-lg">
                  {editingProductId ? 'Edit Merchant Product' : 'Add New Merchant Product'}
                </h3>
                <p className="text-xs text-slate-500">
                  Fill in product details, upload real images, and set profit margins.
                </p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveProduct} className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
              {/* Basic Information */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-1">
                  1. Basic Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Studio Over-Ear Wireless Headphones"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="w-full px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Brand Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Audio"
                      value={prodBrand}
                      onChange={(e) => setProdBrand(e.target.value)}
                      className="w-full px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category *</label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-600 bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subcategory</label>
                    <input
                      type="text"
                      placeholder="e.g. Audio, Wireless, Accessories"
                      value={prodSubcategory}
                      onChange={(e) => setProdSubcategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Enter detailed specifications, warranty information, and package contents..."
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Product Images Upload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <h4 className="font-black text-slate-900 text-sm">
                    2. Product Pictures (Upload Real Images)
                  </h4>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer hover:bg-purple-600 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload from Device</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {prodImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className={`relative group rounded-xl border overflow-hidden aspect-square bg-slate-100 ${
                        idx === 0 ? 'border-purple-600 ring-2 ring-purple-500/30' : 'border-slate-200'
                      }`}
                    >
                      <img src={imgUrl} alt="Product" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-purple-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                          Featured
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => setAsFeaturedImage(idx)}
                            className="bg-white/90 text-slate-900 p-1 rounded hover:bg-white text-[10px] font-bold"
                            title="Set as Main Image"
                          >
                            Main
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                          title="Delete Image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-xl aspect-square flex flex-col items-center justify-center text-slate-400 hover:border-purple-600 hover:text-purple-600 transition-colors cursor-pointer"
                  >
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold">Add Photo</span>
                  </button>
                </div>
              </div>

              {/* Pricing & Automatic Profit Calculation */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-1">
                  3. Pricing & Margin Calculation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Selling Price (₦) *</label>
                    <input
                      required
                      type="number"
                      value={prodSellingPrice}
                      onChange={(e) => setProdSellingPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-600 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cost Price (₦)</label>
                    <input
                      type="number"
                      value={prodCostPrice}
                      onChange={(e) => setProdCostPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Compare-At Price (₦)</label>
                    <input
                      type="number"
                      value={prodComparePrice}
                      onChange={(e) => setProdComparePrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-600 text-slate-500"
                    />
                  </div>
                </div>

                {/* Automatic Profit Breakdown Banner */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-emerald-900">
                      Calculated Unit Profit: ₦{calculatedProfit.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      Selling Price (₦{prodSellingPrice.toLocaleString()}) − Cost Price (₦{prodCostPrice.toLocaleString()})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-emerald-700 text-base">{calculatedMargin}%</div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-800">
                      Profit Margin
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory & Stock */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-1">
                  4. Inventory & SKUs
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">SKU</label>
                    <input
                      type="text"
                      value={prodSku}
                      onChange={(e) => setProdSku(e.target.value)}
                      className="w-full px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      value={prodStock}
                      onChange={(e) => setProdStock(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-600 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Low-Stock Alert Threshold</label>
                    <input
                      type="number"
                      value={prodLowThreshold}
                      onChange={(e) => setProdLowThreshold(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-600"
                    />
                  </div>
                </div>
              </div>

              {/* Variants & Tags */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-1">
                  5. Variants & Product Badge
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Options (Color/Size/Storage, comma separated)
                    </label>
                    <input
                      type="text"
                      value={prodVariants.join(', ')}
                      onChange={(e) =>
                        setProdVariants(
                          e.target.value.split(',').map((v) => v.trim()).filter(Boolean)
                        )
                      }
                      className="w-full px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Product Badge</label>
                    <select
                      value={prodBadge}
                      onChange={(e) => setProdBadge(e.target.value)}
                      className="w-full px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-600 bg-white"
                    >
                      <option value="New">New Arrival</option>
                      <option value="Best Seller">Best Seller</option>
                      <option value="Popular">Popular</option>
                      <option value="Flash Sale">Flash Sale</option>
                      <option value="Limited Stock">Limited Stock</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors cursor-pointer shadow-xs"
                >
                  {editingProductId ? 'Save Product Changes' : 'Publish Product to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CATEGORY MODAL */}
      {/* ========================================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-200 animate-fade-in text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base">Create Store Category</h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Smart Home & Lighting"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-purple-600 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. High quality smart living devices."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-purple-600 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Subcategories (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bulbs, Switches, Security"
                  value={newCatSubcats}
                  onChange={(e) => setNewCatSubcats(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-purple-600 text-sm"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROMOTION MODAL */}
      {/* ========================================================================= */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-200 animate-fade-in text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base">Create Discount Coupon</h3>
              <button
                onClick={() => setIsPromoModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePromotion} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Promo Code *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. MEGA30"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-purple-600 font-mono uppercase font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Promotion Name</label>
                <input
                  type="text"
                  placeholder="e.g. Weekend Flash Sale"
                  value={promoName}
                  onChange={(e) => setPromoName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-purple-600 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    value={promoDiscount}
                    onChange={(e) => setPromoDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-purple-600 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Spend (₦)</label>
                  <input
                    type="number"
                    value={promoMinSpend}
                    onChange={(e) => setPromoMinSpend(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-purple-600 text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  Activate Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
