"use client";

import Link from "next/link";
import {
  ImageIcon,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

import type { Product } from "@/types/product";

import { deleteProduct } from "@/lib/actions/product";

import { ProductProfit } from "./product-profit";
import { ProductStock } from "./product-stock";

type ProductTableProps = {
  products: Product[];
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function ProductTable({
  products,
}: ProductTableProps) {
  const [deleteProductData, setDeleteProductData] =
    useState<Product | null>(null);

  const [deletingProductId, setDeletingProductId] =
    useState<string | null>(null);

  const [pageSize, setPageSize] =
    useState<number>(10);

  const [currentPage, setCurrentPage] =
    useState<number>(1);

  const totalPages = Math.max(
    1,
    Math.ceil(products.length / pageSize)
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * pageSize;

  const endIndex =
    startIndex + pageSize;

  const paginatedProducts =
    products.slice(
      startIndex,
      endIndex
    );

  function handlePageSizeChange(
    value: string
  ) {
    const newPageSize =
      Number(value);

    setPageSize(newPageSize);
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

  function openDeleteModal(
    product: Product
  ) {
    setDeleteProductData(product);
  }

  function closeDeleteModal() {
    if (deletingProductId) {
      return;
    }

    setDeleteProductData(null);
  }

  async function handleDelete() {
    if (!deleteProductData) {
      return;
    }

    setDeletingProductId(
      deleteProductData.id
    );

    try {
      const result =
        await deleteProduct(
          deleteProductData.id
        );

      if (!result.success) {
        window.alert(
          result.error ||
            "Unable to delete product."
        );

        return;
      }

      setDeleteProductData(null);

      window.location.reload();
    } catch {
      window.alert(
        "Something went wrong while deleting the product."
      );
    } finally {
      setDeletingProductId(null);
    }
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-neutral-500">
        No products found.
      </div>
    );
  }

  const showingFrom =
    startIndex + 1;

  const showingTo = Math.min(
    endIndex,
    products.length
  );

  return (
    <>
      {/* Product Table */}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">
                  Product
                </th>

                <th className="px-6 py-4 text-left font-semibold">
                  SKU
                </th>

                <th className="px-6 py-4 text-right font-semibold">
                  Purchase
                </th>

                <th className="px-6 py-4 text-right font-semibold">
                  Regular
                </th>

                <th className="px-6 py-4 text-right font-semibold">
                  Sale
                </th>

                <th className="px-6 py-4 text-right font-semibold">
                  Profit
                </th>

                <th className="px-6 py-4 text-center font-semibold">
                  Inventory
                </th>

                <th className="px-6 py-4 text-center font-semibold">
                  Status
                </th>

                <th className="px-6 py-4 text-center font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedProducts.map(
                (product) => {
                  const isDeleting =
                    deletingProductId ===
                    product.id;

                  return (
                    <tr
                      key={product.id}
                      className="border-t transition hover:bg-neutral-50"
                    >
                      {/* Product */}

                      <td className="px-6 py-4">
                        <div className="font-semibold">
                          {product.name}
                        </div>

                        {product.short_description && (
                          <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                            {
                              product.short_description
                            }
                          </p>
                        )}
                      </td>

                      {/* SKU */}

                      <td className="px-6 py-4">
                        {product.sku ||
                          "-"}
                      </td>

                      {/* Purchase */}

                      <td className="px-6 py-4 text-right">
                        ৳
                        {Number(
                          product.purchase_cost
                        ).toFixed(2)}
                      </td>

                      {/* Regular */}

                      <td className="px-6 py-4 text-right">
                        ৳
                        {Number(
                          product.regular_price
                        ).toFixed(2)}
                      </td>

                      {/* Sale */}

                      <td className="px-6 py-4 text-right">
                        {product.sale_price ? (
                          <>
                            ৳
                            {Number(
                              product.sale_price
                            ).toFixed(2)}
                          </>
                        ) : (
                          "-"
                        )}
                      </td>

                      {/* Profit */}

                      <td className="px-6 py-4 text-right">
                        <ProductProfit
                          purchaseCost={
                            product.purchase_cost
                          }
                          regularPrice={
                            product.regular_price
                          }
                          salePrice={
                            product.sale_price
                          }
                        />
                      </td>

                      {/* Inventory */}

                      <td className="px-6 py-4 text-center">
                        <ProductStock
                          stock={
                            product.stock_quantity
                          }
                          lowStock={
                            product.low_stock_threshold
                          }
                        />
                      </td>

                      {/* Status */}

                      <td className="px-6 py-4 text-center">
                        {product.is_active ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}

                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="rounded-lg border p-2 transition hover:bg-sky-50 hover:text-sky-600"
                            title="Edit Product"
                          >
                            <Pencil
                              size={18}
                            />
                          </Link>

                          <Link
                            href={`/admin/products/${product.id}/images/gallery`}
                            className="rounded-lg border p-2 transition hover:bg-violet-50 hover:text-violet-600"
                            title="Manage Product Images"
                          >
                            <ImageIcon
                              size={18}
                            />
                          </Link>

                          <button
                            type="button"
                            disabled={
                              isDeleting
                            }
                            onClick={() =>
                              openDeleteModal(
                                product
                              )
                            }
                            className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete Product"
                          >
                            <Trash2
                              size={18}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}

        <div className="flex flex-col gap-4 border-t bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Showing */}

          <div className="text-sm text-neutral-500">
            Showing{" "}
            <span className="font-medium text-neutral-900">
              {showingFrom}
            </span>{" "}
            to{" "}
            <span className="font-medium text-neutral-900">
              {showingTo}
            </span>{" "}
            of{" "}
            <span className="font-medium text-neutral-900">
              {products.length}
            </span>{" "}
            products
          </div>

          {/* Controls */}

          <div className="flex items-center gap-4">
            {/* Page Size */}

            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span>Show</span>

              <select
                value={pageSize}
                onChange={(event) =>
                  handlePageSizeChange(
                    event.target.value
                  )
                }
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                {PAGE_SIZE_OPTIONS.map(
                  (size) => (
                    <option
                      key={size}
                      value={size}
                    >
                      {size}
                    </option>
                  )
                )}
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
              title="Previous page"
            >
              <ChevronLeft
                size={18}
              />
            </button>

            {/* Page */}

            <span className="text-sm font-medium text-neutral-700">
              Page{" "}
              {safeCurrentPage} of{" "}
              {totalPages}
            </span>

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
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
              title="Next page"
            >
              <ChevronRight
                size={18}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}

      {deleteProductData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
          onClick={closeDeleteModal}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Header */}

            <div className="flex items-start justify-between border-b px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle
                    size={22}
                    className="text-red-600"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Delete Product
                  </h2>

                  <p className="mt-1 text-sm text-neutral-500">
                    Permanent action
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  closeDeleteModal
                }
                disabled={
                  !!deletingProductId
                }
                className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}

            <div className="px-6 py-6">
              <p className="text-sm leading-6 text-neutral-600">
                Are you sure you want
                to permanently delete{" "}
                <span className="font-semibold text-neutral-900">
                  "{deleteProductData.name}"
                </span>
                ?
              </p>

              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm leading-5 text-red-700">
                  The product and its
                  related images will
                  be permanently
                  deleted. This action
                  cannot be undone.
                </p>
              </div>
            </div>

            {/* Actions */}

            <div className="flex justify-end gap-3 border-t bg-neutral-50 px-6 py-4">
              <button
                type="button"
                onClick={
                  closeDeleteModal
                }
                disabled={
                  !!deletingProductId
                }
                className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDelete
                }
                disabled={
                  !!deletingProductId
                }
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2
                  size={16}
                />

                {deletingProductId
                  ? "Deleting..."
                  : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}