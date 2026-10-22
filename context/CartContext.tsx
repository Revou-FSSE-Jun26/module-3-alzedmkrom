'use client';

// context/CartContext.tsx
//
// CartProvider owns the shopping cart — a list of items held in state and
// mirrored to localStorage on every change. Read the cart through useCart().
//
// Every cart operation returns a new array, never mutating the current list
// in place. This ensures React sees a fresh reference and derived totals
// recompute on render. Totals (totalItems, totalPrice) are derived on every
// render with reduce, never stored, so they cannot drift from the visible
// rows.

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import { isCartItemArray, readJson, writeJson } from '@/lib/storage';
import { CART_KEY } from '@/lib/types';
import type { CartItem, Product } from '@/lib/types';

export interface CartContextValue {
  /** The current cart lines. */
  items: CartItem[];
  /**
   * Adds a product to the cart, or increases an existing line's quantity.
   * Quantity is clamped to the product's stockQuantity, so the cart never
   * requests more than available.
   */
  addItem: (product: Product, quantity: number) => void;
  /** Removes a line by productId. */
  removeItem: (productId: number) => void;
  /** Empties the cart entirely. */
  clear: () => void;
  /** Total item count (sum of quantities). */
  totalItems: number;
  /** Total price (sum of line totals). */
  totalPrice: number;
  /** True when the cart holds no items. */
  isEmpty: boolean;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize items from storage using a lazy initializer so the read
  // happens once at mount time, not on every render. This avoids setState
  // synchronously within an effect.
  const [items, setItems] = useState<CartItem[]>(() => {
    const persisted = readJson(CART_KEY, isCartItemArray);
    return persisted ?? [];
  });

  // Whenever items change, persist the new state to localStorage. This runs
  // after every render, so the cart always survives a page reload.
  useEffect(() => {
    writeJson(CART_KEY, items);
  }, [items]);

  const addItem = useCallback((product: Product, quantity: number) => {
    setItems((current) => {
      // Clamp the requested quantity to available stock.
      const requestedQty = Math.max(1, Math.floor(quantity));
      const maxQty = Math.min(requestedQty, product.stockQuantity);

      // Check if this product is already in the cart.
      const existingIndex = current.findIndex(
        (item) => item.productId === product.id,
      );

      if (existingIndex >= 0) {
        // Line exists: increase its quantity, clamped to stock.
        const existing = current[existingIndex];
        const newQty = Math.min(existing.quantity + maxQty, product.stockQuantity);
        return [
          ...current.slice(0, existingIndex),
          { ...existing, quantity: newQty },
          ...current.slice(existingIndex + 1),
        ];
      }

      // Line does not exist: add a new one, creating a CartItem snapshot.
      const newLine: CartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: maxQty,
        stockQuantity: product.stockQuantity,
      };

      return [...current, newLine];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  // Derived totals: computed on every render so they cannot drift from the
  // visible lines. If a product's catalogue price changes after it was added,
  // the cart snapshot keeps the old price and the total reflects what the
  // customer will actually pay.
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const isEmpty = items.length === 0;

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      clear,
      totalItems,
      totalPrice,
      isEmpty,
    }),
    [items, addItem, removeItem, clear, totalItems, totalPrice, isEmpty],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}
