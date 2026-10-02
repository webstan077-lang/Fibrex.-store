import React, { useState } from 'react';
import {
  User,
  ShoppingBag,
  MapPin,
  CreditCard,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  Globe,
  Plus,
  Trash2,
  Lock,
  ChevronRight,
  TrendingUp,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStoreData } from '../context/StoreDataContext';
import { useNavigation } from '../context/NavigationContext';
import { COUNTRIES_CURRENCIES } from '../data/countries';
import { CardBrand } from '../types';

export const AccountPage: React.FC = () => {
  const {
    currentUser,
    isAdmin,
    formatPrice,
    savedCards,
    addSavedCard,
    removeSavedCard,
    setDefaultSavedCard,
    selectedCountry,
    setSelectedCountry,
    setIsCurrencyModalOpen,
  } = useAuth();
  const { orders, promotions } = useStoreData();
  const { navigate, subSection } = useNavigation();

  const [activeTab, setActiveTab] = useState<string>(subSection || 'orders');

  // New card modal/form state inside account
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState(currentUser?.name || '');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvv, setNewCardCvv] = useState('');
  const [detectedBrand, setDetectedBrand] = useState<CardBrand>('unknown');

  const myOrders = orders;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setNewCardNumber(formatted);

    const raw = value;
    if (raw.startsWith('4')) setDetectedBrand('visa');
    else if (/^(5[1-5]|2[2-7])/.test(raw)) setDetectedBrand('mastercard');
    else if (/^(506|6500|5078|6504)/.test(raw)) setDetectedBrand('verve');
    else if (/^(34|37)/.test(raw)) setDetectedBrand('amex');
    else if (/^(6011|65|64[4-9])/.test(raw)) setDetectedBrand('discover');
    else setDetectedBrand('unknown');
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 3) {
      value = `${value.substring(0, 2)}/${value.substring(2)}`;
    }
    setNewCardExpiry(value);
  };

  const handleAddNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    const rawDigits = newCardNumber.replace(/\s+/g, '');
    if (rawDigits.length < 15 || !newCardExpiry || newCardCvv.length < 3) {
      alert('Please fill in complete and valid card information.');
      return;
    }

    addSavedCard({
      brand: detectedBrand !== 'unknown' ? detectedBrand : 'visa',
      last4: rawDigits.slice(-4),
      expMonth: newCardExpiry.split('/')[0] || '12',
      expYear: newCardExpiry.split('/')[1] || '28',
      holderName: newCardHolder || currentUser?.name || 'Cardholder',
      isDefault: savedCards.length === 0,
      colorScheme: 'from-slate-900 to-slate-800',
    });

    setNewCardNumber('');
    setNewCardExpiry('');
    setNewCardCvv('');
    setShowAddCardForm(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <User className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Sign In to View Your Account</h2>
          <p className="text-xs text-slate-500">
            Access your orders, saved cards, custom currency settings and delivery addresses.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Go to Storefront
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-slate-900">
      {/* Account Hero Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={
              currentUser.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`
            }
            alt={currentUser.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-purple-500 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{currentUser.name}</h1>
              <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                {currentUser.role.replace('_', ' ')}
              </span>
              {currentUser.googleLinked && (
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  Google Linked
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">{currentUser.email}</p>
          </div>
        </div>

        {/* If Admin: Quick links to the two settings */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin')}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Platform Admin Console</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Store Owner Hub</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <aside className="md:col-span-1 space-y-1">
          {[
            { id: 'orders', label: 'My Orders & Tracking', icon: ShoppingBag, count: myOrders.length },
            { id: 'cards', label: 'Saved Payment Cards', icon: CreditCard, count: savedCards.length },
            { id: 'fiscal', label: 'Country & Currency', icon: Globe },
            { id: 'promos', label: 'Discounts & Coupons', icon: Tag, count: promotions.length },
            { id: 'addresses', label: 'Delivery Addresses', icon: MapPin },
            { id: 'security', label: 'Profile & Security', icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Tab Content */}
        <main className="md:col-span-3 space-y-4">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <h2 className="text-base font-black text-slate-900">
                  Order History & Live Courier Tracking ({myOrders.length})
                </h2>
                <span className="text-xs text-slate-500">
                  Currency: <strong>{selectedCountry.currencyCode}</strong>
                </span>
              </div>

              {myOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{ord.id}</span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
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
                    <span className="text-xs text-slate-400">
                      Date: {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {ord.items.map((item) => (
                      <div key={item.key} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                            />
                          )}
                          <div>
                            <div className="font-semibold text-slate-900">{item.name}</div>
                            <div className="text-slate-400">Quantity: {item.qty}</div>
                          </div>
                        </div>
                        <span className="font-bold text-slate-800">
                          {formatPrice(item.price * item.qty)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer & Tracking */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Truck className="w-4 h-4 text-purple-600" />
                      <span>Tracking: </span>
                      <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        {ord.trackingNumber || 'DHL-94827103'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Order Total:</span>
                      <span className="font-black text-slate-900 text-sm">
                        {formatPrice(ord.total)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SAVED PAYMENT CARDS TAB */}
          {activeTab === 'cards' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Saved Payment Cards ({savedCards.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage Mastercard, Visa, Verve, Amex, and Discover cards for 1-click checkout
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCardForm(!showAddCardForm)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Card</span>
                </button>
              </div>

              {/* Add New Card Modal/Form */}
              {showAddCardForm && (
                <form
                  onSubmit={handleAddNewCard}
                  className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5 animate-fade-in"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                      Add Payment Card
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddCardForm(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Card Number *
                      </label>
                      <div className="relative">
                        <input
                          required
                          value={newCardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4242 4242 4242 4242"
                          className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg pl-3 pr-20 py-2.5 outline-none focus:border-purple-600"
                        />
                        {detectedBrand !== 'unknown' && (
                          <span className="absolute right-2.5 top-2.5 text-[10px] font-black uppercase px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                            {detectedBrand}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Cardholder Name *
                      </label>
                      <input
                        required
                        value={newCardHolder}
                        onChange={(e) => setNewCardHolder(e.target.value)}
                        placeholder="John Doe"
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:border-purple-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Expiry *
                        </label>
                        <input
                          required
                          value={newCardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:border-purple-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          CVV *
                        </label>
                        <input
                          required
                          type="password"
                          maxLength={4}
                          value={newCardCvv}
                          onChange={(e) =>
                            setNewCardCvv(e.target.value.replace(/\D/g, '').substring(0, 4))
                          }
                          placeholder="•••"
                          className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:border-purple-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCardForm(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                    >
                      Save Card
                    </button>
                  </div>
                </form>
              )}

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedCards.map((card) => (
                  <div
                    key={card.id}
                    className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-purple-950 text-white shadow-md flex flex-col justify-between h-44 border border-slate-700"
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-xs tracking-widest uppercase text-slate-300">
                        {card.brand}
                      </span>
                      {card.isDefault ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                          Default Card
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDefaultSavedCard(card.id)}
                          className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                        >
                          Set as default
                        </button>
                      )}
                    </div>

                    <div>
                      <p className="text-lg sm:text-xl font-mono tracking-widest font-bold">
                        •••• •••• •••• {card.last4}
                      </p>
                    </div>

                    <div className="flex items-end justify-between text-xs pt-2 border-t border-white/10">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Card Holder</p>
                        <p className="font-semibold">{card.holderName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Expires</p>
                        <p className="font-mono font-semibold">
                          {card.expMonth}/{card.expYear}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSavedCard(card.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete Card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FISCAL & COUNTRY CURRENCY TAB */}
          {activeTab === 'fiscal' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Fiscal & Country Currency Settings
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Browse and buy from the website in your country's local currency
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCurrencyModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Globe className="w-4 h-4" />
                  <span>Change Country Currency</span>
                </button>
              </div>

              {/* Active Country Card */}
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedCountry.flag}</span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {selectedCountry.countryName} ({selectedCountry.currencyCode})
                    </h3>
                    <p className="text-xs text-purple-700">
                      Currency Symbol: <strong>{selectedCountry.currencySymbol}</strong> • Exchange Rate against NGN: <strong>{selectedCountry.rateAgainstNGN}</strong>
                    </p>
                  </div>
                </div>
                <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                  Active Display Currency
                </span>
              </div>

              {/* Popular Currencies Quick Switch */}
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-3">
                  Quick Switch Top Country Currencies
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {COUNTRIES_CURRENCIES.slice(0, 8).map((c) => {
                    const isSelected = c.countryCode === selectedCountry.countryCode;
                    return (
                      <button
                        key={c.countryCode}
                        type="button"
                        onClick={() => setSelectedCountry(c.countryCode)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xl mb-1">{c.flag}</div>
                        <p className="font-bold text-xs text-slate-900">{c.currencyCode}</p>
                        <p className="text-[11px] text-slate-500 truncate">{c.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* PROMOTIONS TAB */}
          {activeTab === 'promos' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-base font-black text-slate-900">Available Coupons & Discounts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {promotions.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-dashed border-purple-300 bg-purple-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-purple-700 text-sm bg-white px-2.5 py-1 rounded border border-purple-200">
                          {p.code}
                        </span>
                        <span className="text-xs font-bold text-purple-900">{p.value}% OFF</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mt-2">{p.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Min. order of {formatPrice(p.minSpend || 0)}
                      </p>
                    </div>
                    <div className="mt-3 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      ● Active Store Discount
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-base font-black text-slate-900">Saved Delivery Addresses</h2>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span>Primary Residence</span>
                  <span className="text-[9px] bg-purple-600 text-white font-bold px-1.5 py-0.2 rounded">Default</span>
                </div>
                <div className="text-slate-600">Plot 14B, Admiralty Way, Lekki Phase 1</div>
                <div className="text-slate-500">{selectedCountry.countryName}</div>
                <div className="text-slate-500 font-mono">+234 801 234 5678</div>
              </div>
            </div>
          )}

          {/* SECURITY & PROFILE TAB */}
          {activeTab === 'security' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <h2 className="text-base font-black text-slate-900">Profile & Authentication</h2>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900">Email & Sign-In Method</div>
                <p className="text-slate-600">
                  Signed in as <strong>{currentUser.email}</strong>
                </p>
                {currentUser.googleLinked && (
                  <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-2.5 rounded-lg font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Google One-Tap Authentication is active and verified</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
