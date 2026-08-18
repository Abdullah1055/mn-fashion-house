import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

import { PromotionalBanner } from "@/components/promotional-banner";

import { getActivePromotionalBanner } from "@/lib/services/promotional-banner.service";

import { Hero } from "@/features/home/components/hero";

import { FeaturedProducts } from "@/features/home/components/featured-products";

import { FeaturedCategories } from "@/features/home/components/featured-categories";

export default async function HomePage() {
  const promotionalBanner =
    await getActivePromotionalBanner();

  return (
    <>
      <AnnouncementBar />

      <Header />

      {/* Promotional Banner */}

      {promotionalBanner && (
        <PromotionalBanner
          banner={promotionalBanner}
        />
      )}

      {/* Existing Homepage */}

      <Hero />

      <FeaturedCategories />

      <FeaturedProducts />

      <Footer />
    </>
  );
}