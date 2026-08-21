import Link from "next/link";
import { ListTree } from "lucide-react";

import { MainCategoryForm } from "@/components/category/main-category-form";

export default function NewMainCategoryPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-200 to-indigo-50 px-8 py-7">
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm">
            <ListTree className="h-7 w-7 text-blue-600" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Add Main Category
            </h1>

            <div className="mt-2 flex items-center gap-2 text-sm">
              <Link
                href="/admin/dashboard"
                className="text-slate-600 hover:text-blue-600"
              >
                Dashboard
              </Link>

              <span className="text-slate-400">›</span>

              <Link
                href="/admin/main-categories"
                className="text-slate-600 hover:text-blue-600"
              >
                Main Categories
              </Link>

              <span className="text-slate-400">›</span>

              <span className="font-medium text-blue-600">
                Add Main Category
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <MainCategoryForm />
    </div>
  );
}