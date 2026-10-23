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

// GET /orders/:id returns the order WITH its line items (unlike the list,
// which returns headers only). Each item nests the full product plus the
// quantity ordered and the unit price captured at order time.
export interface OrderItemRecord {
  product: ProductRecord;
  quantity: number;
  unit_price: number; // JSON float
}

export interface OrderDetailRecord extends OrderRecord {
  items: OrderItemRecord[];
}

// The server only ever reports these two roles. Kept closed (no string
// fallback) because the UI routes on it and must not treat an unknown value
// as privileged.
export type Role = 'CUSTOMER' | 'ADMIN';

// The user object as it appears in auth responses (snake_case).
export interface UserRecord {
  id: number;
  username: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

// POST /auth/login returns a bearer token with a lifetime plus the user.
export interface LoginResponse {
  access_token: string;
  expires_in: number; // seconds until the token expires
  token_type: string;
  user: UserRecord;
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

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

// The whole authenticated session, persisted under a single storage key so a
// restore is one read and one JSON.parse — never a half-written set of fields.
export interface Session {
  token: string;
  user: User;
  // Absolute epoch ms, derived from LoginResponse.expires_in at login time, so
  // expiry survives reloads without re-reading a relative countdown.
  expiresAt: number;
}

// A cart line. price is a snapshot captured when the item was added, so a later
// catalogue price change never silently rewrites what the customer saw.
// stockQuantity is carried so the cart can clamp quantities without a refetch.
export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  stockQuantity: number;
}

export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  totalPrice: number;
  isDeleted: boolean;
  createdAt: string;
}

// Live data contains all five states below, not just 'PENDING' as Checkpoint 2
// modelled. Kept open with a string fallback so an unseen status renders
// instead of breaking the page.
export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED'
  | (string & {});

// One line of an order detail, in app-model shape.
export interface OrderItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  lineTotal: number; // unitPrice * quantity, computed in the mapper
}

export interface OrderDetail extends Order {
  items: OrderItem[];
}

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

// ---------- form state shapes ----------
//
// Every field is a string because that is what inputs produce; numeric fields
// are parsed only inside each form's validate(). FormErrors is generic so one
// error-map type serves every form, keyed to that form's own fields.

export interface RegisterFormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormState {
  email: string;
  password: string;
}

export interface ProductFormState {
  name: string;
  description: string;
  price: string; // raw input strings; parsed during validation
  stockQuantity: string;
  categoryId: string;
}

export interface CategoryFormState {
  name: string;
  description: string;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;

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

export function toUser(record: UserRecord): User {
  return {
    id: record.id,
    username: record.username,
    email: record.email,
    role: record.role,
    isActive: record.is_active,
    createdAt: record.created_at,
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

export function toOrderDetail(record: OrderDetailRecord): OrderDetail {
  return {
    ...toOrder(record),
    items: record.items.map((item) => ({
      product: toProduct(item.product),
      quantity: item.quantity,
      unitPrice: item.unit_price,
      lineTotal: item.unit_price * item.quantity,
    })),
  };
}

export function availabilityOf(product: Product): Availability {
  if (product.stockQuantity <= 0) return { kind: 'out-of-stock' };
  if (product.stockQuantity <= LOW_STOCK_THRESHOLD) {
    return { kind: 'low-stock', quantity: product.stockQuantity };
  }
  return { kind: 'in-stock', quantity: product.stockQuantity };
}

// ---------- storage keys ----------
//
// Namespaced so they never collide with another app sharing the origin's
// localStorage. The session is one key, so a restore is a single read.
export const SESSION_KEY = 'revoshop.session';
export const CART_KEY = 'revoshop.cart';
