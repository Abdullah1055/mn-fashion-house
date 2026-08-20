import type { Metadata } from "next";

import "./globals.css";

import { CartProvider } from "@/components/cart/cart-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

type RootLayoutProps = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "MN Fashion House",
  description: "Premium Fashion Ecommerce",
};

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header />

          {children}

          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}