import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

import { Hero } from "@/features/home/components/hero";

import { FeaturedProducts } from "@/features/home/components/featured-products";

import { FeaturedCategories } from "@/features/home/components/featured-categories";

export default function HomePage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <Hero />

      <FeaturedCategories />

      <FeaturedProducts />

      <Footer />
    </>
  );
}