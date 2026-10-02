import { Category, Product } from '../types';

export const CATEGORIES_MAP: Record<
  string,
  { name: string; icon: string; subcategories: string[] }
> = {
  electronics: {
    name: 'Electronics',
    icon: 'Smartphone',
    subcategories: ['Phones', 'Laptops', 'Earbuds', 'Speakers', 'Smartwatches', 'Chargers', 'Audio', 'Gaming', 'Cameras', 'Accessories'],
  },
  fashion: {
    name: 'Fashion',
    icon: 'Shirt',
    subcategories: ['Shirts', 'Dresses', 'Shoes', 'Bags', 'Watches', 'Accessories', 'Outerwear', 'Jewelry'],
  },
  beauty: {
    name: 'Beauty',
    icon: 'Sparkles',
    subcategories: ['Skincare', 'Makeup', 'Haircare', 'Fragrance', 'Body Care', 'Tools'],
  },
  home: {
    name: 'Home',
    icon: 'Home',
    subcategories: ['Furniture', 'Kitchen', 'Lighting', 'Decoration', 'Storage', 'Bedding'],
  },
  sports: {
    name: 'Sports',
    icon: 'Dumbbell',
    subcategories: ['Sportswear', 'Football', 'Fitness', 'Running', 'Equipment', 'Outdoor'],
  },
  groceries: {
    name: 'Groceries',
    icon: 'ShoppingBasket',
    subcategories: ['Fresh Produce', 'Pantry', 'Beverages', 'Snacks', 'Breakfast', 'Organic'],
  },
};

export const CATEGORY_KEYS = ['electronics', 'fashion', 'beauty', 'home', 'sports', 'groceries'];

export const CATEGORIES: Category[] = [
  {
    id: '6a881555fe75f0c2d78f9635',
    name: 'Electronics',
    slug: 'electronics',
    icon: 'Smartphone',
    image: 'https://media.base44.com/images/public/6a881422fe75f0c2d78f956b/b60466a12_generated_228e74e2.png',
    subcategories: CATEGORIES_MAP.electronics.subcategories,
  },
  {
    id: '6a881555fe75f0c2d78f9636',
    name: 'Fashion',
    slug: 'fashion',
    icon: 'Shirt',
    image: 'https://media.base44.com/images/public/6a881422fe75f0c2d78f956b/5eaffba7e_generated_fe51a1ba.png',
    subcategories: CATEGORIES_MAP.fashion.subcategories,
  },
  {
    id: '6a881555fe75f0c2d78f9637',
    name: 'Beauty',
    slug: 'beauty',
    icon: 'Sparkles',
    image: 'https://media.base44.com/images/public/6a881422fe75f0c2d78f956b/b78d84e26_generated_1103f1a7.png',
    subcategories: CATEGORIES_MAP.beauty.subcategories,
  },
  {
    id: '6a881555fe75f0c2d78f9638',
    name: 'Home',
    slug: 'home',
    icon: 'Home',
    image: 'https://media.base44.com/images/public/6a881422fe75f0c2d78f956b/7e5f0f396_generated_8ef76ca7.png',
    subcategories: CATEGORIES_MAP.home.subcategories,
  },
  {
    id: '6a881555fe75f0c2d78f9639',
    name: 'Sports',
    slug: 'sports',
    icon: 'Dumbbell',
    image: 'https://media.base44.com/images/public/6a881422fe75f0c2d78f956b/53d80074d_generated_4dadfd16.png',
    subcategories: CATEGORIES_MAP.sports.subcategories,
  },
  {
    id: '6a881555fe75f0c2d78f963a',
    name: 'Groceries',
    slug: 'groceries',
    icon: 'ShoppingBasket',
    image: 'https://media.base44.com/images/public/6a881422fe75f0c2d78f956b/524233a5f_generated_e8a0b66f.png',
    subcategories: CATEGORIES_MAP.groceries.subcategories,
  },
];
