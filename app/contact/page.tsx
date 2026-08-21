import { ContactHero } from "@/features/contact/components/contact-hero";
import { ContactInfo } from "@/features/contact/components/contact-info";
import { ContactForm } from "@/features/contact/components/contact-form";
import { ContactCTA } from "@/features/contact/components/contact-cta";

export default function ContactPage() {
  return (
    <>
      <ContactHero />

      <ContactInfo />

      <ContactForm />

      <ContactCTA />
    </>
  );
}