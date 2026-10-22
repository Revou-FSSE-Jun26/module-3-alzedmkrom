import { useContext } from 'react';

import { CartContext } from '@/context/CartContext';

/**
 * Reads the cart from CartContext. Throws if used outside a CartProvider.
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error(
      'useCart() must be used inside a CartProvider. ' +
        'Wrap your component tree with CartProvider in the root layout.',
    );
  }
  return context;
}
