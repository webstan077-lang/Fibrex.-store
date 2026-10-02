import React from 'react';
import { useCart } from '../context/CartContext';
import { CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-sm">
      <div className="flex items-center gap-2.5 bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-2xl border border-slate-800 backdrop-blur-md">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="truncate">{toastMessage}</span>
      </div>
    </div>
  );
};
