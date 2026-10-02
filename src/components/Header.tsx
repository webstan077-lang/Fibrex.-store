import React, { useState, useRef, useEffect } from 'react';
import {
  Zap,
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  TrendingUp,
  ArrowRight,
  Store,
  User,
  ShieldCheck,
  Globe,
  CreditCard,
  LogOut,
  PackageCheck,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../data/categories';
import fibrexLogoImg from '../assets/images/fibrex_app_icon_1790957656248.jpg';

export const Header: React.FC = () => {
  const { cartCount, wishlist, setIsCartOpen, setIsWishlistOpen } = useCart();
  const { navigate, searchQuery: currentSearchQuery } = useNavigation();
  const {
    currentUser,
    isLoggedIn,
    isAdmin,
    openAuthModal,
    logout,
    selectedCountry,
    setIsCurrencyModalOpen,
  } = useAuth();

  const [query, setQuery] = useState(currentSearchQuery || '');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(currentSearchQuery || '');
  }, [currentSearchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsSearchFocused(false);
      setMobileMenuOpen(false);
    }
  };

  const trendingSuggestions = [
    'wireless earbuds',
    'smartwatch',
    'sneakers',
    'skincare',
    'bluetooth speaker',
    'handbag',
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Main Navbar */}
      <div className="max-w-[1600px] mx-auto px-3 md:px-6">
        <div className="flex items-center gap-3 h-14 md:h-16">
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 -ml-1 text-slate-700 hover:text-slate-900 focus:outline-none"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 shrink-0 focus:outline-none group text-left cursor-pointer"
          >
            <img
              src={fibrexLogoImg}
              alt="Fibrex Store Logo"
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl object-contain shadow-xs transition-transform group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <span className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900">
              Fibrex<span className="text-purple-600">.</span>
            </span>
          </button>

          {/* Central Search Bar */}
          <div ref={searchContainerRef} className="flex-1 max-w-2xl mx-auto relative">
            <form onSubmit={handleSearchSubmit}>
              <div
                className={`flex items-center border rounded-full transition-all bg-slate-100 ${
                  isSearchFocused
                    ? 'border-purple-600 ring-2 ring-purple-500/20 bg-white'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Search className="w-4 h-4 md:w-5 md:h-5 text-slate-400 ml-3 md:ml-4 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Search thousands of products..."
                  className="flex-1 bg-transparent px-2 md:px-3 py-2 md:py-2.5 text-sm outline-none text-slate-800 placeholder:text-slate-400 min-w-0"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      inputRef.current?.focus();
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 mr-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-slate-900 text-white text-xs md:text-sm font-semibold px-4 md:px-6 py-2 md:py-2.5 rounded-full m-0.5 hover:bg-purple-600 transition-colors shrink-0 cursor-pointer"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Live suggestions popup */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-fade-in">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                  Trending Searches
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {trendingSuggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setQuery(item);
                        navigate(`/search?q=${encodeURIComponent(item)}`);
                        setIsSearchFocused(false);
                      }}
                      className="text-xs font-medium bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Browse Categories
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          navigate(`/category/${cat.slug}`);
                          setIsSearchFocused(false);
                        }}
                        className="flex items-center justify-between text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <span>{cat.name}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 md:gap-2.5 shrink-0">
            {/* Swapped: Real-Time Currency Selector Button in Main Navbar */}
            <button
              type="button"
              onClick={() => setIsCurrencyModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-full hover:bg-slate-100 transition-all text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-white cursor-pointer shadow-2xs group"
              title="Change Currency (Real-Time Price Updates)"
              aria-label="Change Currency"
            >
              <span className="text-base leading-none group-hover:scale-110 transition-transform">
                {selectedCountry.flag}
              </span>
              <span className="text-xs font-extrabold text-slate-900">
                {selectedCountry.currencyCode}
              </span>
              <span className="text-[11px] font-bold text-purple-700 hidden sm:inline">
                ({selectedCountry.currencySymbol})
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>

            {/* Account / User Menu */}
            <div ref={userMenuRef} className="relative">
              {isLoggedIn && currentUser ? (
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 md:px-2.5 md:py-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
                >
                  <img
                    src={
                      currentUser.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`
                    }
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-purple-200"
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[100px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {isAdmin ? 'Admin' : 'Customer'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full text-xs font-bold transition-all shadow-sm hover:shadow-purple-500/20 active:scale-95 cursor-pointer border border-purple-400/30"
                >
                  <User className="w-4 h-4 text-purple-100" />
                  <span className="hidden sm:inline font-bold tracking-tight text-white drop-shadow-xs">Sign In</span>
                </button>
              )}

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fade-in">
                  {/* User Profile Header */}
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {currentUser?.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate font-mono">
                      {currentUser?.email}
                    </p>
                    {currentUser?.googleLinked && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        </svg>
                        Google Linked
                      </span>
                    )}
                  </div>

                  {/* ONLY IF ADMIN: Exclusive Two Settings (Platform Admin & Store Owner Hub) */}
                  {isAdmin && (
                    <div className="p-2 border-b border-slate-100 bg-purple-50/50">
                      <p className="text-[10px] font-bold text-purple-900 uppercase tracking-wider px-2 mb-1">
                        Admin Exclusive Settings
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          navigate('/admin');
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-900 hover:bg-purple-100 text-left transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-700" />
                        <div>
                          <p className="leading-tight">1. Platform Admin Console</p>
                          <p className="text-[10px] text-slate-500 font-normal">Global platform controls</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          navigate('/dashboard');
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-900 hover:bg-purple-100 text-left transition-colors mt-0.5"
                      >
                        <Store className="w-4 h-4 text-purple-700" />
                        <div>
                          <p className="leading-tight">2. Store Owner Hub</p>
                          <p className="text-[10px] text-slate-500 font-normal">Manage products, orders & deals</p>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Standard Customer Settings */}
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/account');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>My Account Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/account');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left"
                    >
                      <PackageCheck className="w-4 h-4 text-slate-500" />
                      <span>My Orders & Tracking</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/account');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left"
                    >
                      <CreditCard className="w-4 h-4 text-slate-500" />
                      <span>Saved Payment Cards</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setIsCurrencyModalOpen(true);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Globe className="w-4 h-4 text-slate-500" />
                        <span>Country & Currency</span>
                      </div>
                      <span className="text-[11px] font-bold text-purple-700">
                        {selectedCountry.flag} {selectedCountry.currencyCode}
                      </span>
                    </button>
                  </div>

                  {/* Log Out */}
                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-700 hover:text-slate-900 focus:outline-none cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 md:w-6 md:h-6" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-purple-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-700 hover:text-slate-900 focus:outline-none cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-purple-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 max-h-[80vh] overflow-y-auto animate-fade-in shadow-xl">
          {/* User Sign In / Account Status on Mobile */}
          <div className="pb-3 mb-3 border-b border-slate-100">
            {isLoggedIn && currentUser ? (
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <img
                    src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-600 font-bold p-1"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  openAuthModal('signin');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-purple-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs"
              >
                <User className="w-4 h-4" />
                <span>Sign In or Create Account</span>
              </button>
            )}
          </div>

          {/* Admin exclusive shortcuts if admin */}
          {isAdmin && (
            <div className="pb-3 mb-3 border-b border-slate-100 bg-purple-50 p-2.5 rounded-xl">
              <p className="text-[10px] font-bold text-purple-900 uppercase tracking-wider mb-2">
                Admin Exclusive Settings
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    navigate('/admin');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 px-3 rounded-lg text-xs font-bold bg-slate-900 text-white flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Platform Admin</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 px-3 rounded-lg text-xs font-bold bg-purple-600 text-white flex items-center justify-center gap-1.5"
                >
                  <Store className="w-4 h-4" />
                  <span>Store Owner Hub</span>
                </button>
              </div>
            </div>
          )}

          {/* Country & Currency Switcher Mobile */}
          <button
            onClick={() => {
              setIsCurrencyModalOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between py-2.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-900 mb-3"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-600" />
              <span>Currency & Country:</span>
            </div>
            <span>
              {selectedCountry.flag} {selectedCountry.countryName} ({selectedCountry.currencyCode})
            </span>
          </button>

          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Categories
          </p>
          <div className="space-y-1">
            <button
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              All Categories & Home
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  navigate(`/category/${cat.slug}`);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-between w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700"
              >
                <span>{cat.name}</span>
                <span className="text-xs text-slate-400">
                  {cat.subcategories?.length || 0} subcategories
                </span>
              </button>
            ))}
          </div>

          <div className="border-t border-slate-100 mt-4 pt-4 space-y-2">
            <button
              onClick={() => {
                navigate('/account');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full py-2 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <User className="w-4 h-4 text-slate-600" />
              <span>Customer Account & Orders</span>
            </button>
            <button
              onClick={() => {
                setIsWishlistOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full py-2 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Heart className="w-4 h-4 text-purple-600" />
              <span>Saved Wishlist ({wishlist.length})</span>
            </button>
            <button
              onClick={() => {
                setIsCartOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full py-2 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <ShoppingBag className="w-4 h-4 text-purple-600" />
              <span>My Shopping Cart ({cartCount})</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
