'use client';

// components/AddToCartButton.tsx
//
// A client component that adds a product to the cart. It calls useCart().addItem,
// toasts success, and is disabled when the product is out of stock.
//
// Adding to the cart requires login: logged-out visitors see a "Log in to add
// to cart" link instead of the button, so the cart is gated at the point of
// action rather than only at checkout.
//
// Props:
//   product: the Product to add
//   quantity: the number to add (default 1)
//   label: button text override (default "Add to cart")
//   onSuccess: optional callback after successful add (for form reset, etc.)

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { getButtonClasses } from '@/lib/productStyles';
import { toastSuccess } from '@/lib/toast';
import type { Product } from '@/lib/types';

export interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  label?: string;
  onSuccess?: () => void;
}

export default function AddToCartButton({
  product,
  quantity = 1,
  label = 'Add to cart',
  onSuccess,
}: AddToCartButtonProps) {
  const cart = useCart();
  const { user, isLoading } = useAuth();

  const isOutOfStock = product.stockQuantity === 0;

  const handleAddToCart = () => {
    cart.addItem(product, quantity);
    toastSuccess(`${product.name} added to cart`);
    onSuccess?.();
  };

  // While the session is restoring, render nothing to avoid flashing the login
  // prompt at a user who is actually signed in.
  if (isLoading) {
    return null;
  }

  // Logged out: gate the action behind sign-in.
  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-md border border-black/15 bg-white px-4 py-2 text-center text-sm font-semibold text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
      >
        Log in to add to cart
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={isOutOfStock}
      className={getButtonClasses(!isOutOfStock)}
    >
      {isOutOfStock ? 'Out of stock' : label}
    </button>
  );
}
