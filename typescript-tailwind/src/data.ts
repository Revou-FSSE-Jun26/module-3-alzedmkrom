// Seed data for the RevoShop catalog.
//
// The values here are copied from the live RevoShop database: the `categories`
// table supplies the CategoryLookup below, and the `products` table supplies the
// ten ProductRecord literals. Records use the snake_case wire shape (ProductRecord),
// exactly as the Flask API serializes them, and are mapped to the app model with
// toProduct() at the render seam.
//
// IMPORTANT — two stock_quantity values are DELIBERATELY ALTERED from the live
// products table so the low-stock and out-of-stock availability states are
// reachable and can be screenshotted:
//   - Row 5, Windbreaker Jacket:   real value 30 -> seeded as 4  (low-stock state)
//   - Row 9, Digital Sports Watch: real value 45 -> seeded as 0  (out-of-stock state)
// The other eight rows keep their real stock values. These two edits are
// intentional demo data, not a schema mismatch, and are also recorded in the README.

import type { CategoryLookup, ProductRecord } from './types.js';

// --- categories table (copied verbatim) ---

export const CATEGORIES: CategoryLookup = {
  1: {
    id: 1,
    name: 'Apparel',
    description: 'Clothing items including shirts, t-shirts, dresses, and formal wear',
  },
  2: {
    id: 2,
    name: 'Footwear',
    description: 'Athletic shoes, casual shoes, and socks',
  },
  3: {
    id: 3,
    name: 'Accessories',
    description: 'Outfit complements such as hats, sunglasses, watches, and belts',
  },
  4: {
    id: 4,
    name: 'Bags',
    description: 'Backpacks, messenger bags, and travel storage containers',
  },
};

// --- products table (ten rows, descriptions copied verbatim) ---

export const PRODUCTS: ProductRecord[] = [
  {
    id: 1,
    category_id: 2,
    name: 'Nike Air Max Running Shoes',
    description: 'Cushioned running shoes with a breathable mesh upper and responsive air sole.',
    price: 850000,
    stock_quantity: 50,
    created_at: '2026-08-14T18:44:04.027+07:00',
    is_delete: false,
  },
  {
    id: 2,
    category_id: 1,
    name: 'Plain Cotton Combed T-Shirt',
    description: 'Soft combed cotton t-shirt with a regular fit and a plain crew neck.',
    price: 75000,
    stock_quantity: 197,
    created_at: '2026-08-14T18:45:12.113+07:00',
    is_delete: false,
  },
  {
    id: 3,
    category_id: 1,
    name: 'Fleece Jogger Pants',
    description: 'Warm fleece jogger pants with an elastic waistband and ribbed cuffs.',
    price: 195000,
    stock_quantity: 80,
    created_at: '2026-08-14T18:46:33.501+07:00',
    is_delete: false,
  },
  {
    id: 4,
    category_id: 3,
    name: 'Unisex Baseball Cap',
    description: 'Adjustable unisex baseball cap in durable cotton twill with a curved brim.',
    price: 120000,
    stock_quantity: 150,
    created_at: '2026-08-14T18:47:50.882+07:00',
    is_delete: false,
  },
  {
    id: 5,
    category_id: 1,
    name: 'Windbreaker Jacket',
    description: 'Lightweight water-resistant windbreaker jacket with a full-zip front and hood.',
    price: 450000,
    // ALTERED: real stock_quantity is 30; seeded as 4 to reach the low-stock state.
    stock_quantity: 4,
    created_at: '2026-08-14T18:49:07.244+07:00',
    is_delete: false,
  },
  {
    id: 6,
    category_id: 2,
    name: 'Sports Socks 3-Pack',
    description: 'Breathable cushioned sports socks with arch support, sold as a pack of three.',
    price: 55000,
    stock_quantity: 295,
    created_at: '2026-08-14T18:50:21.617+07:00',
    is_delete: false,
  },
  {
    id: 7,
    category_id: 4,
    name: 'Waterproof Backpack',
    description: 'Waterproof backpack with a padded laptop compartment and adjustable straps.',
    price: 320000,
    stock_quantity: 60,
    created_at: '2026-08-14T18:51:44.309+07:00',
    is_delete: false,
  },
  {
    id: 8,
    category_id: 3,
    name: 'UV400 Sunglasses',
    description: 'Polarized UV400 sunglasses with a lightweight frame and full glare protection.',
    price: 135000,
    stock_quantity: 100,
    created_at: '2026-08-14T18:53:02.775+07:00',
    is_delete: false,
  },
  {
    id: 9,
    category_id: 3,
    name: 'Digital Sports Watch',
    description: 'Water-resistant digital sports watch with a stopwatch, alarm, and backlight.',
    price: 275000,
    // ALTERED: real stock_quantity is 45; seeded as 0 to reach the out-of-stock state.
    stock_quantity: 0,
    created_at: '2026-08-14T18:54:19.140+07:00',
    is_delete: false,
  },
  {
    id: 10,
    category_id: 3,
    name: 'Leather Belt',
    description: 'Genuine leather belt with a brushed metal buckle and a classic finish.',
    price: 180000,
    stock_quantity: 75,
    created_at: '2026-08-14T18:55:38.992+07:00',
    is_delete: false,
  },
];
