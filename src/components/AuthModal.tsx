import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  Globe,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react';
import { useAuth, AuthModalMode, ADMIN_DEFAULT_PASSCODE } from '../context/AuthContext';
import { COUNTRIES_CURRENCIES } from '../data/countries';
import { useNavigation } from '../context/NavigationContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    authPromptReason,
    openAuthModal,
    loginWithEmail,
    loginWithGoogle,
    registerWithEmail,
    loginAsAdmin,
    selectedCountry,
  } = useAuth();
  const { navigate } = useNavigation();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'admin'>(
    authModalMode === 'admin_login' || authModalMode === 'admin'
      ? 'admin'
      : authModalMode === 'signup'
      ? 'signup'
      : 'signin'
  );

  // Synchronize tab with authModalMode when modal opens
  useEffect(() => {
    if (authModalMode === 'admin_login' || authModalMode === 'admin') {
      setActiveTab('admin');
    } else if (authModalMode === 'signup') {
      setActiveTab('signup');
    } else {
      setActiveTab('signin');
    }
  }, [authModalMode, isAuthModalOpen]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupCountry, setSignupCountry] = useState(selectedCountry.countryCode);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Google Account Picker simulation state
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const success = loginWithEmail(email, password);
      if (success) {
        closeAuthModal();
      } else {
        if (email.trim().toLowerCase() === 'admin@fibrex.store') {
          setErrorMsg('Platform Administrator credentials must be verified via the "Admin" tab.');
        } else {
          setErrorMsg('Invalid login credentials. Please check your email and password.');
        }
      }
    }, 500);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    if (!fullName || !email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      registerWithEmail(fullName, email, password, signupCountry);
      closeAuthModal();
    }, 500);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    if (!adminPasscode.trim()) {
      setErrorMsg('Administrative secret key is required.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const result = loginAsAdmin(adminPasscode);
      if (result.success) {
        closeAuthModal();
        navigate('/admin');
      } else {
        setErrorMsg(result.message || 'Authentication failed: Invalid administrative credentials.');
      }
    }, 500);
  };

  const handleSelectGoogleAccount = (
    googleEmail: string,
    name: string,
    avatar: string
  ) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      loginWithGoogle(googleEmail, name, avatar);
      setShowGooglePicker(false);
      closeAuthModal();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="relative bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Fibrex Logo"
              className="w-9 h-9 rounded-xl object-contain bg-white border border-slate-200 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="font-bold text-slate-900 text-base leading-none">
                {activeTab === 'admin'
                  ? 'Admin Portal Sign-In'
                  : activeTab === 'signup'
                  ? 'Create Your Account'
                  : 'Sign In to Fibrex'}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {activeTab === 'admin'
                  ? 'Exclusive Platform & Store Owner Management'
                  : 'Fast checkout, order tracking & custom currency'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* Google Account Picker View */}
          {showGooglePicker ? (
            <div className="space-y-4">
              <div className="text-center pb-2">
                <div className="w-12 h-12 bg-white rounded-full border border-slate-200 shadow-xs flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Choose a Google Account</h3>
                <p className="text-xs text-slate-500">to continue to Fibrex Store</p>
              </div>

              <div className="space-y-2">
                {/* Active user Google account */}
                <button
                  type="button"
                  onClick={() =>
                    handleSelectGoogleAccount(
                      'webstan077@gmail.com',
                      'Stan Web',
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                    )
                  }
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-purple-600 hover:bg-purple-50/40 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                      alt="User avatar"
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="font-bold text-xs text-slate-900 group-hover:text-purple-700 flex items-center gap-1.5">
                        <span>Stan Web</span>
                        <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.2 rounded">
                          Connected
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">webstan077@gmail.com</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                {/* Secondary Google account demo */}
                <button
                  type="button"
                  onClick={() =>
                    handleSelectGoogleAccount(
                      'michael.doe@gmail.com',
                      'Michael Doe',
                      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
                    )
                  }
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-purple-600 hover:bg-purple-50/40 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
                      alt="User avatar"
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="font-bold text-xs text-slate-900 group-hover:text-purple-700">
                        Michael Doe
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">michael.doe@gmail.com</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>

              {/* Enter custom Google email */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Or enter another Google Email:
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-purple-600"
                  />
                  <button
                    type="button"
                    disabled={!customGoogleEmail.includes('@')}
                    onClick={() => {
                      if (customGoogleEmail) {
                        handleSelectGoogleAccount(
                          customGoogleEmail,
                          customGoogleEmail.split('@')[0],
                          ''
                        );
                      }
                    }}
                    className="bg-slate-900 disabled:opacity-40 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGooglePicker(false)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 pt-2"
              >
                ← Back to standard login
              </button>
            </div>
          ) : (
            /* Standard Auth Tabs */
            <div className="space-y-4">
              {/* Add to cart / Action Prompt Callout */}
              {authPromptReason && (
                <div className="bg-purple-50 border border-purple-200 text-purple-950 p-3 rounded-xl text-xs flex items-start gap-2.5 shadow-xs animate-fade-in">
                  <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 leading-tight">{authPromptReason}</p>
                    <p className="text-[11px] text-purple-700 mt-0.5 leading-tight">
                      Sign up or sign in below — your chosen product will be automatically added to your cart!
                    </p>
                  </div>
                </div>
              )}

              {/* Tab Selector */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'signin'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'signup'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('admin');
                    setErrorMsg('');
                  }}
                  className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                    activeTab === 'admin'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              </div>

              {/* Error Notification */}
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-xs font-medium animate-shake">
                  {errorMsg}
                </div>
              )}

              {/* Informational Notification */}
              {infoMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{infoMsg}</span>
                </div>
              )}

              {/* Google One-Tap / Sign-In Button (Available on customer signin & signup) */}
              {activeTab !== 'admin' && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowGooglePicker(true)}
                    className="w-full bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs py-2.5 px-4 rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-2.5 shadow-xs hover:border-slate-400 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>
                      {activeTab === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
                    </span>
                  </button>

                  <div className="flex items-center my-3">
                    <div className="flex-1 border-t border-slate-200" />
                    <span className="px-3 text-[11px] font-medium text-slate-400">or with email</span>
                    <div className="flex-1 border-t border-slate-200" />
                  </div>
                </div>
              )}

              {/* Sign In Form */}
              {activeTab === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. michael.doe@gmail.com"
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMsg('');
                          setInfoMsg('A password reset token has been dispatched to your email address.');
                        }}
                        className="text-[11px] text-purple-600 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-9 py-2.5 outline-none focus:border-purple-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span>Keep me signed in</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In to Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Quick autofill for quick testing */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[11px] text-slate-400 mb-1.5">Quick fill test credentials:</p>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('michael.doe@gmail.com');
                          setPassword('password123');
                        }}
                        className="flex-1 py-1 px-2 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium truncate"
                      >
                        Customer: michael.doe@gmail.com
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Sign Up Form */}
              {activeTab === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Country & Default Currency
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <select
                        value={signupCountry}
                        onChange={(e) => setSignupCountry(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 outline-none focus:border-purple-600"
                      >
                        {COUNTRIES_CURRENCIES.map((c) => (
                          <option key={c.countryCode} value={c.countryCode}>
                            {c.flag} {c.countryName} ({c.currencyCode} - {c.currencySymbol})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Confirm *
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Create Free Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Admin Sign In Form */}
              {activeTab === 'admin' && (
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs text-purple-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-purple-800">
                      <ShieldCheck className="w-4 h-4 text-purple-700" />
                      <span>Platform Administrator Access</span>
                    </div>
                    <p className="text-[11px] text-purple-700 leading-relaxed">
                      Only the Platform Admin has access to the <strong>Platform Admin Console</strong> and the <strong>Store Owner Hub</strong>.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Admin Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        readOnly
                        value="admin@fibrex.store"
                        className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 outline-none text-slate-700 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Admin Passcode / Key
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={adminPasscode}
                        onChange={(e) => setAdminPasscode(e.target.value)}
                        placeholder="Enter authorized administrative secret key"
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 outline-none focus:border-purple-600"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 px-0.5">
                      <span className="flex items-center gap-1 text-slate-500">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Rate-limited & tamper-protected
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdminPasscode(ADMIN_DEFAULT_PASSCODE)}
                        className="text-purple-600 hover:text-purple-700 font-medium hover:underline cursor-pointer"
                      >
                        Demo Key ({ADMIN_DEFAULT_PASSCODE})
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-slate-900 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authenticate as Admin</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
