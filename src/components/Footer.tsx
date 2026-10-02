import React, { useState } from 'react';
import {
  Zap,
  Truck,
  ShieldCheck,
  Headphones,
  RotateCcw,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { CATEGORIES } from '../data/categories';
import fibrexLogoImg from '../assets/images/fibrex_app_icon_1790957656248.jpg';

export const Footer: React.FC = () => {
  const { navigate } = useNavigation();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-slate-900 text-white mt-16 border-t border-slate-800">
      {/* Value Propositions Strip */}
      <div className="border-b border-slate-800/80">
        <div className="max-w-[1600px] mx-auto px-3 md:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Free Nationwide Shipping</h4>
                <p className="text-xs text-slate-400 mt-0.5">On all qualifying orders over ₦25,000</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">100% Secure Checkout</h4>
                <p className="text-xs text-slate-400 mt-0.5">Encrypted card & instant bank transfer</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">7-Day Free Returns</h4>
                <p className="text-xs text-slate-400 mt-0.5">Hassle-free guarantee & full refunds</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">24/7 Dedicated Support</h4>
                <p className="text-xs text-slate-400 mt-0.5">Ready to assist you round the clock</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1600px] mx-auto px-3 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <img
                src={fibrexLogoImg}
                alt="Fibrex Logo"
                className="w-9 h-9 rounded-xl object-contain shadow-md group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <span className="text-xl font-black tracking-tight text-white">
                Fibrex<span className="text-purple-400">.</span>
              </span>
            </button>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Fibrex Store is your premier online shopping destination. Discover thousands of curated products across Electronics, Fashion, Beauty, Home, Sports, and Groceries with super-fast delivery.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <p className="text-xs font-bold text-white mb-2">Subscribe to get exclusive deals</p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Thanks for subscribing! Check your inbox for 10% off.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-purple-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shrink-0 shadow-sm"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Shop Categories
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => navigate(`/category/${cat.slug}`)}
                    className="hover:text-purple-400 transition-colors"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Customer Care
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => navigate('/search?q=deals')} className="hover:text-purple-400">
                  Flash Sales & Offers
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/')} className="hover:text-purple-400">
                  Track Your Order
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/')} className="hover:text-purple-400">
                  Shipping & Delivery Info
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/')} className="hover:text-purple-400">
                  Returns & Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/')} className="hover:text-purple-400">
                  Help Center & FAQs
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              About Fibrex
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <span className="hover:text-purple-400 cursor-pointer">About Our Store</span>
              </li>
              <li>
                <span className="hover:text-purple-400 cursor-pointer">Authenticity Guarantee</span>
              </li>
              <li>
                <span className="hover:text-purple-400 cursor-pointer">Terms of Service</span>
              </li>
              <li>
                <span className="hover:text-purple-400 cursor-pointer">Privacy Policy</span>
              </li>
              <li>
                <span className="hover:text-purple-400 cursor-pointer">Contact Us</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Fibrex Store. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Secure Payments:</span>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
              <span className="bg-slate-800 px-2 py-1 rounded">Mastercard</span>
              <span className="bg-slate-800 px-2 py-1 rounded">VISA</span>
              <span className="bg-slate-800 px-2 py-1 rounded">Verve</span>
              <span className="bg-slate-800 px-2 py-1 rounded">Bank Transfer</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
