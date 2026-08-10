import { CheckoutForm } from "@/components/checkout/checkout-form";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-neutral-500">
            MN Fashion House
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Complete your information to place
            your order.
          </p>
        </div>

        <CheckoutForm />
      </div>
    </main>
  );
}