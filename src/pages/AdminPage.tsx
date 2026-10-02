import React, { useState } from 'react';
import {
  ShieldCheck,
  Store,
  Users,
  Package,
  ShoppingBag,
  Layers,
  Boxes,
  Tag,
  TrendingUp,
  Settings,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Globe,
  BarChart3,
  Filter,
} from 'lucide-react';
import { useStoreData } from '../context/StoreDataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { DEMO_USERS } from '../context/AuthContext';
import { Product, Category, Store as StoreType } from '../types';

export const AdminPage: React.FC = () => {
  const {
    products,
    stores,
    categories,
    orders,
    customers,
    promotions,
    deleteProduct,
    duplicateProduct,
    publishProduct,
    updateOrderStatus,
    createStore,
    updateStore,
  } = useStoreData();

  const { formatPrice } = useAuth();
  const { subSection, navigate } = useNavigation();

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (['users', 'stores', 'products', 'orders', 'categories', 'inventory', 'promotions', 'analytics', 'reports', 'settings'].includes(subSection || '')) {
      return subSection || 'overview';
    }
    return 'overview';
  });

  const [productSearch, setProductSearch] = useState('');
  const [storeSearch, setStoreSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Total GMV
  const totalPlatformGMV = orders.reduce((sum, o) => sum + (o.total || 0), 0) + 1250000;
  const totalStoreOwnersCount = stores.length;
  const totalCustomersCount = customers.length + 1840;
  const totalProductsCount = products.length;
  const totalOrdersCount = orders.length + 420;

  // New Store Modal
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreCategory, setNewStoreCategory] = useState('Electronics & Lifestyle');
  const [newStoreCountry, setNewStoreCountry] = useState('Nigeria');

  const handleCreateNewStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;
    createStore({
      name: newStoreName,
      category: newStoreCategory,
      country: newStoreCountry,
      description: 'Verified merchant selling genuine items.',
    });
    setNewStoreName('');
    setIsStoreModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-900">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        {/* Brand Banner */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Platform Admin</h2>
            <div className="text-[11px] text-amber-400 font-semibold">Ecosystem Master Control</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'stores', label: 'Merchant Stores', icon: Store, badge: stores.length },
            { id: 'users', label: 'Users & Roles', icon: Users, badge: '3 Roles' },
            { id: 'products', label: 'Global Products', icon: Package, badge: products.length },
            { id: 'orders', label: 'Global Orders', icon: ShoppingBag, badge: orders.length },
            { id: 'categories', label: 'Categories Catalog', icon: Layers, badge: categories.length },
            { id: 'inventory', label: 'Global Inventory', icon: Boxes },
            { id: 'promotions', label: 'Platform Promos', icon: Tag, badge: promotions.length },
            { id: 'analytics', label: 'Growth Analytics', icon: TrendingUp },
            { id: 'settings', label: 'System Settings', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  navigate(`/admin/${item.id !== 'overview' ? item.id : ''}`);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Direct Link to Store Owner Dashboard */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <span>Merchant Hub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Admin Workspace */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl">
        {/* ========================================================================= */}
        {/* OVERVIEW TAB */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Platform Ecosystem Overview</h1>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Comprehensive performance metrics across all verified merchants, customers, and active stores.
                </p>
              </div>
              <button
                onClick={() => setIsStoreModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs md:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard New Store</span>
              </button>
            </div>

            {/* Platform Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Platform GMV</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl md:text-2xl font-black text-slate-900">
                  {formatPrice(totalPlatformGMV)}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">Across all merchant stores</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active Stores</span>
                  <Store className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-xl md:text-2xl font-black text-slate-900">
                  {stores.length} Stores
                </div>
                <div className="text-[11px] text-slate-500 mt-1">{totalStoreOwnersCount} Store Owners</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Platform Catalog</span>
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl md:text-2xl font-black text-slate-900">
                  {products.length} Products
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Across {categories.length} Categories</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Shopper Base</span>
                  <Users className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-xl md:text-2xl font-black text-slate-900">
                  {totalCustomersCount.toLocaleString()} Users
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">Verified organic traffic</div>
              </div>
            </div>

            {/* Stores List Preview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Store className="w-5 h-5 text-purple-600" />
                  <span>Verified Merchant Stores</span>
                </h2>
                <button
                  onClick={() => setActiveTab('stores')}
                  className="text-xs text-purple-600 font-bold hover:underline"
                >
                  Manage all stores
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stores.map((st) => (
                  <div
                    key={st.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] text-slate-400">{st.id}</span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full capitalize">
                          {st.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{st.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{st.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 mt-3 flex items-center justify-between text-xs">
                      <span className="text-slate-500">{st.country}</span>
                      <span className="font-bold text-purple-700 capitalize">{st.theme} Theme</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STORES MANAGEMENT TAB */}
        {/* ========================================================================= */}
        {activeTab === 'stores' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h1 className="text-2xl font-black text-slate-900">All Merchant Stores</h1>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Approve, onboard, manage, or configure merchant stores across the Fibrex network.
                </p>
              </div>
              <button
                onClick={() => setIsStoreModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs md:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard New Store</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Store Details</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Country / Timezone</th>
                    <th className="p-3.5">Theme</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stores.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-sm">{st.name}</div>
                        <div className="text-slate-400 text-[11px]">Slug: fibrex.store/{st.urlSlug}</div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">{st.category}</td>
                      <td className="p-3.5 text-slate-600">{st.country} ({st.timezone})</td>
                      <td className="p-3.5 capitalize font-bold text-purple-700">{st.theme}</td>
                      <td className="p-3.5">
                        <button
                          onClick={() =>
                            updateStore(st.id, {
                              status: st.status === 'active' ? 'inactive' : 'active',
                            })
                          }
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            st.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {st.status}
                        </button>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => navigate('/dashboard')}
                          className="text-xs font-bold text-purple-600 hover:underline"
                        >
                          Open Store Dashboard
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* USERS & ROLES TAB */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h1 className="text-2xl font-black text-slate-900">User Roles & Access Control</h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Role-based access permissions enforced across Platform Admin, Store Owner, and Customer.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {Object.values(DEMO_USERS).map((u) => (
                  <div
                    key={u.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                        {u.role.replace('_', ' ')}
                      </span>
                      <span className="text-emerald-600 font-bold capitalize">● {u.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PRODUCTS & GLOBAL CATALOG TAB */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Global Product Catalog</h1>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  View, audit, publish, duplicate, or delete all merchant catalog items.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Price / Cost</th>
                    <th className="p-3.5">Inventory</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.slice(0, 20).map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                        />
                        <div>
                          <div className="font-bold text-slate-900 truncate max-w-xs">{prod.name}</div>
                          <div className="text-[11px] text-slate-400">{prod.brand || 'Verified'}</div>
                        </div>
                      </td>
                      <td className="p-3.5 capitalize font-medium text-slate-700">{prod.category}</td>
                      <td className="p-3.5 font-bold text-slate-900">{formatPrice(prod.price)}</td>
                      <td className="p-3.5 font-semibold text-slate-700">{prod.stock || 0} units</td>
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
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => duplicateProduct(prod.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(prod.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ORDERS & GLOBAL FULFILLMENT TAB */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h1 className="text-2xl font-black text-slate-900">Platform Orders & Logistics</h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Audit transactions, fulfillment velocity, and dispatch couriers.
              </p>

              <div className="mt-4 space-y-3">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900">{ord.id}</div>
                      <div className="text-slate-500 mt-0.5">
                        Customer: {ord.customerName} · Total: {formatPrice(ord.total)} · {ord.paymentMethod}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                        {ord.trackingNumber || 'Tracking Pending'}
                      </span>
                      <span
                        className={`font-bold px-2.5 py-0.5 rounded-full ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* ONBOARD NEW STORE MODAL */}
      {/* ========================================================================= */}
      {isStoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <h3 className="font-black text-slate-900 text-base">Onboard New Merchant Store</h3>
            <form onSubmit={handleCreateNewStore} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Store Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Zen Lifestyle Collective"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-purple-600 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newStoreCategory}
                  onChange={(e) => setNewStoreCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-purple-600 text-sm"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStoreModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black"
                >
                  Create Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
