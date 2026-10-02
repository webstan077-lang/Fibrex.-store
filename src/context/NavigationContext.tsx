import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface RouteState {
  path: string;
  categorySlug?: string;
  productId?: string;
  orderId?: string;
  searchQuery?: string;
  subSection?: string;
}

interface NavigationContextType {
  currentPath: string;
  categorySlug?: string;
  productId?: string;
  orderId?: string;
  searchQuery?: string;
  subSection?: string;
  navigate: (path: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

function parsePath(pathname: string, search: string): RouteState {
  const params = new URLSearchParams(search);
  const q = params.get('q') || '';

  if (pathname.startsWith('/category/')) {
    const slug = pathname.replace('/category/', '').split('/')[0];
    return { path: '/category', categorySlug: slug, searchQuery: q };
  }
  if (pathname.startsWith('/product/')) {
    const id = pathname.replace('/product/', '').split('/')[0];
    return { path: '/product', productId: id, searchQuery: q };
  }
  if (pathname.startsWith('/account/orders/')) {
    const id = pathname.replace('/account/orders/', '').split('/')[0];
    return { path: '/account/orders', orderId: id, searchQuery: q };
  }
  if (pathname.startsWith('/dashboard/products/')) {
    const sub = pathname.replace('/dashboard/products/', '').split('/')[0];
    return { path: '/dashboard/products', subSection: sub, productId: sub !== 'new' ? sub : undefined, searchQuery: q };
  }
  if (pathname.startsWith('/dashboard/')) {
    const sub = pathname.replace('/dashboard/', '').split('/')[0];
    return { path: `/dashboard/${sub}`, subSection: sub, searchQuery: q };
  }
  if (pathname.startsWith('/admin/')) {
    const sub = pathname.replace('/admin/', '').split('/')[0];
    return { path: `/admin/${sub}`, subSection: sub, searchQuery: q };
  }
  if (pathname.startsWith('/account/')) {
    const sub = pathname.replace('/account/', '').split('/')[0];
    return { path: `/account/${sub}`, subSection: sub, searchQuery: q };
  }
  if (pathname === '/search' || pathname.startsWith('/search')) {
    return { path: '/search', searchQuery: q };
  }
  if (pathname === '/cart') {
    return { path: '/cart', searchQuery: q };
  }
  if (pathname === '/admin') {
    return { path: '/admin', searchQuery: q };
  }
  if (pathname === '/dashboard') {
    return { path: '/dashboard', searchQuery: q };
  }
  if (pathname === '/account') {
    return { path: '/account', searchQuery: q };
  }
  if (['/features', '/pricing', '/how-it-works', '/login', '/signup'].includes(pathname)) {
    return { path: pathname, searchQuery: q };
  }

  return { path: '/', searchQuery: q };
}

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<RouteState>(() =>
    parsePath(window.location.pathname, window.location.search)
  );

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parsePath(window.location.pathname, window.location.search));
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string) => {
    try {
      const url = new URL(to, window.location.origin);
      if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
        window.history.pushState({}, '', to);
        setRoute(parsePath(url.pathname, url.search));
      }
    } catch {
      // Fallback
      window.history.pushState({}, '', to);
      const [path, search] = to.split('?');
      setRoute(parsePath(path, search ? `?${search}` : ''));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        currentPath: route.path,
        categorySlug: route.categorySlug,
        productId: route.productId,
        orderId: route.orderId,
        searchQuery: route.searchQuery,
        subSection: route.subSection,
        navigate,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};
