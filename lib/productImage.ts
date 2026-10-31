// lib/productImage.ts
//
// The backend products table has no image column, so the frontend assigns each
// product an image for display.
//
// Products with a curated local photo (stored under public/products/) are
// mapped explicitly by id in PRODUCT_IMAGES. Everything else falls back to
// picsum.photos — a free placeholder photo service that needs no API key and no
// attribution — seeded by the product id so a given product always resolves to
// the same photo.
//
// If/when the backend adds a real image column, replace the call site in
// toProduct() with the record's own URL and delete this helper.

// Curated local images, keyed by product id. Files live in public/products/
// and are served from the site root (e.g. /products/nike-air-max.jpg).
const PRODUCT_IMAGES: Record<number, string> = {
  // Nike Air Max Running Shoes
  // Photo by Mojtaba Mosayebzadeh on Unsplash.
  1: '/products/nike-air-max.jpg',
};

/**
 * Returns an image URL for a product id: the curated local photo when one
 * exists, otherwise a deterministic picsum placeholder.
 *
 * @param id - the product id
 * @param width - placeholder width in px (default 600)
 * @param height - placeholder height in px (default 450, a 4:3 ratio that
 *   matches the card's aspect-4/3 image slot). Ignored for local images.
 */
export function productImageUrl(
  id: number,
  width = 600,
  height = 450,
): string {
  return (
    PRODUCT_IMAGES[id] ??
    `https://picsum.photos/seed/revogarb-${id}/${width}/${height}`
  );
}
