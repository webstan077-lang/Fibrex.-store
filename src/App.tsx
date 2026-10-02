import React from 'react';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreDataProvider } from './context/StoreDataContext';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { WishlistModal } from './components/WishlistModal';
import { Toast } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { CurrencyCountryModal } from './components/CurrencyCountryModal';
import { WebsitePreloader } from './components/WebsitePreloader';

import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SearchPage } from './pages/SearchPage';
import { CartPage } from './pages/CartPage';
import { StoreOwnerDashboardPage } from './pages/StoreOwnerDashboardPage';
import { AdminPage } from './pages/AdminPage';
import { AccountPage } from './pages/AccountPage';
import { ShieldAlert, Store, User, Lock } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentPath, navigate } = useNavigation();
  const { isAdmin, isStoreOwner, openAuthModal, currentUser } = useAuth();

  const isAdminRoute = currentPath.startsWith('/admin');
  const isDashboardRoute = currentPath.startsWith('/dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-purple-500 selection:text-white">
      {/* Website Preloader (Shows branded icon loading before page) */}
      <WebsitePreloader />

      {/* Header and Category Navigation Bar (Hidden in Admin/Dashboard for focus, or visible on marketplace) */}
      {!isAdminRoute && !isDashboardRoute && (
        <>
          <Header />
          <CategoryNav />
        </>
      )}

      {/* Main Page View Content */}
      <main className="flex-1 w-full">
        {/* Protected Admin Route */}
        {isAdminRoute && (
          isAdmin ? (
            <AdminPage />
          ) : (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Platform Admin Restricted</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    The Platform Admin console is strictly restricted to platform administrators.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200">
                  Signed in as: <strong className="text-slate-900">{currentUser ? currentUser.email : 'Guest'}</strong>
                </div>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => openAuthModal('admin')}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Authenticate with Admin Credentials
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Return to Storefront
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {/* Protected Store Owner Dashboard Route */}
        {isDashboardRoute && (
          (isAdmin || isStoreOwner) ? (
            <StoreOwnerDashboardPage />
          ) : (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-inner">
                  <Store className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Store Owner Access Required</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    The Merchant Dashboard is available only to verified store owners and platform admins.
                  </p>
                </div>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => openAuthModal('admin')}
                    className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Sign In with Admin / Store Owner Account
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Return to Storefront
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {currentPath.startsWith('/account') && <AccountPage />}
        {currentPath === '/' && <HomePage />}
        {currentPath === '/category' && <CategoryPage />}
        {currentPath === '/product' && <ProductDetailPage />}
        {currentPath === '/search' && <SearchPage />}
        {currentPath === '/cart' && <CartPage />}

        {/* Fallback for any other path or direct route landing */}
        {!isAdminRoute &&
          !isDashboardRoute &&
          !currentPath.startsWith('/account') &&
          currentPath !== '/' &&
          currentPath !== '/category' &&
          currentPath !== '/product' &&
          currentPath !== '/search' &&
          currentPath !== '/cart' && (
            <HomePage />
          )}
      </main>

      {/* Overlays, Modals, Authentication & Fiscal Modals */}
      <CartDrawer />
      <CheckoutModal />
      <WishlistModal />
      <AuthModal />
      <CurrencyCountryModal />
      <Toast />

      {/* Rich Footer with Value Propositions (Marketplace views) */}
      {!isAdminRoute && !isDashboardRoute && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <NavigationProvider>
      <AuthProvider>
        <StoreDataProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </StoreDataProvider>
      </AuthProvider>
    </NavigationProvider>
  );
}
