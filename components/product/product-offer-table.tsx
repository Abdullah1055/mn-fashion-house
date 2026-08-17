"use client";

import { useMemo, useState } from "react";
import { X, Percent, Tag } from "lucide-react";

import { saveProductOffer } from "@/lib/actions/product-offer";

import type { Product } from "@/types/product";
import type { ProductOffer } from "@/types/product-offer";

type ProductOfferTableProps = {
  products: Product[];
  offers: ProductOffer[];
};

export function ProductOfferTable({
  products,
  offers,
}: ProductOfferTableProps) {
  const [pageSize, setPageSize] =
    useState(10);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [selectedOffer, setSelectedOffer] =
    useState<ProductOffer | null>(null);

  const [discount, setDiscount] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState<string | null>(null);

  const offerMap = useMemo(() => {
    return new Map(
      offers.map((offer) => [
        offer.product_id,
        offer,
      ])
    );
  }, [offers]);

  /* --------------------------------
   * Pagination
   * -------------------------------- */

  const totalProducts =
    products.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalProducts / pageSize
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedProducts =
    useMemo(() => {
      const start =
        (safeCurrentPage - 1) *
        pageSize;

      return products.slice(
        start,
        start + pageSize
      );
    }, [
      products,
      pageSize,
      safeCurrentPage,
    ]);

  function handlePageSizeChange(
    value: number
  ) {
    setPageSize(value);
    setCurrentPage(1);
  }

  function goToPreviousPage() {
    setCurrentPage((page) =>
      Math.max(1, page - 1)
    );
  }

  function goToNextPage() {
    setCurrentPage((page) =>
      Math.min(totalPages, page + 1)
    );
  }

  /* --------------------------------
   * Open Offer Modal
   * -------------------------------- */

  function openOfferModal(
    product: Product
  ) {
    const existingOffer =
      offerMap.get(product.id) ??
      null;

    setSelectedProduct(product);
    setSelectedOffer(existingOffer);

    setDiscount(
      existingOffer?.is_active
        ? String(
            existingOffer.discount_percentage
          )
        : ""
    );

    setError(null);
    setMessage(null);
  }

  /* --------------------------------
   * Close Offer Modal
   * -------------------------------- */

  function closeOfferModal() {
    if (saving) {
      return;
    }

    setSelectedProduct(null);
    setSelectedOffer(null);
    setDiscount("");
    setError(null);
    setMessage(null);
  }

  /* --------------------------------
   * Base Price
   * -------------------------------- */

  const modalBasePrice = selectedProduct
    ? Number(
        selectedProduct.sale_price ??
          selectedProduct.regular_price
      )
    : 0;

  /* --------------------------------
   * Live Offer Price
   * -------------------------------- */

  const discountNumber =
    Number(discount) || 0;

  const modalOfferPrice =
    discountNumber > 0 &&
    discountNumber <= 100
      ? modalBasePrice -
        (modalBasePrice *
          discountNumber) /
          100
      : modalBasePrice;

  /* --------------------------------
   * Save Offer
   * -------------------------------- */

  async function handleSaveOffer() {
    if (!selectedProduct) {
      return;
    }

    const percentage =
      Number(discount);

    if (
      !Number.isFinite(percentage) ||
      percentage <= 0 ||
      percentage > 100
    ) {
      setError(
        "Please enter a discount between 1% and 100%."
      );

      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const result =
        await saveProductOffer(
          selectedProduct.id,
          percentage
        );

      if (!result.success) {
        setError(
          result.error ||
            "Unable to save offer."
        );

        return;
      }

      setMessage(
        "Offer saved successfully."
      );

      /*
       * Give the user a moment
       * to see the success message,
       * then refresh the page.
       */

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch {
      setError(
        "Something went wrong while saving the offer."
      );
    } finally {
      setSaving(false);
    }
  }

  /* --------------------------------
   * Result Information
   * -------------------------------- */

  const startItem =
    totalProducts === 0
      ? 0
      : (safeCurrentPage - 1) *
          pageSize +
        1;

  const endItem = Math.min(
    safeCurrentPage * pageSize,
    totalProducts
  );

  return (
    <>
      <div className="space-y-4">
        {/* Table */}

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="px-5 py-4 text-left text-sm font-semibold">
                    Product
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold">
                    SKU
                  </th>

                  <th className="px-5 py-4 text-right text-sm font-semibold">
                    Purchase Cost
                  </th>

                  <th className="px-5 py-4 text-right text-sm font-semibold">
                    Regular Price
                  </th>

                  <th className="px-5 py-4 text-right text-sm font-semibold">
                    Sale Price
                  </th>

                  <th className="px-5 py-4 text-center text-sm font-semibold">
                    Offer
                  </th>

                  <th className="px-5 py-4 text-right text-sm font-semibold">
                    Offer Price
                  </th>

                  <th className="px-5 py-4 text-center text-sm font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedProducts.map(
                  (product) => {
                    const offer =
                      offerMap.get(
                        product.id
                      );

                    const basePrice =
                      Number(
                        product.sale_price ??
                          product.regular_price
                      );

                    const discount =
                      offer?.is_active
                        ? Number(
                            offer.discount_percentage
                          )
                        : 0;

                    const offerPrice =
                      discount > 0
                        ? basePrice -
                          (basePrice *
                            discount) /
                            100
                        : basePrice;

                    return (
                      <tr
                        key={product.id}
                        className="border-t transition hover:bg-neutral-50"
                      >
                        {/* Product */}

                        <td className="px-5 py-4">
                          <div className="font-semibold text-neutral-900">
                            {product.name}
                          </div>

                          {product.short_description && (
                            <p className="mt-1 line-clamp-1 text-xs text-neutral-500">
                              {
                                product.short_description
                              }
                            </p>
                          )}
                        </td>

                        {/* SKU */}

                        <td className="px-5 py-4 text-sm text-neutral-700">
                          {product.sku ||
                            "-"}
                        </td>

                        {/* Purchase Cost */}

                        <td className="px-5 py-4 text-right text-sm">
                          ৳
                          {Number(
                            product.purchase_cost
                          ).toFixed(2)}
                        </td>

                        {/* Regular Price */}

                        <td className="px-5 py-4 text-right text-sm">
                          ৳
                          {Number(
                            product.regular_price
                          ).toFixed(2)}
                        </td>

                        {/* Sale Price */}

                        <td className="px-5 py-4 text-right text-sm font-medium">
                          ৳
                          {basePrice.toFixed(
                            2
                          )}
                        </td>

                        {/* Offer */}

                        <td className="px-5 py-4 text-center">
                          {offer?.is_active ? (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              {Number(
                                offer.discount_percentage
                              )}
                              % OFF
                            </span>
                          ) : (
                            <span className="text-sm text-neutral-400">
                              No Offer
                            </span>
                          )}
                        </td>

                        {/* Offer Price */}

                        <td className="px-5 py-4 text-right">
                          {offer?.is_active ? (
                            <div>
                              <div className="font-bold text-sky-600">
                                ৳
                                {offerPrice.toFixed(
                                  2
                                )}
                              </div>

                              <div className="text-xs text-neutral-400 line-through">
                                ৳
                                {basePrice.toFixed(
                                  2
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="font-medium">
                              ৳
                              {basePrice.toFixed(
                                2
                              )}
                            </span>
                          )}
                        </td>

                        {/* Action */}

                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              openOfferModal(
                                product
                              )
                            }
                            className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-sky-700"
                          >
                            {offer?.is_active
                              ? "Edit Offer"
                              : "Set Offer"}
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>

            {/* Empty State */}

            {totalProducts === 0 && (
              <div className="px-6 py-12 text-center text-sm text-neutral-500">
                No products available.
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}

        {totalProducts > 0 && (
          <div className="flex flex-col gap-4 rounded-xl border bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Result info */}

            <div className="text-sm text-neutral-500">
              Showing{" "}
              <span className="font-medium text-neutral-900">
                {startItem}
              </span>{" "}
              to{" "}
              <span className="font-medium text-neutral-900">
                {endItem}
              </span>{" "}
              of{" "}
              <span className="font-medium text-neutral-900">
                {totalProducts}
              </span>{" "}
              products
            </div>

            {/* Controls */}

            <div className="flex flex-wrap items-center gap-3">
              {/* Page Size */}

              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span>Show</span>

                <select
                  value={pageSize}
                  onChange={(event) =>
                    handlePageSizeChange(
                      Number(
                        event.target.value
                      )
                    )
                  }
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 outline-none focus:border-sky-500"
                >
                  <option value={10}>
                    10
                  </option>

                  <option value={20}>
                    20
                  </option>

                  <option value={50}>
                    50
                  </option>
                </select>

                <span>per page</span>
              </div>

              {/* Previous */}

              <button
                type="button"
                onClick={
                  goToPreviousPage
                }
                disabled={
                  safeCurrentPage === 1
                }
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {/* Page */}

              <div className="rounded-lg bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-900">
                Page{" "}
                {safeCurrentPage} of{" "}
                {totalPages}
              </div>

              {/* Next */}

              <button
                type="button"
                onClick={
                  goToNextPage
                }
                disabled={
                  safeCurrentPage ===
                  totalPages
                }
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --------------------------------
       * Offer Modal
       * -------------------------------- */}

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="offer-modal-title"
          >
            {/* Modal Header */}

            <div className="flex items-start justify-between border-b px-6 py-5">
              <div>
                <h2
                  id="offer-modal-title"
                  className="text-xl font-bold text-neutral-900"
                >
                  {selectedOffer?.is_active
                    ? "Edit Offer"
                    : "Set Offer"}
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Set a discount for this
                  product.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeOfferModal
                }
                disabled={saving}
                className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}

            <div className="space-y-5 px-6 py-6">
              {/* Product */}

              <div className="rounded-xl bg-neutral-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                    <Tag size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-900">
                      {
                        selectedProduct.name
                      }
                    </p>

                    <p className="text-xs text-neutral-500">
                      SKU:{" "}
                      {selectedProduct.sku ||
                        "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Information */}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border p-4">
                  <p className="text-xs text-neutral-500">
                    Purchase Cost
                  </p>

                  <p className="mt-1 font-semibold text-neutral-900">
                    ৳
                    {Number(
                      selectedProduct.purchase_cost
                    ).toFixed(2)}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs text-neutral-500">
                    Current Sale Price
                  </p>

                  <p className="mt-1 font-semibold text-neutral-900">
                    ৳
                    {modalBasePrice.toFixed(
                      2
                    )}
                  </p>
                </div>
              </div>

              {/* Discount */}

              <div>
                <label
                  htmlFor="discount-percentage"
                  className="mb-2 block text-sm font-semibold text-neutral-900"
                >
                  Discount Percentage
                </label>

                <div className="relative">
                  <input
                    id="discount-percentage"
                    type="number"
                    min="1"
                    max="100"
                    step="0.01"
                    value={discount}
                    onChange={(event) =>
                      setDiscount(
                        event.target.value
                      )
                    }
                    placeholder="Enter discount percentage"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    disabled={saving}
                  />

                  <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-neutral-500">
                    <Percent size={17} />
                  </div>
                </div>

                <p className="mt-2 text-xs text-neutral-500">
                  Enter a value between 1%
                  and 100%.
                </p>
              </div>

              {/* Offer Price Preview */}

              <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">
                      Offer Price
                    </p>

                    <p className="mt-1 text-2xl font-bold text-sky-600">
                      ৳
                      {modalOfferPrice.toFixed(
                        2
                      )}
                    </p>
                  </div>

                  {discountNumber >
                    0 &&
                    discountNumber <=
                      100 && (
                      <div className="text-right">
                        <p className="text-xs text-neutral-500">
                          You save
                        </p>

                        <p className="font-semibold text-green-600">
                          ৳
                          {(
                            modalBasePrice -
                            modalOfferPrice
                          ).toFixed(2)}
                        </p>
                      </div>
                    )}
                </div>
              </div>

              {/* Messages */}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {message}
                </div>
              )}
            </div>

            {/* Modal Footer */}

            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                type="button"
                onClick={
                  closeOfferModal
                }
                disabled={saving}
                className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSaveOffer
                }
                disabled={
                  saving ||
                  !discount ||
                  discountNumber <=
                    0 ||
                  discountNumber > 100
                }
                className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : selectedOffer?.is_active
                    ? "Update Offer"
                    : "Save Offer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}