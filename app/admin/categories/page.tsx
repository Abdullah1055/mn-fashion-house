import { getCategories } from "@/lib/actions/category";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Categories
        </h1>

        <p className="text-neutral-500">
          Manage product categories.
        </p>
      </div>

      <div className="rounded-3xl border bg-white">
        <table className="w-full">

          <thead className="border-b bg-neutral-50">

            <tr>

              <th className="px-6 py-4 text-left">
                Name
              </th>

              <th className="px-6 py-4 text-left">
                Slug
              </th>

            </tr>

          </thead>

          <tbody>

            {categories.map((category) => (
              <tr
                key={category.id}
                className="border-b"
              >
                <td className="px-6 py-5">
                  {category.name}
                </td>

                <td className="px-6 py-5">
                  {category.slug}
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="py-16 text-center text-neutral-500"
                >
                  No categories found.
                </td>
              </tr>
            )}

          </tbody>

        </table>
      </div>
    </div>
  );
}