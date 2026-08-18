import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

import { getPromotionalBanners } from "@/lib/services/promotional-banner.service";

import { PromotionalBannerToggle } from "@/components/offers/promotional-banner-toggle";

export default async function PromotionalBannersPage() {
  const banners =
    await getPromotionalBanners();

  return (
    <div className="space-y-6">
      {/* Back */}

      <Link
        href="/admin/offers"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-neutral-900"
      >
        <ArrowLeft size={16} />
        Back to Offers
      </Link>

      {/* Header */}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Promotional Banners
          </h1>

          <p className="mt-1 text-sm text-neutral-500">
            Create and manage promotional
            banners for the homepage.
          </p>
        </div>

        <Link
          href="/admin/offers/banners/new"
          className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-700"
        >
          <Plus size={17} />
          Create Banner
        </Link>
      </div>

      {/* Banner List */}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold text-neutral-800">
                  Banner
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-neutral-800">
                  Discount
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-neutral-800">
                  Schedule
                </th>

                <th className="px-5 py-4 text-center text-sm font-semibold text-neutral-800">
                  Status
                </th>

                <th className="px-5 py-4 text-center text-sm font-semibold text-neutral-800">
                  Order
                </th>

                <th className="px-5 py-4 text-center text-sm font-semibold text-neutral-800">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {banners.map((banner) => {
                const now =
                  new Date();

                const startDate =
                  banner.start_at
                    ? new Date(
                        banner.start_at
                      )
                    : null;

                const endDate =
                  banner.end_at
                    ? new Date(
                        banner.end_at
                      )
                    : null;

                const isScheduled =
                  startDate &&
                  startDate > now;

                const isExpired =
                  endDate &&
                  endDate < now;

                let scheduleText =
                  "Always";

                if (isScheduled) {
                  scheduleText =
                    `Starts ${startDate.toLocaleDateString()}`;
                } else if (
                  isExpired
                ) {
                  scheduleText =
                    "Expired";
                } else if (endDate) {
                  scheduleText =
                    `Until ${endDate.toLocaleDateString()}`;
                }

                return (
                  <tr
                    key={banner.id}
                    className="border-t transition hover:bg-neutral-50"
                  >
                    {/* Banner */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        {banner.image_url ? (
                          <img
                            src={
                              banner.image_url
                            }
                            alt={
                              banner.title
                            }
                            className="h-14 w-24 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-24 items-center justify-center rounded-lg bg-neutral-100 text-xs text-neutral-400">
                            No Image
                          </div>
                        )}

                        <div>
                          <div className="font-semibold text-neutral-900">
                            {banner.title}
                          </div>

                          {banner.description && (
                            <p className="mt-1 max-w-xs truncate text-xs text-neutral-500">
                              {
                                banner.description
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Discount */}

                    <td className="px-5 py-4">
                      {banner.discount_text ? (
                        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                          {
                            banner.discount_text
                          }
                        </span>
                      ) : (
                        <span className="text-sm text-neutral-400">
                          —
                        </span>
                      )}
                    </td>

                    {/* Schedule */}

                    <td className="px-5 py-4 text-sm text-neutral-500">
                      {scheduleText}
                    </td>

                    {/* Status */}

                    <td className="px-5 py-4 text-center">
                      <PromotionalBannerToggle
                        id={banner.id}
                        isActive={
                          banner.is_active
                        }
                      />
                    </td>

                    {/* Order */}

                    <td className="px-5 py-4 text-center text-sm font-medium text-neutral-700">
                      {
                        banner.display_order
                      }
                    </td>

                    {/* Action */}

                    <td className="px-5 py-4 text-center">
                      <Link
                        href={`/admin/offers/banners/${banner.id}`}
                        className="inline-flex rounded-lg border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-sky-600"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Empty */}

          {banners.length === 0 && (
            <div className="px-6 py-14 text-center">
              <p className="text-sm text-neutral-500">
                No promotional banners found.
              </p>

              <Link
                href="/admin/offers/banners/new"
                className="mt-4 inline-flex rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
              >
                Create Your First Banner
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Count */}

      <p className="text-sm text-neutral-500">
        Showing{" "}
        {banners.length}{" "}
        {banners.length === 1
          ? "banner"
          : "banners"}
      </p>
    </div>
  );
}