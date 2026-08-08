import { notFound } from "next/navigation";

import { getProductById } from "@/lib/services/product.service";
import { getInventoryLogs } from "@/lib/services/inventory.service";

import { InventoryAdjustment } from "@/components/inventory/inventory-adjustment";
import { InventoryHistory } from "@/components/inventory/inventory-history";

export default async function InventoryProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const logs = await getInventoryLogs(product.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Inventory Management
        </h1>

        <p className="mt-2 text-neutral-500">
          Manage stock for{" "}
          <span className="font-medium text-neutral-900">
            {product.name}
          </span>
        </p>
      </div>

      <InventoryAdjustment
        productId={product.id}
        currentStock={Number(
          product.stock_quantity
        )}
      />

      <InventoryHistory logs={logs} />
    </div>
  );
}