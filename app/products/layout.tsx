// app/products/layout.tsx
//
// Nested layout for the products segment. A server component — it holds no
// state and uses no hooks. The page chrome (Header, Footer) comes from the
// root layout, so this layout only wraps the segment's own content.
//
// It mounts <LayoutMountProbe />, a client island that logs once on mount.
// Since a layout stays mounted across navigation within its segment, moving
// /products -> /products/[id] and back logs exactly once, proving the layout
// does not remount.

import LayoutMountProbe from "@/components/LayoutMountProbe";

// The generated LayoutProps<"/products"> helper is only available once the
// segment has a page.tsx (added in a later task), so this layout uses the
// explicit children type until the route type exists.
export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LayoutMountProbe label="products layout" />
      {children}
    </>
  );
}
