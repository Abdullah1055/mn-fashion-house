type CategoryCardProps = {
  title: string;
  description: string;
};

export function CategoryCard({
  title,
  description,
}: CategoryCardProps) {
  return (
    <div className="group cursor-pointer rounded-3xl border border-neutral-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

      <div className="mb-10 flex h-40 items-center justify-center rounded-2xl bg-neutral-100">

        <span className="text-sm uppercase tracking-[0.25em] text-neutral-400">
          Image
        </span>

      </div>

      <h3 className="text-2xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-neutral-500">
        {description}
      </p>

    </div>
  );
}