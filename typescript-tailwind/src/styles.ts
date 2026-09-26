// Maps typed product fields to Tailwind utility class strings.
//
// Every class here is a COMPLETE LITERAL STRING. Tailwind v4 finds classes by
// scanning source text, so a class name assembled by interpolating a variable
// (e.g. `bg-${color}-100`) is invisible to the scanner and produces no CSS.
// The switch/Record indirection selects between whole literal strings — the
// literals themselves are always written out in full.

import type { Availability, CategoryId } from './types.js';

// Badge background/text/ring classes for each availability variant. The `default`
// branch assigns to `const exhaustive: never`, so adding a new Availability kind
// without handling it here breaks the build.
export function availabilityBadgeClass(availability: Availability): string {
  switch (availability.kind) {
    case 'in-stock':
      return 'bg-emerald-100 text-emerald-800 ring-emerald-200';
    case 'low-stock':
      return 'bg-amber-100 text-amber-800 ring-amber-200';
    case 'out-of-stock':
      return 'bg-rose-100 text-rose-800 ring-rose-200';
    default: {
      const exhaustive: never = availability; // compile-time completeness check
      return exhaustive;
    }
  }
}

// Display text for each availability variant. `quantity` is read only in the
// two branches where the discriminated union actually carries it.
export function availabilityLabel(availability: Availability): string {
  switch (availability.kind) {
    case 'in-stock':
      return `In stock (${availability.quantity})`;
    case 'low-stock':
      return `Only ${availability.quantity} left`;
    case 'out-of-stock':
      return 'Out of stock';
    default: {
      const exhaustive: never = availability; // compile-time completeness check
      return exhaustive;
    }
  }
}

// Accent chip classes per category id. Typed as Record<CategoryId, string>, so
// every id in the union must have an entry — miss one and the build fails.
const CATEGORY_ACCENT: Record<CategoryId, string> = {
  1: 'bg-violet-50 text-violet-700 ring-violet-200', // Apparel
  2: 'bg-cyan-50 text-cyan-700 ring-cyan-200', // Footwear
  3: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200', // Accessories
  4: 'bg-orange-50 text-orange-700 ring-orange-200', // Bags
};

export function categoryAccentClass(categoryId: CategoryId): string {
  return CATEGORY_ACCENT[categoryId];
}
