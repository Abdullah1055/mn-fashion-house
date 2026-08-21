import { notFound } from "next/navigation";

import { MainCategoryForm } from "@/components/category/main-category-form";
import { getCategoryById } from "@/lib/services/category.service";

export default async function EditMainCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  /*
   * Main Category must be top-level.
   * A child category should not be editable
   * from this section.
   */
  if (category.parent_id !== null) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-200 to-indigo-50 px-8 py-7">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Edit Main Category
          </h1>

          <div className="mt-2 text-sm text-slate-500">
            Update main category information.
          </div>
        </div>
      </div>

      {/* Form */}
      <MainCategoryForm
        mode="edit"
        category={category}
      />
    </div>
  );
}