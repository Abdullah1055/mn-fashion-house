import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { getPromotionalBannerById } from "@/lib/services/promotional-banner.service";

import { PromotionalBannerForm } from "@/components/offers/promotional-banner-form";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPromotionalBannerPage({
  params,
}: Props) {
  const { id } = await params;

  const banner =
    await getPromotionalBannerById(id);

  if (!banner) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/offers/banners"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-neutral-900"
      >
        <ArrowLeft size={16} />
        Back to Promotional Banners
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-neutral-900">
          Edit Promotional Banner
        </h1>

        <p className="mt-1 text-sm text-neutral-500">
          Update the promotional banner for
          the homepage.
        </p>
      </div>

      <PromotionalBannerForm
        mode="edit"
        banner={banner}
      />
    </div>
  );
}