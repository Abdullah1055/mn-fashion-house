import { notFound } from "next/navigation";

import { CategoryForm } from "@/components/category/category-form";
import {
  getCategoryById,
  getParentCategories,
} from "@/lib/services/category.service";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [category, parentCategories] =
    await Promise.all([
      getCategoryById(id),
      getParentCategories(),
    ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Edit Category
        </h1>

        <p className="text-neutral-500">
          Update category information.
        </p>
      </div>

      <CategoryForm
        mode="edit"
        category={category}
        parentCategories={parentCategories}
      />
    </div>
  );
}