"use client";

import { useState, useTransition } from "react";
import { Trash2, X } from "lucide-react";

type ConfirmDeleteButtonProps = {
  onDelete: () => Promise<void>;
  title?: string;
  description?: string;
};

export function ConfirmDeleteButton({
  onDelete,
  title = "Delete Main Category?",
  description = "Are you sure you want to delete this main category? This action cannot be undone.",
}: ConfirmDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

  const [isPending, startTransition] =
    useTransition();

  function handleDelete() {
    setError(null);

    startTransition(async () => {
      try {
        await onDelete();

        /*
         * Server action successfully completed.
         * Close the confirmation modal.
         */
        setOpen(false);

        /*
         * Refresh the current page so the
         * deleted category disappears immediately.
         */
        window.location.reload();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to delete category."
        );
      }
    });
  }

  return (
    <>
      {/* =====================================================
          DELETE BUTTON
      ====================================================== */}

      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        disabled={isPending}
        className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        title="Delete"
        aria-label="Delete"
      >
        <Trash2 size={18} />
      </button>

      {/* =====================================================
          CONFIRMATION MODAL
      ====================================================== */}

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            {/* -------------------------------------------------
                Header
            -------------------------------------------------- */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* -------------------------------------------------
                Error Message
            -------------------------------------------------- */}

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium leading-5 text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* -------------------------------------------------
                Actions
            -------------------------------------------------- */}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setOpen(false);
                }}
                disabled={isPending}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}