import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { PageHeader } from "@/components/admin/ui/page-header";
import { SectionCard } from "@/components/admin/ui/section-card";
import { EmptyState } from "@/components/admin/ui/empty-state";

export default function CategoriesPage() {
  return (
    <div className="space-y-8">

      <PageHeader
        title="Categories"
        description="Manage product categories."
        action={
          <Button asChild>
            <Link href="/admin/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Link>
          </Button>
        }
      />

      <SectionCard>

        <EmptyState
          title="No Categories Yet"
          description="Create your first category to organize products."
          action={
            <Button asChild>
              <Link href="/admin/categories/new">
                Create Category
              </Link>
            </Button>
          }
        />

      </SectionCard>

    </div>
  );
}