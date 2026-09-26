// Catalog entry point.
//
// Task 8.2 scope: render the full product card grid from typed data using
// Tailwind utility classes only. Live search, the cart counter, and the empty
// state are separate tasks (9.x). The code is built around a single CatalogState
// plus a re-render function so those can be layered in without restructuring.

import { CATEGORIES, PRODUCTS } from './data.js';
import { toProduct, toView } from './types.js';
import type { CatalogState, ProductView } from './types.js';
import {
  availabilityBadgeClass,
  availabilityLabel,
  categoryAccentClass,
} from './styles.js';

// --- helpers ---

// Throws a clear message when an expected element is missing and returns a
// non-nullable element, so a null never propagates into a vague runtime error.
function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (element === null) {
    throw new Error(`Expected element "${selector}" was not found in the DOM.`);
  }
  return element;
}

// Escapes text before it is interpolated into an HTML template string, so
// product copy can never break out of its element or inject markup.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Whole-rupiah formatter: id-ID locale, IDR currency, no fraction digits.
const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

// --- data selection ---

// The full visible list: map wire records to the app model, drop soft-deleted
// rows, then join each to its category and computed availability for rendering.
const VISIBLE_PRODUCTS: ProductView[] = PRODUCTS.map(toProduct)
  .filter((product) => !product.isDeleted)
  .map((product) => toView(product, CATEGORIES));

// --- rendering ---

// One card's markup. Every class is a complete literal string, and the two
// data-driven class groups come from the styles.ts helpers which also return
// complete literals — nothing is assembled by interpolating into a class name.
function renderCard(view: ProductView): string {
  const badgeClass = availabilityBadgeClass(view.availability);
  const badgeText = availabilityLabel(view.availability);
  const accentClass = categoryAccentClass(view.categoryId);

  return `
    <article class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between gap-2">
        <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${accentClass}">
          ${escapeHtml(view.category.name)}
        </span>
        <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${badgeClass}">
          ${escapeHtml(badgeText)}
        </span>
      </div>
      <h2 class="text-lg font-semibold leading-snug tracking-tight text-slate-900 line-clamp-2">
        ${escapeHtml(view.name)}
      </h2>
      <p class="text-sm leading-relaxed text-slate-600 line-clamp-2">
        ${escapeHtml(view.description)}
      </p>
      <p class="mt-auto text-lg font-bold tabular-nums tracking-tight text-revo-700">
        ${escapeHtml(rupiah.format(view.price))}
      </p>
    </article>
  `;
}

// Re-render the whole grid from the current visible set. Task 9.x will filter
// this list by state.query before rendering and branch to an empty state.
function render(catalog: HTMLElement, views: ProductView[]): void {
  catalog.innerHTML = views.map(renderCard).join('');
}

// --- bootstrap ---

// Single source of truth. Only `query` and `cart` live here; task 8.2 renders
// the full list, tasks 9.x read from this state on each render.
const state: CatalogState = {
  query: '',
  cart: {},
};

const catalog = requireElement<HTMLElement>('#catalog');
render(catalog, VISIBLE_PRODUCTS);

console.info(`RevoShop catalog rendered ${VISIBLE_PRODUCTS.length} products.`, state.query);
