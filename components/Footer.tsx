// components/Footer.tsx
//
// The application footer. A server component — purely presentational, no state
// and no hooks. Pushed to the bottom by the flex-column body in the root layout.

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-black/10 bg-white dark:border-white/15 dark:bg-black">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-black/60 dark:text-white/60">
        <p>&copy; {year} RevoShop. Built for Module 3, Checkpoint 2.</p>
      </div>
    </footer>
  );
}
