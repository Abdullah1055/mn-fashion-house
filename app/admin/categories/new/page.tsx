import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/ui/page-header";
import { SectionCard } from "@/components/admin/ui/section-card";

export default function NewCategoryPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Add Category"
        description="Create a new product category."
        action={
          <Button asChild variant="outline">
            <Link href="/admin/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <SectionCard>
        <p className="text-neutral-500">
          Category form will be added in the next step.
        </p>
      </SectionCard>
    </div>
  );
}