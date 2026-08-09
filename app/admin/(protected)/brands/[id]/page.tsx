import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getBrandById } from "@/lib/services/brand.service";

import { BrandEditForm } from "@/components/brands/brand-edit-form";

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const brand = await getBrandById(id);

  if (!brand) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/brands"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft size={16} />
          Back to Brands
        </Link>

        <h1 className="mt-4 text-3xl font-bold">
          Edit Brand
        </h1>

        <p className="mt-2 text-neutral-500">
          Update brand information.
        </p>
      </div>

      <BrandEditForm brand={brand} />
    </div>
  );
}