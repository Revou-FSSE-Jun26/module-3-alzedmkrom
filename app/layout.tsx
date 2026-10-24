import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RevoShop",
  description:
    "RevoShop storefront — browse products, categories and orders, served live from the RevoShop API.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const saved = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = saved === 'dark' || (saved === null && prefersDark);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="flex min-h-dvh flex-col">
        {/*
          AuthProvider wraps the whole app so Header and every route can read
          the session through useAuth(). CartProvider nests inside this provider,
          so logout can clear the cart via the auth event.
          
          Toaster is a single-instance notification system. It must be inside
          the providers but outside the page content so it renders above
          everything else.
        */}
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex flex-1 flex-col">{children}</main>
            <Footer />
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
