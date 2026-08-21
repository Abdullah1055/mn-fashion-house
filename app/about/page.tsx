import { AboutHero } from "@/features/about/components/about-hero";
import { BrandStory } from "@/features/about/components/brand-story";
import { BrandValues } from "@/features/about/components/brand-values";
import { ShoppingExperience } from "@/features/about/components/shopping-experience";
import { AboutCTA } from "@/features/about/components/about-cta";

export default function AboutPage() {
  return (
    <>
      <AboutHero />

      <BrandStory />

      <BrandValues />

      <ShoppingExperience />

      <AboutCTA />
    </>
  );
}