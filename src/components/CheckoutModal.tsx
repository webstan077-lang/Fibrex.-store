import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Building,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Globe,
  Info,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { CardBrand, SavedCard } from '../types';
import { COUNTRIES_CURRENCIES } from '../data/countries';
import {
  validateCardNumberLuhn,
  validateCVV,
  validateCardExpiry,
  sanitizeInput,
} from '../lib/security';

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    cartTotal,
    discountAmount,
    discountCode,
    finalTotal,
    clearCart,
    isCheckoutOpen,
    setIsCheckoutOpen,
  } = useCart();
  const { navigate } = useNavigation();
  const {
    currentUser,
    selectedCountry,
    setSelectedCountry,
    formatPrice,
    savedCards,
    addSavedCard,
  } = useAuth();

  // Shipping Form Fields
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [countryCode, setCountryCode] = useState(selectedCountry.countryCode);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Delivery & Payment
  const [deliverySpeed, setDeliverySpeed] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'delivery'>('card');

  // Card Payment Details
  const [useSavedCard, setUseSavedCard] = useState<boolean>(savedCards.length > 0);
  const [selectedCardId, setSelectedCardId] = useState<string>(
    savedCards.find((c) => c.isDefault)?.id || (savedCards[0] ? savedCards[0].id : '')
  );

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(currentUser?.name || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCardForFuture, setSaveCardForFuture] = useState(true);
  const [detectedBrand, setDetectedBrand] = useState<CardBrand>('unknown');
  const [errorMessage, setErrorMessage] = useState('');

  // Flow states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const [paidCardSummary, setPaidCardSummary] = useState('');

  useEffect(() => {
    if (currentUser) {
      if (!fullName) setFullName(currentUser.name);
      if (!email) setEmail(currentUser.email);
      if (currentUser.phone && !phone) setPhone(currentUser.phone);
      if (currentUser.name && !cardHolder) setCardHolder(currentUser.name);
    }
  }, [currentUser]);

  // Card brand detection logic
  useEffect(() => {
    const raw = cardNumber.replace(/\s+/g, '');
    if (raw.startsWith('4')) {
      setDetectedBrand('visa');
    } else if (/^(5[1-5]|2[2-7])/.test(raw)) {
      setDetectedBrand('mastercard');
    } else if (/^(506|6500|5078|6504)/.test(raw)) {
      setDetectedBrand('verve');
    } else if (/^(34|37)/.test(raw)) {
      setDetectedBrand('amex');
    } else if (/^(6011|65|64[4-9])/.test(raw)) {
      setDetectedBrand('discover');
    } else if (/^62/.test(raw)) {
      setDetectedBrand('unionpay');
    } else {
      setDetectedBrand('unknown');
    }
  }, [cardNumber]);

  if (!isCheckoutOpen) return null;

  // Delivery & Price calculations in NGN, then formatted dynamically by AuthContext
  const FREE_SHIPPING_THRESHOLD_NGN = 25000;
  const isFreeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD_NGN;
  const baseShippingNGN = isFreeShipping ? 0 : 2000;
  const expressFeeNGN = deliverySpeed === 'express' ? 1500 : 0;
  const finalShippingNGN = baseShippingNGN + expressFeeNGN;
  const grandTotalNGN = finalTotal + finalShippingNGN;

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 3) {
      value = `${value.substring(0, 2)}/${value.substring(2)}`;
    }
    setCardExpiry(value);
  };

  // Quick fill test card helper
  const handleQuickFill = (brand: 'visa' | 'mastercard' | 'verve') => {
    setUseSavedCard(false);
    setErrorMessage('');
    if (brand === 'visa') {
      setCardNumber('4242 4242 4242 4242');
      setCardExpiry('12/28');
      setCardCvv('789');
      setCardHolder(fullName || 'John Visa');
    } else if (brand === 'mastercard') {
      setCardNumber('5555 5555 5555 4444');
      setCardExpiry('08/29');
      setCardCvv('456');
      setCardHolder(fullName || 'Sarah Master');
    } else {
      setCardNumber('5061 0234 5678 9015');
      setCardExpiry('05/27');
      setCardCvv('123');
      setCardHolder(fullName || 'Emeka Verve');
    }
  };

  const handleCountryChange = (code: string) => {
    setCountryCode(code);
    setSelectedCountry(code);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanFullName = sanitizeInput(fullName);
    const cleanPhone = sanitizeInput(phone);
    const cleanAddress = sanitizeInput(address);
    const cleanCity = sanitizeInput(city);

    if (!cleanFullName || !cleanPhone || !cleanAddress || !cleanCity) {
      setErrorMessage('Please fill in all required shipping address fields.');
      return;
    }

    if (paymentMethod === 'card') {
      if (useSavedCard) {
        const saved = savedCards.find((c) => c.id === selectedCardId) || savedCards[0];
        setPaidCardSummary(`${saved?.brand.toUpperCase()} ending in •••• ${saved?.last4}`);
      } else {
        const rawDigits = cardNumber.replace(/\D/g, '');

        // Luhn Algorithm Card Integrity Check
        if (!validateCardNumberLuhn(rawDigits)) {
          setErrorMessage('Card number failed checksum verification. Please enter a valid credit or debit card.');
          return;
        }

        // Expiration Check
        const expiryStatus = validateCardExpiry(cardExpiry);
        if (!expiryStatus.valid) {
          setErrorMessage(expiryStatus.message || 'Invalid or expired card date.');
          return;
        }

        // CVV Verification
        const isAmex = detectedBrand === 'amex';
        if (!validateCVV(cardCvv, isAmex)) {
          setErrorMessage(`Invalid security code (CVV). Please enter a ${isAmex ? '4' : '3'}-digit CVV.`);
          return;
        }

        setPaidCardSummary(`${detectedBrand.toUpperCase()} ending in •••• ${rawDigits.slice(-4)}`);

        // Safe tokenization: save ONLY masked metadata, NEVER raw PAN or CVV
        if (saveCardForFuture) {
          addSavedCard({
            brand: detectedBrand !== 'unknown' ? detectedBrand : 'visa',
            last4: rawDigits.slice(-4),
            expMonth: cardExpiry.split('/')[0] || '12',
            expYear: cardExpiry.split('/')[1] || '28',
            holderName: sanitizeInput(cardHolder || cleanFullName),
            isDefault: savedCards.length === 0,
            colorScheme: 'from-slate-900 to-purple-950',
          });
        }
      }
    }

    // Security practice: wipe sensitive CVV from memory before dispatching request
    setCardCvv('');
    setIsProcessing(true);
    setProcessingStep('Contacting Secure Payment Gateway...');

    setTimeout(() => {
      setProcessingStep('Verifying 3D Secure / Card Authorization...');
      setTimeout(() => {
        const orderId = `FBX-${Math.floor(100000 + Math.random() * 900000)}`;
        setGeneratedOrderId(orderId);
        setIsProcessing(false);
        setOrderComplete(true);
        clearCart();
      }, 900);
    }, 800);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    if (orderComplete) {
      setOrderComplete(false);
      navigate('/');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-base sm:text-lg">
              {orderComplete ? 'Order Confirmed!' : 'Global Express Checkout'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Active Currency Badge */}
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold bg-white border border-slate-200 text-purple-700 px-2.5 py-1 rounded-full">
              <span>{selectedCountry.flag}</span>
              <span>{selectedCountry.currencyCode}</span>
            </span>

            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {orderComplete ? (
            /* Order Success State */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Order Placed Successfully
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Thank You, {fullName || 'Customer'}!
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Your order reference number is{' '}
                  <strong className="text-purple-700 font-mono text-base font-bold">
                    {generatedOrderId}
                  </strong>
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 text-left border border-slate-200 text-xs space-y-2.5 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-bold text-slate-800">
                    {selectedCountry.flag} {selectedCountry.countryName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Delivery:</span>
                  <span className="font-bold text-slate-800">
                    {deliverySpeed === 'express' ? 'Priority Express (1-2 Days)' : 'Standard Courier (3-5 Days)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Address:</span>
                  <span className="font-medium text-slate-800 text-right">
                    {address}, {city}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Channel:</span>
                  <span className="font-bold text-emerald-600">
                    {paymentMethod === 'card'
                      ? `Card (${paidCardSummary || 'Verified 3D Secure'})`
                      : paymentMethod === 'transfer'
                      ? 'Direct Bank Transfer'
                      : 'Cash on Delivery'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm">
                  <span>Amount Paid ({selectedCountry.currencyCode}):</span>
                  <span className="text-purple-700 font-mono text-base">
                    {formatPrice(grandTotalNGN)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We sent an instant tracking receipt and SMS update to{' '}
                <span className="font-medium text-slate-800">{email || phone || 'your contact'}</span>.
              </p>

              <button
                onClick={handleClose}
                className="bg-slate-900 hover:bg-purple-600 text-white font-bold text-sm py-3 px-8 rounded-full transition-colors shadow-md cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Country & Shipping Destination */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-purple-600" />
                    1. Shipping & Destination Country
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Globe className="w-3.5 h-3.5 text-purple-600" />
                    <span>Currency: <strong>{selectedCountry.currencyCode}</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Destination Country *
                    </label>
                    <select
                      value={countryCode}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-purple-600 font-medium"
                    >
                      {COUNTRIES_CURRENCIES.map((c) => (
                        <option key={c.countryCode} value={c.countryCode}>
                          {c.flag} {c.countryName} — {c.name} ({c.currencyCode} - {c.currencySymbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000 or 080..."
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-purple-600"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address (for order tracking receipt) *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-purple-600"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Street Delivery Address *
                    </label>
                    <input
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House number, Street name, Apartment / Suite"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                    <input
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City or Town"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      State / Province / Region
                    </label>
                    <input
                      value={stateProvince}
                      onChange={(e) => setStateProvince(e.target.value)}
                      placeholder="e.g. Lagos, California, London"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-purple-600"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Speed Choice */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                  2. Delivery Option
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeliverySpeed('standard')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start justify-between cursor-pointer ${
                      deliverySpeed === 'standard'
                        ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-900">Standard Delivery</p>
                      <p className="text-slate-500 mt-0.5">3-5 Business days</p>
                    </div>
                    <span className="font-bold text-slate-900">
                      {isFreeShipping ? 'FREE' : formatPrice(2000)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliverySpeed('express')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start justify-between cursor-pointer ${
                      deliverySpeed === 'express'
                        ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-900 flex items-center gap-1">
                        <span>Express Priority</span>
                        <span className="bg-purple-600 text-white text-[9px] px-1.5 py-0.2 rounded font-bold">
                          FAST
                        </span>
                      </p>
                      <p className="text-slate-500 mt-0.5">Next-day doorstep delivery</p>
                    </div>
                    <span className="font-bold text-slate-900">
                      {isFreeShipping ? formatPrice(1500) : formatPrice(3500)}
                    </span>
                  </button>
                </div>
              </div>

              {/* Payment Method & Card Details */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    3. Payment Method & Cards
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>256-Bit SSL Encrypted</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Payment Method Radio Options */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'border-purple-600 bg-purple-50/70 ring-1 ring-purple-600'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                      <p className="text-xs font-bold text-slate-900">Cards</p>
                      <p className="text-[9px] text-slate-500">Instant</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('transfer')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'transfer'
                          ? 'border-purple-600 bg-purple-50/70 ring-1 ring-purple-600'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <Building className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                      <p className="text-xs font-bold text-slate-900">Transfer / USSD</p>
                      <p className="text-[9px] text-slate-500">Virtual Acct</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('delivery')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'delivery'
                          ? 'border-purple-600 bg-purple-50/70 ring-1 ring-purple-600'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                      <p className="text-xs font-bold text-slate-900">On Delivery</p>
                      <p className="text-[9px] text-slate-500">POS / Cash</p>
                    </button>
                  </div>

                  {/* Card Payment Form Section */}
                  {paymentMethod === 'card' && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5 animate-fade-in">
                      {/* Accepted Card Badges */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="text-[11px] font-semibold text-slate-600">
                          Accepted Cards:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-600 text-white rounded">
                            VISA
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-600 text-white rounded">
                            Mastercard
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-700 text-white rounded">
                            Verve
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-sky-700 text-white rounded">
                            Amex
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-orange-600 text-white rounded">
                            Discover
                          </span>
                        </div>
                      </div>

                      {/* Saved Cards Selector (if available) */}
                      {savedCards.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">Use Saved Card</span>
                            <button
                              type="button"
                              onClick={() => setUseSavedCard(!useSavedCard)}
                              className="text-purple-600 font-semibold hover:underline"
                            >
                              {useSavedCard ? '+ Pay with a new card' : '← Select saved card'}
                            </button>
                          </div>

                          {useSavedCard && (
                            <div className="space-y-1.5">
                              {savedCards.map((c) => (
                                <label
                                  key={c.id}
                                  className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                                    selectedCardId === c.id
                                      ? 'border-purple-600 bg-white ring-1 ring-purple-600'
                                      : 'border-slate-200 bg-white/70 hover:bg-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <input
                                      type="radio"
                                      name="savedCard"
                                      checked={selectedCardId === c.id}
                                      onChange={() => setSelectedCardId(c.id)}
                                      className="text-purple-600 focus:ring-purple-500"
                                    />
                                    <div>
                                      <p className="text-xs font-bold text-slate-900 uppercase">
                                        {c.brand} •••• {c.last4}
                                      </p>
                                      <p className="text-[10px] text-slate-500">
                                        Expires {c.expMonth}/{c.expYear} • {c.holderName}
                                      </p>
                                    </div>
                                  </div>
                                  {c.isDefault && (
                                    <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded">
                                      Default
                                    </span>
                                  )}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* New Card Details */}
                      {(!useSavedCard || savedCards.length === 0) && (
                        <div className="space-y-3">
                          {/* Quick Fill Demo Chips */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-semibold">
                              Demo test:
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickFill('visa')}
                              className="text-[10px] bg-white border border-slate-200 hover:border-purple-400 text-slate-700 px-2 py-0.5 rounded font-medium cursor-pointer"
                            >
                              ⚡ Visa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickFill('mastercard')}
                              className="text-[10px] bg-white border border-slate-200 hover:border-purple-400 text-slate-700 px-2 py-0.5 rounded font-medium cursor-pointer"
                            >
                              ⚡ Mastercard
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickFill('verve')}
                              className="text-[10px] bg-white border border-slate-200 hover:border-purple-400 text-slate-700 px-2 py-0.5 rounded font-medium cursor-pointer"
                            >
                              ⚡ Verve
                            </button>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Card Number
                            </label>
                            <div className="relative">
                              <input
                                required
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                placeholder="4242 4242 4242 4242"
                                className="w-full text-xs sm:text-sm font-mono bg-white border border-slate-200 rounded-lg pl-3 pr-20 py-2.5 outline-none focus:border-purple-600"
                              />
                              <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
                                {detectedBrand !== 'unknown' && (
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-purple-100 text-purple-700 rounded shadow-xs">
                                    {detectedBrand}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Cardholder Name
                            </label>
                            <input
                              required
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              placeholder="Name as it appears on card"
                              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:border-purple-600"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Expiration (MM/YY)
                              </label>
                              <input
                                required
                                value={cardExpiry}
                                onChange={handleExpiryChange}
                                placeholder="MM/YY"
                                className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:border-purple-600"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                CVV / Security Code
                              </label>
                              <input
                                required
                                type="password"
                                maxLength={4}
                                value={cardCvv}
                                onChange={(e) =>
                                  setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 4))
                                }
                                placeholder="•••"
                                className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:border-purple-600"
                              />
                            </div>
                          </div>

                          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              checked={saveCardForFuture}
                              onChange={(e) => setSaveCardForFuture(e.target.checked)}
                              className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span>Save this card for secure 1-click checkout next time</span>
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {paymentMethod === 'transfer' && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 animate-fade-in">
                      <p className="font-bold text-slate-900">Virtual Bank Account Details</p>
                      <p className="text-slate-600">
                        Transfer directly to Fibrex Global Pay gateway. Confirmation is instantaneous within 15 seconds.
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono space-y-1 text-slate-800">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Bank:</span>
                          <span className="font-bold">Fibrex Global Settlement</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Account No:</span>
                          <span className="font-bold text-purple-700">0123-9847-56</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'delivery' && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5 animate-fade-in">
                      <p className="font-bold text-slate-900">Cash / POS on Delivery</p>
                      <p className="text-slate-600">
                        Pay with cash or your local debit/credit card on the courier POS terminal when your package arrives.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary & Final Total in Selected Currency */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900 pb-2 border-b border-slate-200">
                  <span>
                    Order Items ({cart.length}) in {selectedCountry.currencyCode}
                  </span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-purple-600 font-semibold">
                    <span>Discount ({discountCode})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping & Handling</span>
                  <span>
                    {finalShippingNGN === 0 ? (
                      <strong className="text-emerald-600">FREE</strong>
                    ) : (
                      formatPrice(finalShippingNGN)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span className="text-purple-700 font-mono text-lg">
                    {formatPrice(grandTotalNGN)}
                  </span>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-98"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{processingStep || 'Processing Order...'}</span>
                  </div>
                ) : (
                  <>
                    <span>Pay {formatPrice(grandTotalNGN)} & Confirm Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
