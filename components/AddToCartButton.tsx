'use client';

// components/AddToCartButton.tsx
//
// A client component that adds a product to the cart. It calls useCart().addItem,
// toasts success, and is disabled when the product is out of stock. Adding to the
// cart does not require login — checkout is the gate — so visitors can build a
// cart before logging in.
//
// Props:
//   product: the Product to add
//   quantity: the number to add (default 1)
//   label: button text override (default "Add to cart")
//   onSuccess: optional callback after successful add (for form reset, etc.)

import { useCart } from '@/hooks/useCart';
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

  const isOutOfStock = product.stockQuantity === 0;

  const handleAddToCart = () => {
    cart.addItem(product, quantity);
    toastSuccess(`${product.name} added to cart`);
    onSuccess?.();
  };

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
