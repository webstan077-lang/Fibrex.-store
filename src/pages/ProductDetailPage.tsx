import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronRight,
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Minus,
  Plus,
  Zap,
  Sparkles,
  MessageSquare,
  FileText,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { PRODUCTS } from '../data/products';
import { Product, SpecificationItem } from '../types';
import { calculateDiscount } from '../utils/format';
import { ProductGrid } from '../components/ProductGrid';
import { QuickShopModal } from '../components/QuickShopModal';

export const ProductDetailPage: React.FC = () => {
  const { productId, navigate } = useNavigation();
  const { addToCart, toggleWishlist, isWishlisted, addRecentlyViewed } = useCart();
  const { formatPrice } = useAuth();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // New review form state
  const [userReviewName, setUserReviewName] = useState('');
  const [userReviewRating, setUserReviewRating] = useState(5);
  const [userReviewText, setUserReviewText] = useState('');
  const [customReviews, setCustomReviews] = useState<
    { name: string; rating: number; text: string; date: string }[]
  >([]);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const product = useMemo(() => {
    return PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];
  }, [productId]);

  useEffect(() => {
    if (product) {
      setActiveImageIdx(0);
      setQuantity(1);
      const initialVariants: Record<string, string> = {};
      product.variants?.forEach((v) => {
        if (v.options.length > 0) {
          initialVariants[v.name] = v.options[0];
        }
      });
      setSelectedVariants(initialVariants);
      addRecentlyViewed(product);
    }
  }, [product, addRecentlyViewed]);

  const wishlisted = isWishlisted(product.id);
  const discount = product.discount_percent || calculateDiscount(product.price, product.original_price);
  const images = product.images || [];

  // Related products from same category
  const relatedProducts = useMemo(() => {
    return PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 6);
  }, [product]);

  // Frequently bought together bundle item
  const bundleProduct = useMemo(() => {
    return PRODUCTS.find((p) => p.id !== product.id && p.category === product.category) || PRODUCTS[1];
  }, [product]);

  // Normalize specifications
  const specsList: SpecificationItem[] = useMemo(() => {
    if (Array.isArray(product.specifications)) {
      return product.specifications;
    }
    if (typeof product.specifications === 'string') {
      return [{ label: 'Details', value: product.specifications }];
    }
    return [
      { label: 'Brand', value: product.brand || 'Fibrex Premium' },
      { label: 'Category', value: product.category.toUpperCase() },
      { label: 'Subcategory', value: product.subcategory || 'Standard' },
      { label: 'Stock Status', value: product.stock ? `${product.stock} units available` : 'In Stock' },
      { label: 'Condition', value: '100% Brand New & Genuine' },
      { label: 'Warranty', value: '1 Year Manufacturer Guarantee' },
    ];
  }, [product]);

  const defaultReviews = [
    {
      name: 'Ada O.',
      rating: 5,
      text: 'Great quality and fast delivery. Exactly as described! Very pleased with this purchase.',
      date: '3 days ago',
    },
    {
      name: 'Chidi M.',
      rating: 4,
      text: 'Good value for the price. Build quality is solid and arrived well-packaged in Lagos.',
      date: '1 week ago',
    },
    {
      name: 'Funmi A.',
      rating: 5,
      text: 'Exceeded my expectations. Premium materials and reliable performance. Highly recommend!',
      date: '2 weeks ago',
    },
  ];

  const allReviews = [...customReviews, ...defaultReviews];

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userReviewName.trim() || !userReviewText.trim()) return;
    setCustomReviews((prev) => [
      {
        name: userReviewName.trim(),
        rating: userReviewRating,
        text: userReviewText.trim(),
        date: 'Just now',
      },
      ...prev,
    ]);
    setUserReviewName('');
    setUserReviewText('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariants);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariants);
    navigate('/cart');
  };

  return (
    <div className="max-w-[1600px] mx-auto px-3 md:px-6 py-6 pb-20">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 overflow-x-auto scrollbar-hide py-1">
        <button onClick={() => navigate('/')} className="hover:text-purple-600">
          Home
        </button>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <button
          onClick={() => navigate(`/category/${product.category}`)}
          className="hover:text-purple-600 capitalize"
        >
          {product.category}
        </button>
        {product.subcategory && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-600">{product.subcategory}</span>
          </>
        )}
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
            {images.length > 0 ? (
              <img
                src={images[activeImageIdx] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <ShoppingBag className="w-20 h-20" />
              </div>
            )}

            {/* Discount Badge */}
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-purple-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                {discount}% OFF
              </span>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
                wishlisted
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-slate-700 hover:text-purple-600'
              }`}
              aria-label="Save to wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnails list */}
          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide py-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIdx === idx
                      ? 'border-purple-600 ring-2 ring-purple-600/30'
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center Column: Product Buy Box Details (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div>
            {product.brand && (
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">
                {product.brand}
              </span>
            )}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2.5 leading-snug">
              {product.name}
            </h1>

            {/* Rating Stars & Review Count */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(product.rating || 0)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 fill-slate-100'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">
                {product.rating ? product.rating.toFixed(1) : '4.8'}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-xs text-purple-600 hover:underline font-semibold"
              >
                {product.review_count || 48} verified reviews
              </button>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Purchase
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-black text-slate-950 tabular-nums">
                {formatPrice(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-sm text-slate-400 line-through tabular-nums">
                    {formatPrice(product.original_price)}
                  </span>
                  <span className="text-xs font-extrabold bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full">
                    Save {formatPrice(product.original_price - product.price)}
                  </span>
                </>
              )}
            </div>

            {product.is_flash_deal && (
              <div className="flex items-center gap-1.5 text-xs text-amber-800 font-bold bg-amber-100/70 px-3 py-1.5 rounded-xl mt-3">
                <Zap className="w-4 h-4 text-amber-600 fill-amber-600" />
                <span>Special Flash Deal Price — Limited Stock Available</span>
              </div>
            )}
          </div>

          {/* Shipping & Stock Badges */}
          <div className="space-y-2 text-xs">
            {product.shipping_info && (
              <div className="flex items-center gap-2 text-slate-700 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <Truck className="w-4 h-4 text-purple-600 shrink-0" />
                <span>{product.shipping_info}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-700 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {product.stock
                  ? `In Stock (${product.stock} units remaining in warehouse)`
                  : 'In Stock — Ready to ship immediately'}
              </span>
            </div>
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-2">
              {product.variants.map((v) => (
                <div key={v.name}>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Select {v.name}:{' '}
                    <span className="text-purple-700 font-semibold">{selectedVariants[v.name]}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setSelectedVariants((prev) => ({ ...prev, [v.name]: opt }))
                        }
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedVariants[v.name] === opt
                            ? 'border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-600/30'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-800">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-black text-sm text-slate-900 tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2.5 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-slate-900 hover:bg-purple-600 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-98"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-98"
              >
                <span>Buy Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Value Propositions Pill Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
              <span>100% Genuine Guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-purple-600 shrink-0" />
              <span>7-Day Hassle-Free Returns</span>
            </div>
          </div>
        </div>

        {/* Right Column: Frequently Bought Together & Highlights (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Frequently Bought Together
            </h3>

            <div className="space-y-3">
              {/* Product 1 */}
              <div className="flex items-center gap-2.5 bg-white p-2 rounded-xl border border-slate-200/80">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 truncate">{product.name}</p>
                  <p className="text-xs font-bold text-purple-700">{formatPrice(product.price)}</p>
                </div>
              </div>

              {/* Plus sign */}
              <div className="flex justify-center text-slate-400 font-bold text-sm">+</div>

              {/* Bundle Partner */}
              <div
                onClick={() => navigate(`/product/${bundleProduct.id}`)}
                className="flex items-center gap-2.5 bg-white p-2 rounded-xl border border-slate-200/80 hover:border-purple-300 transition-colors cursor-pointer group"
              >
                <img
                  src={bundleProduct.images[0]}
                  alt={bundleProduct.name}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-purple-600">
                    {bundleProduct.name}
                  </p>
                  <p className="text-xs font-bold text-purple-700">
                    {formatPrice(bundleProduct.price)}
                  </p>
                </div>
              </div>

              {/* Bundle price & Add Both CTA */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500">Combo Total:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {formatPrice(product.price + bundleProduct.price)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    addToCart(product, 1);
                    addToCart(bundleProduct, 1);
                  }}
                  className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs py-2 px-3 rounded-xl border border-purple-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add Both to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description, Specifications, Reviews */}
      <div className="mt-14 border-t border-slate-200 pt-8">
        {/* Tab Buttons */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('description')}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'description'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Product Description</span>
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'specs'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Specifications</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Customer Reviews ({allReviews.length})</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="py-6">
          {activeTab === 'description' && (
            <div className="max-w-4xl space-y-4 text-sm text-slate-700 leading-relaxed">
              <p className="text-base font-semibold text-slate-900">
                {product.name}
              </p>
              <p>
                {product.description ||
                  'Experience top-tier quality and reliability with this premium item. Designed with meticulous attention to detail and tested for optimal durability, it delivers seamless functionality for everyday convenience.'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">Authentic Quality</h4>
                  <p className="text-xs text-slate-500">Every item is certified original and inspected prior to dispatch.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">Express Dispatch</h4>
                  <p className="text-xs text-slate-500">Orders packed same-day and tracked until delivery.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">Buyer Warranty</h4>
                  <p className="text-xs text-slate-500">Protected by 7-day return guarantee and full customer support.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-2xl">
              <table className="w-full text-xs sm:text-sm border-collapse">
                <tbody>
                  {specsList.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-200 hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3 px-3 font-bold text-slate-900 w-1/3 bg-slate-50/50">
                        {item.label}
                      </td>
                      <td className="py-3 px-3 text-slate-700">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="max-w-3xl space-y-8">
              {/* Write a review form */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Leave a Verified Review</h3>
                {reviewSubmitted ? (
                  <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-3 rounded-xl font-bold text-xs border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Thank you! Your review has been posted.</span>
                  </div>
                ) : (
                  <form onSubmit={handleAddReview} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Your Name
                        </label>
                        <input
                          required
                          value={userReviewName}
                          onChange={(e) => setUserReviewName(e.target.value)}
                          placeholder="e.g. Tunde B."
                          className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 outline-none focus:border-purple-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Rating Score
                        </label>
                        <select
                          value={userReviewRating}
                          onChange={(e) => setUserReviewRating(Number(e.target.value))}
                          className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 outline-none focus:border-purple-600 font-medium"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5 Stars - Excellent)</option>
                          <option value={4}>⭐⭐⭐⭐ (4 Stars - Good)</option>
                          <option value={3}>⭐⭐⭐ (3 Stars - Average)</option>
                          <option value={2}>⭐⭐ (2 Stars - Below Average)</option>
                          <option value={1}>⭐ (1 Star - Poor)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Your Feedback
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={userReviewText}
                        onChange={(e) => setUserReviewText(e.target.value)}
                        placeholder="Write your honest review on quality, delivery, and experience..."
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 outline-none focus:border-purple-600 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 px-5 rounded-lg transition-colors cursor-pointer"
                    >
                      Submit Review
                    </button>
                  </form>
                )}
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {allReviews.map((rev, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                          {rev.name.charAt(0)}
                        </div>
                        <span className="font-bold text-xs text-slate-900">{rev.name}</span>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                          Verified Buyer
                        </span>
                      </div>
                      {rev.date && <span className="text-[11px] text-slate-400">{rev.date}</span>}
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200 fill-slate-100'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed pt-1">{rev.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Carousel / Grid */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 border-t border-slate-200 pt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-black text-slate-900">
              Related Products in {product.category}
            </h2>
            <button
              onClick={() => navigate(`/category/${product.category}`)}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ProductGrid
            products={relatedProducts}
            onQuickView={setQuickViewProduct}
          />
        </div>
      )}

      {/* Quick View Dialog for Related Products */}
      <QuickShopModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
