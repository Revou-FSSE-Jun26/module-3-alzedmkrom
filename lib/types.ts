// lib/types.ts
//
// Three layers:
//   1. wire types   — exactly what the Flask API returns (snake_case)
//   2. app models    — idiomatic camelCase shapes the components consume
//   3. component contracts — prop interfaces and form shapes
//
// A single set of mapper functions bridges the wire layer to the app layer,
// so snake_case never escapes this module and lib/api.ts.

import type { ReactNode } from 'react';

// ---------- wire layer: exactly what the Flask API returns ----------

export interface ProductRecord {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number; // JSON float, e.g. 850000.0
  stock_quantity: number;
  is_delete: boolean;
  created_at: string; // ISO 8601 with offset
}

export interface CategoryRecord {
  id: number;
  name: string;
  description: string;
}

export interface OrderRecord {
  id: number;
  user_id: number;
  status: string; // observed: 'PENDING' (uppercase)
  total_price: number; // JSON float, e.g. 1000000.0
  is_delete: boolean;
  created_at: string;
}

// ---------- app layer: camelCase, the shape components consume ----------

export interface Product {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  isDeleted: boolean;
  createdAt: string;
  imageUrl: string | null; // no image column yet; null drives the placeholder
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  totalPrice: number;
  isDeleted: boolean;
  createdAt: string;
}

// Only 'PENDING' is confirmed from live data. Kept open with a string
// fallback so an unseen status renders instead of breaking the page.
export type OrderStatus = 'PENDING' | (string & {});

// Derived stock state — a discriminated union, carried over from Checkpoint 1.
export type Availability =
  | { kind: 'in-stock'; quantity: number }
  | { kind: 'low-stock'; quantity: number }
  | { kind: 'out-of-stock' };

export const LOW_STOCK_THRESHOLD = 5;

// ---------- component contracts ----------

export interface ProductCardProps {
  product: Product;
  /** Optional: hides the counter and add button for read-only grids. */
  readOnly?: boolean;
  /** Optional: label on the add control. */
  actionLabel?: string;
  /** Optional: omitted in read-only mode. */
  onAddToCart?: (product: Product, quantity: number) => void;
}

export interface CardProps {
  children: ReactNode;
  className?: string;
}

// ---------- AddProductForm ----------

export interface FormState {
  name: string;
  description: string;
  price: string; // raw input strings; parsed during validation
  stockQuantity: string;
  categoryId: string;
}

export type FormErrors = Partial<Record<keyof FormState, string>>;

// ---------- mapping and deriving ----------

export function toProduct(record: ProductRecord): Product {
  return {
    id: record.id,
    categoryId: record.category_id,
    name: record.name,
    description: record.description,
    price: record.price,
    stockQuantity: record.stock_quantity,
    isDeleted: record.is_delete,
    createdAt: record.created_at,
    imageUrl: null,
  };
}

export function toCategory(record: CategoryRecord): Category {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
  };
}

export function toOrder(record: OrderRecord): Order {
  return {
    id: record.id,
    userId: record.user_id,
    status: record.status,
    totalPrice: record.total_price,
    isDeleted: record.is_delete,
    createdAt: record.created_at,
  };
}

export function availabilityOf(product: Product): Availability {
  if (product.stockQuantity <= 0) return { kind: 'out-of-stock' };
  if (product.stockQuantity <= LOW_STOCK_THRESHOLD) {
    return { kind: 'low-stock', quantity: product.stockQuantity };
  }
  return { kind: 'in-stock', quantity: product.stockQuantity };
}
