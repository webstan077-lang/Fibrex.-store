import React from 'react';
import { Zap, ArrowRight, ShieldCheck, Truck, Clock } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export const HeroBanner: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <div className="px-3 md:px-6 max-w-[1600px] mx-auto pt-4">
      <div className="relative rounded-2xl overflow-hidden shadow-lg bg-slate-900 min-h-[340px] md:min-h-[380px] flex items-center">
        {/* Background Image with Fallback */}
        <img
          src="https://media.base44.com/images/public/6a881422fe75f0c2d78f956b/dffb94f6b_generated_27b3a81a.png"
          alt="Fibrex Store promotion"
          className="w-full h-full object-cover absolute inset-0 opacity-40 mix-blend-luminosity md:mix-blend-normal md:opacity-60"
        />

        {/* Gradient overlays for contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-purple-950/30" />

        {/* Content */}
        <div className="relative z-10 px-6 md:px-12 py-8 md:py-12 w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="text-white max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-purple-600 text-white text-xs font-extrabold px-3 py-1 rounded-full mb-3.5 tracking-wide shadow-md">
              <Zap className="w-3.5 h-3.5 fill-current text-yellow-300" />
              MEGA SALE
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black leading-tight tracking-tight">
              Up to 70% off <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
                thousands of products
              </span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-3 leading-relaxed max-w-lg">
              Flash deals, best sellers & new arrivals — discover it all with instant quick shop and rapid delivery at Fibrex Store.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={() => navigate('/search?q=deals')}
                className="inline-flex items-center gap-2 bg-white text-slate-950 font-bold text-sm px-6 py-3 rounded-full hover:bg-purple-600 hover:text-white transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>Shop Deals Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/category/electronics')}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-3 rounded-full backdrop-blur-sm border border-white/20 transition-all cursor-pointer"
              >
                <span>Browse Electronics</span>
              </button>
            </div>
          </div>

          {/* Quick Perks Badge Cards */}
          <div className="hidden lg:grid grid-cols-1 gap-2.5 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 max-w-xs text-white text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/30 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-purple-300" />
              </div>
              <div>
                <p className="font-bold text-white">Free Nationwide Shipping</p>
                <p className="text-slate-300 text-[11px]">On orders over ₦25,000</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <p className="font-bold text-white">100% Genuine Items</p>
                <p className="text-slate-300 text-[11px]">Directly sourced with warranty</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/30 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-yellow-300" />
              </div>
              <div>
                <p className="font-bold text-white">7-Day Free Returns</p>
                <p className="text-slate-300 text-[11px]">Hassle-free return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
