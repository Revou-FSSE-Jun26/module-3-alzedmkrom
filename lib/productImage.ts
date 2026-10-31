// lib/productImage.ts
//
// The backend products table has no image column, so the frontend assigns each
// product a stable image for display. Images come from picsum.photos — a free
// placeholder photo service that needs no API key and no attribution.
//
// The URL is seeded with the product id (`/seed/<id>/...`), so a given product
// always resolves to the same photo across reloads and devices, rather than a
// random one each time. This keeps the catalog visually stable.
//
// If/when the backend adds a real image column, replace the call site in
// toProduct() with the record's own URL and delete this helper.

/**
 * Returns a deterministic placeholder image URL for a product id.
 *
 * @param id - the product id used as the image seed
 * @param width - requested image width in px (default 600)
 * @param height - requested image height in px (default 450, a 4:3 ratio that
 *   matches the card's aspect-4/3 image slot)
 */
export function productImageUrl(
  id: number,
  width = 600,
  height = 450,
): string {
  return `https://picsum.photos/seed/revogarb-${id}/${width}/${height}`;
}
