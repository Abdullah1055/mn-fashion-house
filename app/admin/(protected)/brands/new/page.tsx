import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BrandForm } from "@/components/brands/brand-form";

export default function NewBrandPage() {
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
          Add Brand
        </h1>

        <p className="mt-2 text-neutral-500">
          Create a new product brand.
        </p>
      </div>

      <BrandForm />
    </div>
  );
}