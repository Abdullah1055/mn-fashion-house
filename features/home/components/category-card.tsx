import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type CategoryCardProps = {
  title: string;
  description: string;
  image: string;
};

export function CategoryCard({
  title,
  description,
  image,
}: CategoryCardProps) {
  return (
    <Link
      href={`/products?category=${encodeURIComponent(title)}`}
      className="group block"
    >
      <article className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
        {/* Image Area */}
        <div className="relative aspect-[4/4.5] overflow-hidden bg-sky-50">
          {image ? (
            <Image
              src={image}
              alt={`${title} collection`}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-50 via-white to-slate-200">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Coming Soon
              </span>
            </div>
          )}

          {/* Image Overlay */}
          {image && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-70" />
          )}

          {/* Arrow */}
          <div className="absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-md transition duration-300 group-hover:bg-red-600 group-hover:text-white">
            <ArrowUpRight size={19} />
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-xl font-bold text-slate-950">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>

          <span className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.16em] text-red-600">
            Shop Collection
          </span>
        </div>
      </article>
    </Link>
  );
}