import React, { useState } from 'react';
import {
  X,
  Search,
  Globe,
  Check,
  CreditCard,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { COUNTRIES_CURRENCIES, CountryCurrencyConfig } from '../data/countries';

export const CurrencyCountryModal: React.FC = () => {
  const {
    isCurrencyModalOpen,
    setIsCurrencyModalOpen,
    selectedCountry,
    setSelectedCountry,
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  if (!isCurrencyModalOpen) return null;

  const regions = ['all', 'Africa', 'North America', 'Europe', 'Asia', 'Middle East', 'Oceania', 'South America'];

  const filteredCountries = COUNTRIES_CURRENCIES.filter((c) => {
    const matchesSearch =
      c.countryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.currencyCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion =
      selectedRegion === 'all' || c.region.toLowerCase() === selectedRegion.toLowerCase();
    return matchesSearch && matchesRegion;
  });

  const handleSelect = (country: CountryCurrencyConfig) => {
    setSelectedCountry(country.countryCode);
    setIsCurrencyModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base sm:text-lg">
                Select Country & Currency
              </h2>
              <p className="text-xs text-slate-500">
                Shop and pay in your local country currency with native payment cards
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCurrencyModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Region Filters */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country (e.g. Nigeria, United States, Kenya, Euro, Ghana)..."
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-purple-600 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {regions.map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-1 rounded-full font-medium whitespace-nowrap capitalize transition-colors ${
                  selectedRegion === region
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {region === 'all' ? 'All Regions' : region}
              </button>
            ))}
          </div>
        </div>

        {/* Country & Currency Grid / List */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2">
            {filteredCountries.map((c) => {
              const isSelected = c.countryCode === selectedCountry.countryCode;
              return (
                <button
                  key={c.countryCode}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50/60 ring-1 ring-purple-600 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0" role="img" aria-label={c.countryName}>
                      {c.flag}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {c.countryName}
                        </p>
                        {isSelected && (
                          <span className="bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        <span className="font-semibold text-slate-700">
                          {c.currencyCode} ({c.currencySymbol})
                        </span>{' '}
                        • {c.name}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <CreditCard className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-[10px] text-slate-400 truncate">
                          {c.supportedCards.slice(0, 3).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <div className="text-xs font-mono font-bold text-slate-800">
                      {c.currencySymbol}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-purple-600 ml-auto mt-1" />}
                  </div>
                </button>
              );
            })}
          </div>

          {filteredCountries.length === 0 && (
            <div className="text-center py-10">
              <Globe className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No countries found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for a different currency name or region</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Exchange rates are dynamically converted in real-time</span>
          </div>
          <button
            onClick={() => setIsCurrencyModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
