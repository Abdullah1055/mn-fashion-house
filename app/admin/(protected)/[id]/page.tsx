import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Edit Category
      </h1>

      <pre className="rounded-xl bg-neutral-100 p-6">
        {JSON.stringify(category, null, 2)}
      </pre>
    </div>
  );
}