// Catalog entry point.
//
// Task 8.2 rendered the full grid from typed data. Task 9.1 added live search:
// the query lives in CatalogState, an `input` listener updates it, and the grid
// re-renders from state on every change rather than mutating the DOM in place.
// Task 9.2 added the empty state. Task 9.3 adds the cart counter: `cart` lives
// in the same CatalogState as a CartLines record, per-card controls mutate a
// single line, and the header badge is recomputed from that state on every
// render, so the badge can never drift from the per-card counts.

import { CATEGORIES, PRODUCTS } from './data.js';
import { toProduct, toView } from './types.js';
import type { CartLines, CatalogState, ProductView } from './types.js';
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

// Product lookup by id, over the same visible (non-deleted) set the grid
// renders. The cart mutation handlers read `stockQuantity` from here to clamp
// increments, and a soft-deleted product is absent so it can never be added.
const PRODUCTS_BY_ID = new Map<number, ProductView>(
  VISIBLE_PRODUCTS.map((view) => [view.id, view]),
);

// --- cart state ---

// Total item count across all lines, recomputed from cart state with `reduce`.
// The header badge reads this on every render, so it cannot drift from the sum
// of the per-card counts.
function cartItemCount(cart: CartLines): number {
  return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
}

// Total rupiah across all lines: each line's quantity times its product price,
// summed with `reduce`. Lines whose product is missing contribute nothing.
function cartTotal(cart: CartLines): number {
  return Object.entries(cart).reduce((total, [id, quantity]) => {
    const product = PRODUCTS_BY_ID.get(Number(id));
    return product === undefined ? total : total + product.price * quantity;
  }, 0);
}

// Increment a line, clamped at the product's stockQuantity, so no line can be
// ordered beyond what the row says exists. An out-of-stock or unknown product
// is a no-op. Returns true when the cart actually changed.
function incrementLine(id: number): boolean {
  const product = PRODUCTS_BY_ID.get(id);
  if (product === undefined || product.stockQuantity <= 0) return false;
  const current = state.cart[id] ?? 0;
  if (current >= product.stockQuantity) return false;
  state.cart[id] = current + 1;
  return true;
}

// Decrement a line, clamped at zero: reaching zero removes the line entirely so
// no orphaned or negative quantity is reachable. Returns true when the cart
// actually changed.
function decrementLine(id: number): boolean {
  const current = state.cart[id] ?? 0;
  if (current <= 0) return false;
  if (current === 1) {
    delete state.cart[id];
  } else {
    state.cart[id] = current - 1;
  }
  return true;
}

// --- rendering ---

