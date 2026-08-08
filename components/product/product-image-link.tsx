import Link from "next/link";
import { ImageIcon } from "lucide-react";

type ProductImageLinkProps = {
  productId: string;
};

export function ProductImageLink({
  productId,
}: ProductImageLinkProps) {
  return (
    <Link
      href={`/admin/products/${productId}/images/gallery`}
      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-neutral-50"
    >
      <ImageIcon size={16} />

      Images
    </Link>
  );
}