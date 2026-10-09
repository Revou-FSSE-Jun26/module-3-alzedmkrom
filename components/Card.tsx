// components/Card.tsx
//
// The shared card surface. Every card-shaped element in the app composes this
// wrapper so the border, radius, padding and shadow live in exactly one place.
// A server component: purely presentational, no state and no hooks.

import type { CardProps } from '@/lib/types';

// The surface style, written once as whole literal Tailwind strings so Tailwind
// can resolve them by scanning this source. Consumers extend via `className`.
const SURFACE =
  'rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/15 dark:bg-white/5';

export default function Card({ children, className }: CardProps) {
  const classes = [SURFACE, className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}
