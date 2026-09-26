/* ==========================================================================
   Order Lines — Array Methods exercise (Task 5.1)

   This task seeds the data and the formatting helper only. The four array
   operations — forEach, map, filter and reduce — plus their rendering and
   console output are added in Task 5.2.

   Theme: order line items built from the ten real RevoShop products, so the
   numbers stay familiar across the exercises and foreshadow the catalog.

   Classic (non-module) script loaded with `defer` from array-methods.html, so
   it runs after the DOM is parsed and works over the file:// protocol.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Seed data — order lines drawn from the real RevoShop products. Categories
   are spelled exactly as the database stores them (Apparel, Footwear,
   Accessories, Bags); prices are whole rupiah integers (no decimals); every
   line has a distinct id and a quantity of at least 1. Categories and
   quantities are varied so filter/reduce produce interesting results
   (Requirement 4.1).
   -------------------------------------------------------------------------- */

/**
 * The order lines to process. Each element has the shape:
 * @type {{ id: number, product: string, category: string, price: number, qty: number }[]}
 */
const orderLines = [
  { id: 1, product: 'Nike Air Max Running Shoes', category: 'Footwear',    price: 850000, qty: 1 },
  { id: 2, product: 'Plain Cotton Combed T-Shirt', category: 'Apparel',    price:  75000, qty: 3 },
  { id: 3, product: 'Sports Socks 3-Pack',         category: 'Footwear',    price:  55000, qty: 2 },
  { id: 4, product: 'Waterproof Backpack',         category: 'Bags',        price: 320000, qty: 1 },
  { id: 5, product: 'UV400 Sunglasses',            category: 'Accessories', price: 135000, qty: 2 },
  { id: 6, product: 'Fleece Jogger Pants',         category: 'Apparel',     price: 195000, qty: 2 },
  { id: 7, product: 'Digital Sports Watch',        category: 'Accessories', price: 275000, qty: 1 },
];

/* --------------------------------------------------------------------------
   Formatting helper — keeps money output readable across every section.
   -------------------------------------------------------------------------- */

/**
 * Format a whole-rupiah integer as Indonesian Rupiah, with no fraction digits
 * (Rupiah has no minor unit in everyday pricing). Uses Intl.NumberFormat so the
 * grouping and currency symbol are locale-correct.
 *
 * @param {number} amount - a whole-rupiah integer amount
 * @returns {string} e.g. formatIDR(850000) -> "Rp 850.000"
 */
function formatIDR(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/* --------------------------------------------------------------------------
   Small DOM helpers — keep rendering safe and consistent.

   We build table rows with createElement/textContent (never innerHTML) so no
   product name or category can ever be interpreted as markup. For the simpler
   text sections we set textContent on freshly created nodes, which is safe by
   construction for the same reason.
   -------------------------------------------------------------------------- */

/**
 * Create an element, optionally set its text, and return it.
 * @param {string} tag - the element tag name, e.g. 'tr' or 'p'
 * @param {string} [text] - text content assigned via textContent (never innerHTML)
 * @returns {HTMLElement}
 */
function el(tag, text) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  return node;
}

/* ==========================================================================
   Task 5.2 — the four array operations, each rendered AND logged so the
   behavior is observable (Requirement 4.6).
   ========================================================================== */

/* --------------------------------------------------------------------------
   forEach — one table row per order line (Requirement 4.2).

   forEach RETURNS undefined; it exists purely for its side effect (here,
   appending rows to the DOM). We build each <tr> with createElement and
   textContent so product/category strings are inserted as text, never markup.
   -------------------------------------------------------------------------- */
const orderTableBody = document.getElementById('order-table-body');

orderLines.forEach((line) => {
  const row = el('tr');
  row.append(
    el('td', String(line.id)),
    el('td', line.product),
    el('td', line.category),
    el('td', formatIDR(line.price)),
    el('td', String(line.qty)),
  );
  orderTableBody.append(row);
});
// forEach returned undefined; we kept it only for the DOM side effect above.
console.log('forEach: appended', orderLines.length, 'rows to #order-table-body');

/* --------------------------------------------------------------------------
   map — a NEW array of display rows (Requirement 4.3).

   map RETURNS A NEW ARRAY OF THE SAME LENGTH as the source; it does not mutate
   `orderLines`. Each element becomes a { label, subtotal } object where the
   subtotal (price * qty) is pre-formatted with formatIDR.
   -------------------------------------------------------------------------- */
const displayRows = orderLines.map((line) => ({
  label: `${line.product} \u00d7 ${line.qty}`, // "\u00d7" is the multiplication sign
  subtotal: formatIDR(line.price * line.qty),
}));

