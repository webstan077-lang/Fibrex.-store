import React from 'react';
import {
  Smartphone,
  Shirt,
  Sparkles,
  Home as HomeIcon,
  Dumbbell,
  ShoppingBasket,
  LayoutGrid,
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { CATEGORIES } from '../data/categories';

const ICON_MAP: Record<string, React.ElementType> = {
  Smartphone,
  Shirt,
  Sparkles,
  Home: HomeIcon,
  Dumbbell,
  ShoppingBasket,
};

export const CategoryNav: React.FC = () => {
  const { currentPath, categorySlug, navigate } = useNavigation();

  return (
    <nav className="sticky top-14 md:top-16 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-[1600px] mx-auto px-3 md:px-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2.5">
          {/* All / Home pill */}
          <button
            onClick={() => navigate('/')}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all ${
              currentPath === '/'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>All Categories</span>
          </button>

          {/* Individual Category Pills */}
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon ? ICON_MAP[cat.icon] || Sparkles : Sparkles;
            const isActive = currentPath === '/category' && categorySlug === cat.slug;

            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/category/${cat.slug}`)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
