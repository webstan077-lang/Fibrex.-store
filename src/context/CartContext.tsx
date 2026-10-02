import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CartItem, Product, RecentlyViewedItem } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  recentlyViewed: RecentlyViewedItem[];
  cartCount: number;
  cartTotal: number;
  discountCode: string | null;
  discountAmount: number;
  finalTotal: number;
  addToCart: (product: Product, qty?: number, variant?: Record<string, string>) => void;
  updateQty: (key: string, qty: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  addRecentlyViewed: (product: Product) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isLoggedIn, openAuthModal } = useAuth();

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('fibrex_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fibrex_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>(() => {
    try {
      const saved = localStorage.getItem('fibrex_recently_viewed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Store pending item to automatically add after sign up / login
  const [pendingCartItem, setPendingCartItem] = useState<{
    product: Product;
    qty: number;
    variant?: Record<string, string>;
  } | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // Base raw cart adder
  const addItemToCartState = useCallback(
    (product: Product, qty: number = 1, variant?: Record<string, string>) => {
      const variantStr = variant ? Object.entries(variant).sort().map(([k, v]) => `${k}:${v}`).join('|') : '';
      const key = `${product.id}${variantStr ? `-${variantStr}` : ''}`;

      setCart((prev) => {
        const existingIdx = prev.findIndex((item) => item.key === key);
        if (existingIdx > -1) {
          const next = [...prev];
          next[existingIdx] = {
            ...next[existingIdx],
            qty: next[existingIdx].qty + qty,
          };
          return next;
        } else {
          return [
            ...prev,
            {
              key,
              id: product.id,
              name: product.name,
              price: product.price,
              original_price: product.original_price,
              image: product.images?.[0],
              category: product.category,
              qty,
              variant,
            },
          ];
        }
      });
    },
    []
  );

  // Auto-fulfill pending cart item once authentication succeeds
  useEffect(() => {
    if (currentUser && pendingCartItem) {
      addItemToCartState(pendingCartItem.product, pendingCartItem.qty, pendingCartItem.variant);
      showToast(`Welcome ${currentUser.name}! Added "${pendingCartItem.product.name}" to your cart.`);
      setPendingCartItem(null);
      setIsCartOpen(true);
    }
  }, [currentUser, pendingCartItem, addItemToCartState, showToast]);

  useEffect(() => {
    try {
      localStorage.setItem('fibrex_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('fibrex_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('fibrex_recently_viewed', JSON.stringify(recentlyViewed));
    } catch (e) {
      console.error(e);
    }
  }, [recentlyViewed]);

  const addToCart = useCallback(
    (product: Product, qty: number = 1, variant?: Record<string, string>) => {
      // If user is not authenticated, prompt sign-in / sign-up authentication panel
      if (!isLoggedIn || !currentUser) {
        setPendingCartItem({ product, qty, variant });
        openAuthModal('signup', `Please sign up or sign in to add "${product.name}" to your cart`);
        showToast('Please sign in or create an account to start shopping');
        return;
      }

      addItemToCartState(product, qty, variant);
      showToast(`Added ${product.name} to cart`);
    },
    [isLoggedIn, currentUser, openAuthModal, showToast, addItemToCartState]
  );

  const updateQty = useCallback((key: string, qty: number) => {
    setCart((prev) => {
      if (qty <= 0) {
        return prev.filter((item) => item.key !== key);
      }
      return prev.map((item) => (item.key === key ? { ...item, qty } : item));
    });
  }, []);

  const removeFromCart = useCallback(
    (key: string) => {
      setCart((prev) => {
        const item = prev.find((i) => i.key === key);
        if (item) {
          showToast(`Removed from cart`);
        }
        return prev.filter((i) => i.key !== key);
      });
    },
    [showToast]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setDiscountCode(null);
    setDiscountPercent(0);
    showToast('Cart cleared');
  }, [showToast]);

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlist((prev) => {
        const exists = prev.includes(productId);
        if (exists) {
          showToast('Removed from wishlist');
          return prev.filter((id) => id !== productId);
        } else {
          showToast('Added to wishlist');
          return [...prev, productId];
        }
      });
    },
    [showToast]
  );

  const isWishlisted = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const addRecentlyViewed = useCallback((product: Product) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item.id !== product.id);
      return [
        {
          id: product.id,
          name: product.name,
          image: product.images?.[0],
          price: product.price,
          category: product.category,
        },
        ...filtered,
      ].slice(0, 12);
    });
  }, []);

  const applyPromoCode = useCallback(
    (code: string): { success: boolean; message: string } => {
      const clean = code.trim().toUpperCase();
      if (!clean) return { success: false, message: 'Please enter a code' };

      if (clean === 'FIBREX10' || clean === 'WELCOME10') {
        setDiscountCode(clean);
        setDiscountPercent(10);
        showToast(`Promo code ${clean} applied: 10% off!`);
        return { success: true, message: '10% discount applied!' };
      } else if (clean === 'MEGA20' || clean === 'FIBREX20') {
        setDiscountCode(clean);
        setDiscountPercent(20);
        showToast(`Promo code ${clean} applied: 20% off!`);
        return { success: true, message: '20% discount applied!' };
      } else if (clean === 'FLASH50') {
        setDiscountCode(clean);
        setDiscountPercent(50);
        showToast(`Promo code ${clean} applied: 50% off!`);
        return { success: true, message: '50% discount applied!' };
      } else {
        return { success: false, message: 'Invalid promo code. Try FIBREX10 or MEGA20' };
      }
    },
    [showToast]
  );

  const removePromoCode = useCallback(() => {
    setDiscountCode(null);
    setDiscountPercent(0);
    showToast('Promo code removed');
  }, [showToast]);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.qty, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + item.qty * item.price, 0), [cart]);
  const discountAmount = useMemo(() => Math.round((cartTotal * discountPercent) / 100), [cartTotal, discountPercent]);
  const finalTotal = useMemo(() => Math.max(0, cartTotal - discountAmount), [cartTotal, discountAmount]);

  const value = {
    cart,
    wishlist,
    recentlyViewed,
    cartCount,
    cartTotal,
    discountCode,
    discountAmount,
    finalTotal,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    toggleWishlist,
    isWishlisted,
    addRecentlyViewed,
    isCartOpen,
    setIsCartOpen,
    isWishlistOpen,
    setIsWishlistOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    applyPromoCode,
    removePromoCode,
    toastMessage,
    showToast,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