const mapOutput = document.getElementById('map-output');
const mapList = el('ul');
displayRows.forEach((rowData) => {
  mapList.append(el('li', `${rowData.label} — ${rowData.subtotal}`));
});
mapOutput.append(mapList);
console.log('map: new array of', displayRows.length, 'display rows', displayRows);

/* --------------------------------------------------------------------------
   filter — used TWICE (Requirement 4.4).

   filter RETURNS A SAME-OR-SHORTER ARRAY OF THE SAME ELEMENT TYPE (here, order
   lines); it selects a subset without transforming the elements themselves.
   -------------------------------------------------------------------------- */
const PRICE_THRESHOLD = 200000;
const CATEGORY_OF_INTEREST = 'Footwear';

// (1) Lines whose unit price is above a threshold.
const expensiveLines = orderLines.filter((line) => line.price > PRICE_THRESHOLD);

// (2) Lines belonging to a single category.
const footwearLines = orderLines.filter((line) => line.category === CATEGORY_OF_INTEREST);

const filterOutput = document.getElementById('filter-output');

filterOutput.append(el('h3', `Unit price above ${formatIDR(PRICE_THRESHOLD)}`));
const expensiveList = el('ul');
expensiveLines.forEach((line) => {
  expensiveList.append(el('li', `${line.product} — ${formatIDR(line.price)}`));
});
filterOutput.append(expensiveList);

filterOutput.append(el('h3', `Category: ${CATEGORY_OF_INTEREST}`));
const footwearList = el('ul');
footwearLines.forEach((line) => {
  footwearList.append(el('li', `${line.product} (qty ${line.qty})`));
});
filterOutput.append(footwearList);

console.log('filter #1 (price >', PRICE_THRESHOLD + '):', expensiveLines);
console.log('filter #2 (category ===', CATEGORY_OF_INTEREST + '):', footwearLines);

/* --------------------------------------------------------------------------
   reduce — used TWICE (Requirement 4.5).

   reduce collapses an array to a single accumulator. THE ACCUMULATOR NEED NOT
   BE A NUMBER: the first reduce below aggregates to a number (grand total),
   the second aggregates to an OBJECT (per-category subtotals).
   -------------------------------------------------------------------------- */

// (1) Grand total — accumulator is a number, seeded with 0.
const grandTotal = orderLines.reduce(
  (runningTotal, line) => runningTotal + line.price * line.qty,
  0,
);

// (2) Per-category subtotals — accumulator is an OBJECT, seeded with {}.
const subtotalsByCategory = orderLines.reduce((totals, line) => {
  const lineTotal = line.price * line.qty;
  totals[line.category] = (totals[line.category] || 0) + lineTotal;
  return totals;
}, {});

const reduceOutput = document.getElementById('reduce-output');

reduceOutput.append(el('h3', 'Grand total'));
reduceOutput.append(el('p', formatIDR(grandTotal)));

reduceOutput.append(el('h3', 'Per-category subtotals (accumulator is an object)'));
const categoryList = el('ul');
Object.keys(subtotalsByCategory).forEach((category) => {
  categoryList.append(el('li', `${category}: ${formatIDR(subtotalsByCategory[category])}`));
});
reduceOutput.append(categoryList);

console.log('reduce #1 (grand total, a number):', grandTotal, '=', formatIDR(grandTotal));
console.log('reduce #2 (per-category subtotals, an object):', subtotalsByCategory);

// Grand-total cross-check (by hand against the seed data):
//   850000*1 = 850000
//    75000*3 = 225000
//    55000*2 = 110000
//   320000*1 = 320000
//   135000*2 = 270000
//   195000*2 = 390000
//   275000*1 = 275000
//   ---------------------
//   sum       = 2440000  -> formatIDR(2440000) === "Rp 2.440.000"
console.assert(grandTotal === 2440000, 'Grand total should be 2,440,000');

/* --------------------------------------------------------------------------
   Composition — filter().map().reduce() chained ONCE (Requirement 4.5/4.6).

   Total spend on lines priced above the threshold: keep the expensive lines,
   map each to its line subtotal, then reduce those numbers to one total.
   -------------------------------------------------------------------------- */
const expensiveSpend = orderLines
  .filter((line) => line.price > PRICE_THRESHOLD)
  .map((line) => line.price * line.qty)
  .reduce((total, subtotal) => total + subtotal, 0);

reduceOutput.append(el('h3', `Chained filter().map().reduce() — spend on lines above ${formatIDR(PRICE_THRESHOLD)}`));
reduceOutput.append(el('p', formatIDR(expensiveSpend)));

console.log('chain filter().map().reduce():', expensiveSpend, '=', formatIDR(expensiveSpend));
