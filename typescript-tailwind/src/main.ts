// Catalog entry point.
//
// Task 8.2 rendered the full grid from typed data. Task 9.1 adds live search:
// the query lives in CatalogState, an `input` listener updates it, and the grid
// re-renders from state on every change rather than mutating the DOM in place.
// The cart counter (9.3) and empty state (9.2) are still separate tasks; the
// code stays built around a single CatalogState plus a re-render function.

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

// Case-insensitive match across the name, description, and resolved category
// name. An empty or whitespace-only query matches everything. Search is a pure
// projection of the full list for the current query: same input, same output,
// with no card lost or duplicated across keystrokes.
function matchesQuery(view: ProductView, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (needle === '') return true;
  return (
    view.name.toLowerCase().includes(needle) ||
    view.description.toLowerCase().includes(needle) ||
    view.category.name.toLowerCase().includes(needle)
  );
}

// The visible set for a given query. Derived from VISIBLE_PRODUCTS on every
// render, so clearing the query restores the full list exactly.
function selectVisible(query: string): ProductView[] {
  return VISIBLE_PRODUCTS.filter((view) => matchesQuery(view, query));
}

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

// Result-count text for the status region, phrased for the count and pluralized.
// Task 9.2 will extend the zero case with an in-grid empty state.
function resultCountText(count: number): string {
  if (count === 0) return 'No products found';
  if (count === 1) return 'Showing 1 product';
  return `Showing ${count} products`;
}

// Re-render the whole grid from state. Search is applied here, so the rendered
// card set is always the filter of the full list for state.query, and the
// status region's count is updated on every render to match what is shown.
function render(): void {
  const views = selectVisible(state.query);
  catalog.innerHTML = views.map(renderCard).join('');
  status.textContent = resultCountText(views.length);
}

// --- bootstrap ---

// Single source of truth. Only `query` and `cart` live here; render() reads
// from this state on each call, and the input listener writes state.query.
const state: CatalogState = {
  query: '',
  cart: {},
};

const catalog = requireElement<HTMLElement>('#catalog');
const status = requireElement<HTMLElement>('#status');
const searchInput = requireElement<HTMLInputElement>('#search');

// Listen on `input`, not `keyup`, so paste and the native search clear button
// fire too. Each event updates state.query and re-renders from state rather
// than mutating the DOM in place.
searchInput.addEventListener('input', () => {
  state.query = searchInput.value;
  render();
});

render();