// The cart control block for one card. Two mutually exclusive states, chosen
// by the derived availability rather than by styling: an out-of-stock product
// renders a truly `disabled` add-to-cart button, and an in/low-stock product
// renders either an "Add to cart" button (when the line is absent or zero) or
// a stepper with minus/plus controls and the live per-card count.
//
// Every button carries a `data-action` and `data-id` so the delegated click
// handler on the grid can act on the right line without rebinding after a
// re-render. The icon-only minus and plus buttons carry an `aria-label`, since
// their glyph alone is not an accessible name.
function renderCartControls(view: ProductView, quantity: number): string {
  if (view.availability.kind === 'out-of-stock') {
    return `
      <button
        type="button"
        disabled
        aria-disabled="true"
        class="mt-1 inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400 cursor-not-allowed"
      >
        Out of stock
      </button>
    `;
  }

  if (quantity <= 0) {
    return `
      <button
        type="button"
        data-action="add-to-cart"
        data-id="${view.id}"
        class="group relative mt-1 w-full cursor-pointer overflow-hidden rounded-lg border border-[#a9c6ff] bg-gradient-to-b from-[#7aa5f4] via-[#4f7fe6] to-[#3563d4] py-3 font-semibold tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_5px_14px_rgba(37,99,235,0.35)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] before:absolute before:inset-x-0 before:top-0 before:h-1/2 before:bg-gradient-to-b before:from-white/35 before:to-transparent before:content-[''] hover:-translate-y-0.5 hover:border-white hover:brightness-110 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_24px_rgba(37,99,235,0.5),0_0_18px_rgba(147,197,253,0.45)] focus:outline-none focus:ring-2 focus:ring-white/70 active:translate-y-0 active:shadow-[inset_0_2px_5px_rgba(15,23,42,0.35)]"
      >
        <span class="relative z-10">Add to cart</span>
      </button>
    `;
  }

  return `
    <div class="mt-1 flex h-[52px] items-center justify-between gap-3 rounded-lg border border-[#a9c6ff] bg-white/50 px-3">
      <div class="flex items-center gap-2">
        <button
          type="button"
          data-action="decrement"
          data-id="${view.id}"
          aria-label="Remove one ${escapeHtml(view.name)}"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-lg font-semibold leading-none text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-revo-500"
        >
          &minus;
        </button>
        <span class="min-w-8 text-center text-sm font-semibold tabular-nums text-slate-900">
          ${quantity}
        </span>
        <button
          type="button"
          data-action="increment"
          data-id="${view.id}"
          aria-label="Add one ${escapeHtml(view.name)}"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-lg font-semibold leading-none text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-revo-500"
        >
          +
        </button>
      </div>
      <span class="text-xs font-medium text-slate-600">in cart</span>
    </div>
  `;
}

// One card's markup. Every class is a complete literal string, and the two
// data-driven class groups come from the styles.ts helpers which also return
// complete literals — nothing is assembled by interpolating into a class name.
// The cart control block is read from state (the current quantity for this
// product line) so the card count and the header badge share one source.
function renderCard(view: ProductView): string {
  const badgeClass = availabilityBadgeClass(view.availability);
  const badgeText = availabilityLabel(view.availability);
  const accentClass = categoryAccentClass(view.categoryId);
  const quantity = state.cart[view.id] ?? 0;

  return `
    <article data-card-id="${view.id}" class="flex flex-col gap-3 rounded-xl border-2 border-menu-border bg-gradient-to-br from-menu-from via-menu-via to-menu-to p-5 shadow-md transition-transform duration-150 ease-out hover:-translate-y-1 hover:border-ink hover:shadow-lg">
      <div class="flex items-center justify-between gap-2">
        <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${accentClass}">
          ${escapeHtml(view.category.name)}
        </span>
        <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${badgeClass}">
          ${escapeHtml(badgeText)}
        </span>
      </div>
      <h2 class="text-lg font-semibold leading-snug tracking-tight text-ink line-clamp-2">
        ${escapeHtml(view.name)}
      </h2>
      <p class="text-sm leading-relaxed text-menu-muted line-clamp-2">
        ${escapeHtml(view.description)}
      </p>
      <p class="mt-auto text-lg font-bold tabular-nums tracking-tight text-ink">
        ${escapeHtml(rupiah.format(view.price))}
      </p>
      <div data-cart-controls>${renderCartControls(view, quantity)}</div>
    </article>
  `;
}

// Result-count text for the status region, phrased for the count and pluralized.
function resultCountText(count: number): string {
  if (count === 0) return 'No products found';
  if (count === 1) return 'Showing 1 product';
  return `Showing ${count} products`;
}

// The empty state, rendered inside the grid when a query matches nothing. It
// spans every column with `col-span-full` so the grid stays intact and the
// layout never collapses. The searched term is echoed through escapeHtml, and
// the clear button carries `data-action="clear-search"` so the delegated click
// handler on the grid resets the query and re-renders the full list.
function renderEmptyState(query: string): string {
  return `
    <div class="col-span-full flex flex-col items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <p class="text-lg font-semibold text-slate-900">
        No products match "${escapeHtml(query.trim())}"
      </p>
      <p class="text-sm text-slate-600">
        Try a different search, or clear it to see the full catalog.
      </p>
      <button
        type="button"
        data-action="clear-search"
        class="inline-flex items-center rounded-lg bg-revo-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-revo-700 focus:outline-none focus:ring-2 focus:ring-revo-500"
      >
        Clear search
      </button>
    </div>
  `;
}

