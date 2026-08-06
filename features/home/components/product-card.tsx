type ProductCardProps = {
  name: string;
  price: number;
  badge: string;
};

export function ProductCard({
  name,
  price,
  badge,
}: ProductCardProps) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white transition hover:-translate-y-1 hover:shadow-xl">

      <div className="flex h-72 items-center justify-center bg-neutral-100">

        <span className="text-neutral-400">
          Product Image
        </span>

      </div>

      <div className="p-6">

        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
          {badge}
        </span>

        <h3 className="mt-4 text-xl font-semibold">
          {name}
        </h3>

        <p className="mt-3 text-lg font-bold">
          ৳ {price}
        </p>

      </div>

    </div>
  );
}