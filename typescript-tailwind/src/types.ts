// --- categories table ---

// Numeric literal union - mirrors categories.id
export type CategoryId = 1 | 2 | 3 | 4;

// String literal union - mirrors categories.name verbatim
export type CategoryName = 'Apparel' | 'Footwear' | 'Accessories' | 'Bags';

export interface Category {
  id: CategoryId;
  name: CategoryName;
  description: string;
}

// Typed lookup keyed by the id union - every id must have an entry
export type CategoryLookup = Record<CategoryId, Category>;

// --- products table ---

// The wire shape: products columns exactly as a JSON API serializes them.
export interface ProductRecord {
  id: number;
  category_id: CategoryId;
  name: string;
  description: string;
  price: number;           // whole rupiah, no decimals
  stock_quantity: number;
  created_at: string;      // ISO 8601 with offset, e.g. '2026-08-14T18:44:04.027+07:00'
  is_delete: boolean;      // soft-delete flag
}

// The app model: same data, idiomatic TypeScript naming.
export interface Product {
  id: number;
  categoryId: CategoryId;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  createdAt: string;
  isDeleted: boolean;
}

// Derived from stock_quantity, never stored on the product.
export type Availability =
  | { kind: 'in-stock'; quantity: number }
  | { kind: 'low-stock'; quantity: number }
  | { kind: 'out-of-stock' };

// What the renderer consumes: a product joined with its category and
// its computed availability. Nested typed objects, the same shape an
// expanded API response would return.
export interface ProductView extends Product {
  category: Category;
  availability: Availability;
}

export type ProductList = Product[];              // typed array of typed objects
export type CartLines = Record<number, number>;   // product id to quantity

export interface CatalogState {
  query: string;
  cart: CartLines;
}

// --- mapping and deriving functions ---

// The single snake_case (wire) to camelCase (app model) seam.
export function toProduct(record: ProductRecord): Product {
  return {
    id: record.id,
    categoryId: record.category_id,
    name: record.name,
    description: record.description,
    price: record.price,
    stockQuantity: record.stock_quantity,
    createdAt: record.created_at,
    isDeleted: record.is_delete,
  };
}

// At or below this quantity a product is low-stock; at or below zero it is out.
export const LOW_STOCK_THRESHOLD = 5;

// Availability is derived from stock, never stored on the product.
export function availabilityOf(product: Product): Availability {
  if (product.stockQuantity <= 0) return { kind: 'out-of-stock' };
  if (product.stockQuantity <= LOW_STOCK_THRESHOLD) {
    return { kind: 'low-stock', quantity: product.stockQuantity };
  }
  return { kind: 'in-stock', quantity: product.stockQuantity };
}

// Join a product with its category and computed availability for rendering.
export function toView(product: Product, categories: CategoryLookup): ProductView {
  return {
    ...product,
    category: categories[product.categoryId],
    availability: availabilityOf(product),
  };
}
