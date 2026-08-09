import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

import { getBrands } from "@/lib/services/brand.service";

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Brands
          </h1>

          <p className="mt-2 text-neutral-500">
            Manage product brands.
          </p>
        </div>

        <Link
          href="/admin/brands/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-sm font-medium text-white hover:bg-sky-700"
        >
          <Plus size={17} />
          Add Brand
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-6 py-4 text-left">
                  Brand
                </th>

                <th className="px-6 py-4 text-left">
                  Slug
                </th>

                <th className="px-6 py-4 text-center">
                  Status
                </th>

                <th className="px-6 py-4 text-left">
                  Created
                </th>

                <th className="px-6 py-4 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {brands.map((brand) => (
                <tr
                  key={brand.id}
                  className="border-t hover:bg-neutral-50"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold">
                      {brand.name}
                    </div>

                    {brand.description && (
                      <p className="mt-1 max-w-md text-xs text-neutral-500">
                        {brand.description}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-neutral-500">
                    {brand.slug}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {brand.is_active ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-neutral-500">
                    {new Date(
                      brand.created_at
                    ).toLocaleDateString("en-BD")}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/admin/brands/${brand.id}`}
                      className="inline-flex rounded-lg border p-2 hover:bg-sky-50 hover:text-sky-600"
                    >
                      <Pencil size={17} />
                    </Link>
                  </td>
                </tr>
              ))}

              {brands.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-neutral-500"
                  >
                    No brands found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}