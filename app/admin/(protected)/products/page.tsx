import Link from "next/link";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Products
          </h1>

          <p className="mt-2 text-neutral-500">
            Manage all store products.
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>

      </div>

      <div className="overflow-hidden rounded-3xl border bg-white">

        <table className="w-full">

          <thead className="border-b bg-neutral-50">

            <tr>

              <th className="px-6 py-4 text-left">
                Product
              </th>

              <th className="px-6 py-4 text-left">
                Category
              </th>

              <th className="px-6 py-4 text-left">
                Status
              </th>

              <th className="px-6 py-4 text-right">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            <tr>

              <td
                colSpan={4}
                className="py-20 text-center text-neutral-500"
              >
                No products found.
              </td>

            </tr>

          </tbody>

        </table>

      </div>
    </div>
  );
}