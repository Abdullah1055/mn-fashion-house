import { AnnouncementBar } from "@/components/layout/announcement-bar";

import { Hero } from "@/features/home/components/hero";
import { FeaturedCategories } from "@/features/home/components/featured-categories";

export default function HomePage() {
  return (
    <>
      <AnnouncementBar />

      <Hero />

      <FeaturedCategories />

    </>
  );
}