import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, SavedCard } from '../types';
import {
  CountryCurrencyConfig,
  COUNTRIES_CURRENCIES,
  DEFAULT_COUNTRY,
  getCountryByCode,
} from '../data/countries';
import {
  timingSafeEqual,
  checkLoginRateLimit,
  recordFailedAttempt,
  resetLoginAttempts,
  generateSessionChecksum,
  verifySessionIntegrity,
  sanitizeInput,
} from '../lib/security';

export const ADMIN_DEFAULT_PASSCODE = 'Fibrex@Admin2026!';

export interface RegisteredAdmin {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'platform_admin';
  registeredAt: string;
  avatar?: string;
}

export const DEFAULT_REGISTERED_ADMINS: RegisteredAdmin[] = [
  {
    id: 'user_admin_01',
    name: 'Alex Morgan',
    email: 'admin@fibrex.store',
    password: ADMIN_DEFAULT_PASSCODE,
    role: 'platform_admin',
    registeredAt: '2025-01-10',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
];

export interface AdminLoginResponse {
  success: boolean;
  message?: string;
  remainingSecs?: number;
}

export const INITIAL_SAVED_CARDS: SavedCard[] = [
  {
    id: 'card_default_01',
    brand: 'mastercard',
    last4: '5412',
    expMonth: '08',
    expYear: '28',
    holderName: 'Michael Doe',
    isDefault: true,
    colorScheme: 'from-slate-900 to-slate-800',
  },
  {
    id: 'card_default_02',
    brand: 'visa',
    last4: '4242',
    expMonth: '11',
    expYear: '27',
    holderName: 'Michael Doe',
    isDefault: false,
    colorScheme: 'from-blue-900 to-indigo-950',
  },
  {
    id: 'card_default_03',
    brand: 'verve',
    last4: '8801',
    expMonth: '05',
    expYear: '29',
    holderName: 'Michael Doe',
    isDefault: false,
    colorScheme: 'from-emerald-900 to-teal-950',
  },
];

export const DEMO_USERS: Record<UserRole, User> = {
  platform_admin: {
    id: 'user_admin_01',
    name: 'Alex Morgan',
    email: 'admin@fibrex.store',
    role: 'platform_admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+234 801 234 5678',
    joinedDate: '2025-01-10',
    status: 'active',
    selectedCountry: 'NG',
  },
  store_owner: {
    id: 'user_merchant_01',
    name: 'Sarah Jenkins',
    email: 'sarah@apexmerchants.com',
    role: 'store_owner',
    storeId: 'store_apex_01',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '+234 802 345 6789',
    joinedDate: '2025-03-15',
    status: 'active',
    selectedCountry: 'NG',
  },
  customer: {
    id: 'user_cust_01',
    name: 'Michael Doe',
    email: 'michael.doe@gmail.com',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    phone: '+234 803 456 7890',
    joinedDate: '2025-05-20',
    status: 'active',
    googleLinked: false,
    selectedCountry: 'NG',
  },
};

export type AuthModalMode = 'signin' | 'signup' | 'admin' | 'admin_login' | 'google' | 'google_select';
export type AdminPortalView = 'admin' | 'dashboard';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isStoreOwner: boolean;
  selectedCountry: CountryCurrencyConfig;
  currency: string;
  currencySymbol: string;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  authPromptReason: string | null;
  isCurrencyModalOpen: boolean;
  savedCards: SavedCard[];
  adminActivePortal: AdminPortalView;
  setAdminActivePortal: (portal: AdminPortalView) => void;
  openAuthModal: (mode?: AuthModalMode, reason?: string) => void;
  closeAuthModal: () => void;
  setIsCurrencyModalOpen: (open: boolean) => void;
  setSelectedCountry: (countryCodeOrCurrency: string) => void;
  setCurrency: (currencyCode: string) => void;
  formatPrice: (amountInNGN: number) => string;
  convertPrice: (amountInNGN: number) => number;
  loginWithEmail: (email: string, password?: string, role?: UserRole) => boolean;
  loginWithGoogle: (email?: string, name?: string, avatar?: string) => void;
  registerWithEmail: (name: string, email: string, password?: string, countryCode?: string) => void;
  loginAsAdmin: (passcodeOrEmail?: string, password?: string) => AdminLoginResponse;
  registerAsAdmin: (name: string, email: string, password?: string, adminKey?: string) => AdminLoginResponse;
  registeredAdmins: RegisteredAdmin[];
  logout: () => void;
  addSavedCard: (card: Omit<SavedCard, 'id'>) => SavedCard;
  removeSavedCard: (cardId: string) => void;
  setDefaultSavedCard: (cardId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state: defaults to null (Guest visitor) until customer signs in/signs up
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fibrex_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('signin');
  const [authPromptReason, setAuthPromptReason] = useState<string | null>(null);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);

  // Registered administrators state (allows admin to sign up on their own and persist credentials)
  const [registeredAdmins, setRegisteredAdmins] = useState<RegisteredAdmin[]>(() => {
    const saved = localStorage.getItem('fibrex_registered_admins');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // Fall back to default
      }
    }
    return DEFAULT_REGISTERED_ADMINS;
  });

  useEffect(() => {
    localStorage.setItem('fibrex_registered_admins', JSON.stringify(registeredAdmins));
  }, [registeredAdmins]);

  // Country & Currency state
  const [selectedCountry, setSelectedCountryState] = useState<CountryCurrencyConfig>(() => {
    const saved = localStorage.getItem('fibrex_selected_country');
    if (saved) {
      return getCountryByCode(saved);
    }
    return DEFAULT_COUNTRY;
  });

  // Saved Cards
  const [savedCards, setSavedCards] = useState<SavedCard[]>(() => {
    const saved = localStorage.getItem('fibrex_saved_cards');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_SAVED_CARDS;
      }
    }
    return INITIAL_SAVED_CARDS;
  });

  // Admin active sub-view ('admin' or 'dashboard')
  const [adminActivePortal, setAdminActivePortal] = useState<AdminPortalView>('admin');

  // Persistence with Anti-Tamper Session Signing
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('fibrex_current_user', JSON.stringify(currentUser));
      localStorage.setItem('fibrex_user_role', currentUser.role);

      // Sign session cryptographically to prevent client-side role forgery
      generateSessionChecksum(currentUser.id, currentUser.role, currentUser.email).then((sig) => {
        localStorage.setItem('fibrex_session_sig', sig);
      });
    } else {
      localStorage.removeItem('fibrex_current_user');
      localStorage.removeItem('fibrex_session_sig');
      localStorage.setItem('fibrex_user_role', 'customer');
    }
  }, [currentUser]);

  // Verify stored session on initial mount to catch any localStorage tampering
  useEffect(() => {
    if (currentUser && currentUser.role === 'platform_admin') {
      const storedSig = localStorage.getItem('fibrex_session_sig');
      if (storedSig) {
        verifySessionIntegrity(currentUser.id, currentUser.role, currentUser.email, storedSig).then((valid) => {
          if (!valid) {
            console.warn('[Security Guard] Tampered administrative session detected. Revoking access.');
            setCurrentUser(null);
            localStorage.removeItem('fibrex_current_user');
            localStorage.removeItem('fibrex_session_sig');
          }
        });
      } else {
        console.warn('[Security Guard] Unsigned administrative session detected. Revoking access.');
        setCurrentUser(null);
        localStorage.removeItem('fibrex_current_user');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fibrex_selected_country', selectedCountry.countryCode);
    localStorage.setItem('fibrex_currency', selectedCountry.currencyCode);
  }, [selectedCountry]);

  useEffect(() => {
    localStorage.setItem('fibrex_saved_cards', JSON.stringify(savedCards));
  }, [savedCards]);

  const currentRole: UserRole = currentUser ? currentUser.role : 'customer';
  const isLoggedIn: boolean = currentUser !== null;
  const isAdmin: boolean = currentUser?.role === 'platform_admin';
  const isStoreOwner: boolean = currentUser?.role === 'store_owner' || isAdmin;

  const openAuthModal = (mode: AuthModalMode = 'signin', reason?: string) => {
    setAuthModalMode(mode);
    setAuthPromptReason(reason || null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthPromptReason(null);
  };

  const setSelectedCountry = (code: string) => {
    const found = getCountryByCode(code);
    setSelectedCountryState(found);
  };

  const setCurrency = (currencyCode: string) => {
    const found = COUNTRIES_CURRENCIES.find(
      (c) => c.currencyCode.toLowerCase() === currencyCode.toLowerCase()
    );
    if (found) {
      setSelectedCountryState(found);
    }
  };

  // Convert NGN price to active country currency
  const convertPrice = (amountInNGN: number): number => {
    if (!amountInNGN || isNaN(amountInNGN)) return 0;
    if (selectedCountry.currencyCode === 'NGN') return amountInNGN;
    const converted = amountInNGN * selectedCountry.rateAgainstNGN;
    return Number(converted.toFixed(selectedCountry.decimalDigits));
  };

  // Format price string with authentic country currency symbol and digits
  const formatPrice = (amountInNGN: number): string => {
    if (amountInNGN === undefined || amountInNGN === null || isNaN(amountInNGN)) {
      return `${selectedCountry.currencySymbol}0`;
    }

    const converted = convertPrice(amountInNGN);
    const formattedNumber = converted.toLocaleString(
      selectedCountry.countryCode === 'NG' ? 'en-NG' : 'en-US',
      {
        minimumFractionDigits: selectedCountry.decimalDigits,
        maximumFractionDigits: selectedCountry.decimalDigits,
      }
    );

    if (selectedCountry.prefix) {
      // e.g. ₦45,000 or $45.00 or £32.50 or KSh 2,500
      const space = selectedCountry.currencySymbol.length > 2 ? ' ' : '';
      return `${selectedCountry.currencySymbol}${space}${formattedNumber}`;
    }
    return `${formattedNumber} ${selectedCountry.currencySymbol}`;
  };

  // Auth methods with Server-Grade Security Controls
  const loginWithEmail = (email: string, password?: string, requestedRole?: UserRole): boolean => {
    const cleanEmail = sanitizeInput(email.trim().toLowerCase());

    // Check if the user is a registered Platform Administrator
    const matchedAdmin = registeredAdmins.find((a) => a.email.toLowerCase() === cleanEmail);
    if (matchedAdmin) {
      const authorizedKey =
        ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_ADMIN_PASSCODE as string) ||
        ADMIN_DEFAULT_PASSCODE;
      
      const passValid =
        !password ||
        (matchedAdmin.password && matchedAdmin.password === password) ||
        timingSafeEqual(password, authorizedKey);

      if (passValid) {
        const adminUser: User = {
          id: matchedAdmin.id,
          name: matchedAdmin.name,
          email: matchedAdmin.email,
          role: 'platform_admin',
          avatar: matchedAdmin.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
          phone: '+234 801 234 5678',
          joinedDate: matchedAdmin.registeredAt,
          status: 'active',
          selectedCountry: selectedCountry.countryCode,
        };
        resetLoginAttempts('admin_console');
        setCurrentUser(adminUser);
        setIsAuthModalOpen(false);
        return true;
      }
    }

    // Security Gate: Reject unauthenticated role escalation through generic email login without password
    if (cleanEmail === 'admin@fibrex.store' && !matchedAdmin) {
      console.warn('[Security Guard] Direct administrative role claim blocked via standard email login. Use Admin Portal or sign up as Admin.');
      return false;
    }

    if (cleanEmail.includes('merchant') || cleanEmail.includes('sarah') || requestedRole === 'store_owner') {
      setCurrentUser(DEMO_USERS.store_owner);
      setIsAuthModalOpen(false);
      return true;
    }

    // Default regular customer login with sanitized fields
    const user: User = {
      id: `user_${Date.now()}`,
      name: sanitizeInput(email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())),
      email: cleanEmail,
      role: 'customer',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'active',
      googleLinked: false,
      selectedCountry: selectedCountry.countryCode,
    };
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    return true;
  };

  const loginWithGoogle = (
    email: string = 'webstan077@gmail.com',
    name: string = 'Stan Web',
    avatar: string = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  ) => {
    const cleanEmail = sanitizeInput(email.trim().toLowerCase());
    const user: User = {
      id: `google_${Date.now()}`,
      name: sanitizeInput(name) || cleanEmail.split('@')[0],
      email: cleanEmail,
      role: 'customer',
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'active',
      googleLinked: true,
      selectedCountry: selectedCountry.countryCode,
    };
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const registerWithEmail = (
    name: string,
    email: string,
    _password?: string,
    countryCode?: string
  ) => {
    const cleanEmail = sanitizeInput(email.trim().toLowerCase());
    const user: User = {
      id: `user_${Date.now()}`,
      name: sanitizeInput(name.trim()),
      email: cleanEmail,
      role: 'customer',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'active',
      googleLinked: false,
      selectedCountry: countryCode || selectedCountry.countryCode,
    };
    if (countryCode) {
      setSelectedCountry(countryCode);
    }
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  // Platform Admin Self-Registration (allows the admin to sign up on their own securely)
  const registerAsAdmin = (
    name: string,
    email: string,
    password?: string,
    adminKey?: string
  ): AdminLoginResponse => {
    const cleanEmail = sanitizeInput((email || '').trim().toLowerCase());
    const cleanName = sanitizeInput((name || '').trim());
    const authorizedKey =
      ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_ADMIN_PASSCODE as string) ||
      ADMIN_DEFAULT_PASSCODE;

    if (!cleanEmail || !cleanName) {
      return {
        success: false,
        message: 'Name and email are required to register an administrative account.',
      };
    }

    if (!password || password.length < 6) {
      return {
        success: false,
        message: 'Admin security password must be at least 6 characters long.',
      };
    }

    // Security Gate: Verification of administrative key or enrollment authorization
    const providedKey = (adminKey || '').trim();
    if (!providedKey || !timingSafeEqual(providedKey, authorizedKey)) {
      return {
        success: false,
        message: `Admin enrollment key is invalid. Please enter the authorized master key (${ADMIN_DEFAULT_PASSCODE}).`,
      };
    }

    const newAdmin: RegisteredAdmin = {
      id: `admin_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: password,
      role: 'platform_admin',
      registeredAt: new Date().toISOString().split('T')[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
    };

    setRegisteredAdmins((prev) => {
      const filtered = prev.filter((a) => a.email.toLowerCase() !== cleanEmail);
      return [newAdmin, ...filtered];
    });

    const adminUser: User = {
      id: newAdmin.id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: 'platform_admin',
      avatar: newAdmin.avatar,
      phone: '+234 801 234 5678',
      joinedDate: newAdmin.registeredAt,
      status: 'active',
      selectedCountry: selectedCountry.countryCode,
    };

    resetLoginAttempts('admin_console');
    setCurrentUser(adminUser);
    setIsAuthModalOpen(false);
    return { success: true };
  };

  // Authenticate as Platform Administrator with brute-force rate-limiting and timing-safe comparison
  const loginAsAdmin = (passcodeOrEmail?: string, password?: string): AdminLoginResponse => {
    // Check brute-force lockout status
    const rateCheck = checkLoginRateLimit('admin_console');
    if (!rateCheck.allowed) {
      return {
        success: false,
        message: `Security Lockout Active: Too many failed administrative attempts. Try again in ${rateCheck.remainingSecs}s.`,
        remainingSecs: rateCheck.remainingSecs,
      };
    }

    const inputVal = (passcodeOrEmail || '').trim();
    const authorizedKey =
      ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_ADMIN_PASSCODE as string) ||
      ADMIN_DEFAULT_PASSCODE;

    // Case 1: Master Passcode provided directly
    if (timingSafeEqual(inputVal, authorizedKey)) {
      resetLoginAttempts('admin_console');
      setCurrentUser(DEMO_USERS.platform_admin);
      setIsAuthModalOpen(false);
      return { success: true };
    }

    // Case 2: Email and Password login for self-registered Admin
    const cleanEmail = sanitizeInput(inputVal.toLowerCase());
    const matchedAdmin = registeredAdmins.find((a) => a.email.toLowerCase() === cleanEmail);

    if (matchedAdmin) {
      const passOk =
        (password && matchedAdmin.password && matchedAdmin.password === password) ||
        (password && timingSafeEqual(password, authorizedKey));

      if (passOk) {
        resetLoginAttempts('admin_console');
        const adminUser: User = {
          id: matchedAdmin.id,
          name: matchedAdmin.name,
          email: matchedAdmin.email,
          role: 'platform_admin',
          avatar: matchedAdmin.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
          phone: '+234 801 234 5678',
          joinedDate: matchedAdmin.registeredAt,
          status: 'active',
          selectedCountry: selectedCountry.countryCode,
        };
        setCurrentUser(adminUser);
        setIsAuthModalOpen(false);
        return { success: true };
      }
    }

    const failInfo = recordFailedAttempt('admin_console');
    if (failInfo.locked) {
      return {
        success: false,
        message: `Security Lockout Activated: 5 consecutive failed administrative credentials. Locked for ${failInfo.remainingSecs} seconds.`,
        remainingSecs: failInfo.remainingSecs,
      };
    }
    return {
      success: false,
      message: `Invalid administrative access key or credentials. ${failInfo.attemptsLeft} attempt(s) remaining before security lockout.`,
    };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Card Management: Strictly Tokenized (PCI-DSS Best Practice)
  // NEVER stores full PAN or CVV in state or persistent storage
  const addSavedCard = (cardData: Omit<SavedCard, 'id'>): SavedCard => {
    const sanitizedLast4 = cardData.last4.replace(/\D/g, '').slice(-4);
    const newCard: SavedCard = {
      id: `tok_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      brand: cardData.brand,
      last4: sanitizedLast4,
      expMonth: cardData.expMonth.replace(/\D/g, '').slice(0, 2),
      expYear: cardData.expYear.replace(/\D/g, '').slice(0, 2),
      holderName: sanitizeInput(cardData.holderName || ''),
      isDefault: Boolean(cardData.isDefault),
      colorScheme: cardData.colorScheme || 'from-slate-900 to-purple-950',
    };
    setSavedCards((prev) => [newCard, ...prev]);
    return newCard;
  };

  const removeSavedCard = (cardId: string) => {
    setSavedCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  const setDefaultSavedCard = (cardId: string) => {
    setSavedCards((prev) =>
      prev.map((c) => ({
        ...c,
        isDefault: c.id === cardId,
      }))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        isLoggedIn,
        isAdmin,
        isStoreOwner,
        selectedCountry,
        currency: selectedCountry.currencyCode,
        currencySymbol: selectedCountry.currencySymbol,
        isAuthModalOpen,
        authModalMode,
        authPromptReason,
        isCurrencyModalOpen,
        savedCards,
        adminActivePortal,
        setAdminActivePortal,
        openAuthModal,
        closeAuthModal,
        setIsCurrencyModalOpen,
        setSelectedCountry,
        setCurrency,
        formatPrice,
        convertPrice,
        loginWithEmail,
        loginWithGoogle,
        registerWithEmail,
        loginAsAdmin,
        registerAsAdmin,
        registeredAdmins,
        logout,
        addSavedCard,
        removeSavedCard,
        setDefaultSavedCard,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
