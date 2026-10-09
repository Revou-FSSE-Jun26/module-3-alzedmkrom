// lib/format.ts
//
// Display formatters for the two values that need locale-aware shaping:
//   - rupiah prices, which arrive as JSON floats (e.g. 850000.0)
//   - order timestamps, which arrive as ISO 8601 strings with an offset
//
// Both use the Indonesian locale so the catalog reads naturally. The rupiah
// formatter drops the fraction digits, since the API's trailing `.0` is a
// serializer artifact rather than real cents.

// A single shared instance; constructing Intl formatters is comparatively
// expensive, so we build each one once at module load.
const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/**
 * Format a whole-rupiah amount, e.g. `850000.0` renders as `Rp 850.000`.
 * The id-ID locale uses `.` as the thousands separator.
 */
export function formatRupiah(value: number): string {
  return rupiahFormatter.format(value);
}

/**
 * Format an ISO 8601 timestamp (e.g. an order's `createdAt`) as a short
 * Indonesian date, e.g. `30 Sep 2026`. Returns an em dash for input that
 * cannot be parsed, so an unexpected value never throws in the UI.
 */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.format(date);
}
