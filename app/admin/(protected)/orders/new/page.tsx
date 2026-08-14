import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getProducts } from "@/lib/services/product.service";

import { OrderForm } from "@/components/orders/order-form";

export default async function NewOrderPage() {
  const products = await getProducts();

  const availableProducts = products.map(
  (product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,

    color: product.color ?? null,
    size: product.size ?? null,

    regular_price: Number(
      product.regular_price
    ),

    sale_price:
      product.sale_price === null
        ? null
        : Number(product.sale_price),

    stock_quantity: Number(
      product.stock_quantity
    ),
  })
);
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft size={16} />
          Back to Orders
        </Link>

        <h1 className="mt-4 text-3xl font-bold">
          Create New Order
        </h1>

        <p className="mt-2 text-neutral-500">
          Create an order for a customer.
        </p>
      </div>

      <OrderForm
        products={availableProducts}
      />
    </div>
  );
}