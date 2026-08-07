export default function DashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-neutral-500">
          Products
        </p>

        <h2 className="mt-3 text-4xl font-bold">
          0
        </h2>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-neutral-500">
          Categories
        </p>

        <h2 className="mt-3 text-4xl font-bold">
          0
        </h2>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-neutral-500">
          Orders
        </p>

        <h2 className="mt-3 text-4xl font-bold">
          0
        </h2>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-neutral-500">
          Revenue
        </p>

        <h2 className="mt-3 text-4xl font-bold">
          ৳0
        </h2>
      </div>
    </div>
  );
}