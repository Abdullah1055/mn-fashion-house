"use client";

import { Search } from "lucide-react";
import { FormEvent, useState } from "react";

type ProductSearchProps = {
  initialValue?: string;
};

export function ProductSearch({
  initialValue = "",
}: ProductSearchProps) {
  const [query, setQuery] =
    useState(initialValue);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedQuery =
      query.trim();

    if (!trimmedQuery) {
      window.location.href =
        "/products";
      return;
    }

    window.location.href = `/products?search=${encodeURIComponent(
      trimmedQuery
    )}`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center overflow-hidden rounded-xl border border-neutral-200 bg-white"
    >
      <div className="flex flex-1 items-center gap-3 px-4">
        <Search
          size={18}
          className="shrink-0 text-neutral-400"
        />

        <input
          type="text"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search products, shirts, polo..."
          className="w-full bg-transparent py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
        />
      </div>

      <button
        type="submit"
        className="flex h-full items-center justify-center bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        Search
      </button>
    </form>
  );
}