// The header badge text, recomputed from cart state on every render. Total
// items comes from `reduce` over the lines, and the rupiah total is appended so
// the badge reflects both count and value. Pluralized for the single-item case.
function cartBadgeText(cart: CartLines): string {
  const count = cartItemCount(cart);
  const noun = count === 1 ? 'item' : 'items';
  return `Cart: ${count} ${noun} · ${rupiah.format(cartTotal(cart))}`;
}

// Re-render the whole grid from state. Search is applied here, so the rendered
// card set is always the filter of the full list for state.query; the status
// region's count is updated to match what is shown; and the header badge is
// recomputed from cart state so it can never drift from the per-card counts.
function render(): void {
  const views = selectVisible(state.query);
  catalog.innerHTML =
    views.length === 0
      ? renderEmptyState(state.query)
      : views.map(renderCard).join('');
  status.textContent = resultCountText(views.length);
  cartBadge.textContent = cartBadgeText(state.cart);
}

// Update a single card's cart-control block in place, without rebuilding the
// grid. This keeps each <article> node alive across a cart click, so its hover
// state and transform are never reset - the source of the earlier wobble. Only
// the header badge and the changed card are touched.
function updateCard(id: number): void {
  const view = PRODUCTS_BY_ID.get(id);
  if (view === undefined) return;

  const card = catalog.querySelector<HTMLElement>(
    `[data-card-id="${id}"]`,
  );
  const controls = card?.querySelector<HTMLElement>('[data-cart-controls]');
  if (controls === undefined || controls === null) return;

  const quantity = state.cart[id] ?? 0;
  controls.innerHTML = renderCartControls(view, quantity);
  cartBadge.textContent = cartBadgeText(state.cart);
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
const cartBadge = requireElement<HTMLElement>('#cart-badge');

// Listen on `input`, not `keyup`, so paste and the native search clear button
// fire too. Each event updates state.query and re-renders from state rather
// than mutating the DOM in place.
searchInput.addEventListener('input', () => {
  state.query = searchInput.value;
  render();
});

// Announce a cart change through the existing status live region. Re-rendering
// replaces the region's result-count text, so the announcement is set after
// render() and reads the fresh line quantity from state.
function announceCartChange(id: number): void {
  const product = PRODUCTS_BY_ID.get(id);
  if (product === undefined) return;
  const quantity = state.cart[id] ?? 0;
  status.textContent =
    quantity === 0
      ? `Removed ${product.name} from cart`
      : `${product.name} in cart: ${quantity}`;
}

// One delegated click handler on the grid covers every dynamically created
// control, so nothing needs rebinding after a re-render. It dispatches on the
// nearest `[data-action]` ancestor: clear-search resets the query, and the
// three cart actions mutate the matching line and re-render from state. Only an
// action that actually changed the cart re-announces, so no-op clicks (e.g. at
// the stock ceiling) stay quiet.
catalog.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const control = target.closest<HTMLElement>('[data-action]');
  if (control === null) return;

  const action = control.dataset.action;

  if (action === 'clear-search') {
    state.query = '';
    searchInput.value = '';
    render();
    return;
  }

  const id = Number(control.dataset.id);
  if (Number.isNaN(id)) return;

  let changed = false;
  if (action === 'add-to-cart' || action === 'increment') {
    changed = incrementLine(id);
  } else if (action === 'decrement') {
    changed = decrementLine(id);
  }

  if (!changed) return;
  // Update only this card's controls, not the whole grid, so the <article>
  // node survives and its hover/transform state is never reset mid-click.
  updateCard(id);
  announceCartChange(id);
});

render();
