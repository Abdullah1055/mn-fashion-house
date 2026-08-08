"use client";

import { useState } from "react";
import { adjustProductStock } from "@/lib/actions/inventory";

type InventoryAdjustmentProps = {
  productId: string;
  currentStock: number;
};

export function InventoryAdjustment({
  productId,
  currentStock,
}: InventoryAdjustmentProps) {
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [type, setType] = useState<
    "in" | "out"
  >("in");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage(null);
    setError(null);

    const value = Number(quantity);

    if (!Number.isInteger(value) || value <= 0) {
      setError(
        "Quantity must be a positive whole number."
      );
      return;
    }

    if (type === "out" && value > currentStock) {
      setError(
        "Stock cannot go below zero."
      );
      return;
    }

    try {
      setLoading(true);

      const result =
        await adjustProductStock(
          productId,
          value,
          type,
          reason
        );

      if (!result.success) {
        setError(
          result.error ||
            "Unable to update stock."
        );
        return;
      }

      setMessage(
        type === "in"
          ? "Stock added successfully."
          : "Stock removed successfully."
      );

      setQuantity("");
      setReason("");

      window.location.reload();
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          Stock Adjustment
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Current Stock:{" "}
          <span className="font-semibold text-neutral-900">
            {currentStock}
          </span>
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label className="mb-2 block text-sm font-medium">
            Movement Type
          </label>

          <select
            value={type}
            onChange={(event) =>
              setType(
                event.target.value as
                  | "in"
                  | "out"
              )
            }
            className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="in">
              Stock IN
            </option>

            <option value="out">
              Stock OUT
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Quantity
          </label>

          <input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(event) =>
              setQuantity(event.target.value)
            }
            placeholder="Enter quantity"
            required
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Reason
          </label>

          <textarea
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
            rows={3}
            placeholder={
              type === "in"
                ? "e.g. New purchase"
                : "e.g. Damaged / sold / adjustment"
            }
            className="w-full rounded-lg border border-neutral-300 px-3 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`rounded-lg px-6 py-3 font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
            type === "in"
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {loading
            ? "Updating..."
            : type === "in"
              ? "Add Stock"
              : "Remove Stock"}
        </button>
      </form>
    </div>
  );
}