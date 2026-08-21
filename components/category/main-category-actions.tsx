"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

import { deleteMainCategory } from "@/lib/actions/main-category";

import { ConfirmDeleteButton } from "./confirm-delete-button";

type MainCategoryActionsProps = {
  id: string;
};

export function MainCategoryActions({
  id,
}: MainCategoryActionsProps) {
  /*
   * Bind the current category ID to the
   * server action.
   *
   * deleteMainCategory(id)
   */
  const handleDelete =
    deleteMainCategory.bind(null, id);

  return (
    <div className="flex justify-end gap-2">
      {/* =====================================================
          EDIT
      ====================================================== */}

      <Link
        href={`/admin/main-categories/${id}`}
        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
        title="Edit"
        aria-label="Edit"
      >
        <Pencil size={18} />
      </Link>

      {/* =====================================================
          DELETE
      ====================================================== */}

      <ConfirmDeleteButton
        onDelete={handleDelete}
        title="Delete Main Category?"
        description="Are you sure you want to delete this main category? This action cannot be undone."
      />
    </div>
  );
}