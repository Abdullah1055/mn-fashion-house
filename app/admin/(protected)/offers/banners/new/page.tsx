import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PromotionalBannerForm } from "@/components/offers/promotional-banner-form";

export default function NewPromotionalBannerPage() {
  return (
    <div className="space-y-8">
      {/* Header */}

      <div>
        <Link
          href="/admin/offers/banners"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-neutral-900"
        >
          <ArrowLeft size={16} />
          Back to Promotional Banners
        </Link>

        <div className="mt-4">
          <h1 className="text-3xl font-bold text-neutral-900">
            Create Promotional Banner
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Create a promotional banner for the
            MN Fashion House homepage.
          </p>
        </div>
      </div>

      {/* Form */}

      <PromotionalBannerForm />
    </div>
  );
}