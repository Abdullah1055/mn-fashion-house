import Link from "next/link";
import {
  ArrowLeft,
  Plus,
} from "lucide-react";

import { getPromotionalBanners } from "@/lib/services/promotional-banner.service";

export default async function PromotionalBannersPage() {
  const banners =
    await getPromotionalBanners();

  return (
    <div className="space-y-6">
      {/* Header */}

      <div>
        <Link
          href="/admin/offers"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-neutral-900"
        >
          <ArrowLeft size={16} />
          Back to Offers
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Promotional Banners
            </h1>

            <p className="mt-1 text-sm text-neutral-500">
              Create and manage promotional banners for the homepage.
            </p>
          </div>

          <Link
            href="/admin/offers/banners/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-700"
          >
            <Plus size={17} />
            Create Banner
          </Link>
        </div>
      </div>

      {/* Banner List */}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Banner
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Discount
                </th>

                <th className="px-5 py-4 text-center text-sm font-semibold">
                  Schedule
                </th>

                <th className="px-5 py-4 text-center text-sm font-semibold">
                  Status
                </th>

                <th className="px-5 py-4 text-center text-sm font-semibold">
                  Order
                </th>

                <th className="px-5 py-4 text-center text-sm font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {banners.map((banner) => {
                const now =
                  new Date();

                const startsLater =
                  banner.start_at &&
                  new Date(
                    banner.start_at
                  ) > now;

                const ended =
                  banner.end_at &&
                  new Date(
                    banner.end_at
                  ) < now;

                let status =
                  "Inactive";

                if (
                  banner.is_active &&
                  !startsLater &&
                  !ended
                ) {
                  status = "Active";
                } else if (
                  banner.is_active &&
                  startsLater
                ) {
                  status = "Scheduled";
                } else if (
                  banner.is_active &&
                  ended
                ) {
                  status = "Expired";
                }

                return (
                  <tr
                    key={banner.id}
                    className="border-t transition hover:bg-neutral-50"
                  >
                    {/* Banner */}

                    <td className="px-5 py-4">
                      <div className="font-semibold text-neutral-900">
                        {banner.title}
                      </div>

                      {banner.description && (
                        <p className="mt-1 line-clamp-1 max-w-md text-xs text-neutral-500">
                          {
                            banner.description
                          }
                        </p>
                      )}
                    </td>

                    {/* Discount */}

                    <td className="px-5 py-4 text-sm">
                      {banner.discount_text ? (
                        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                          {
                            banner.discount_text
                          }
                        </span>
                      ) : (
                        <span className="text-neutral-400">
                          -
                        </span>
                      )}
                    </td>

                    {/* Schedule */}

                    <td className="px-5 py-4 text-center text-xs text-neutral-500">
                      {banner.start_at ||
                      banner.end_at ? (
                        <div className="space-y-1">
                          <div>
                            Start:{" "}
                            {banner.start_at
                              ? new Date(
                                  banner.start_at
                                ).toLocaleDateString()
                              : "Immediately"}
                          </div>

                          <div>
                            End:{" "}
                            {banner.end_at
                              ? new Date(
                                  banner.end_at
                                ).toLocaleDateString()
                              : "No end date"}
                          </div>
                        </div>
                      ) : (
                        "Always"
                      )}
                    </td>

                    {/* Status */}

                    <td className="px-5 py-4 text-center">
                      {status ===
                        "Active" && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Active
                        </span>
                      )}

                      {status ===
                        "Scheduled" && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          Scheduled
                        </span>
                      )}

                      {status ===
                        "Expired" && (
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                          Expired
                        </span>
                      )}

                      {status ===
                        "Inactive" && (
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Display Order */}

                    <td className="px-5 py-4 text-center text-sm font-medium">
                      {banner.display_order}
                    </td>

                    {/* Action */}

                    <td className="px-5 py-4 text-center">
                      <Link
                        href={`/admin/offers/banners/${banner.id}`}
                        className="rounded-lg border px-4 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Empty State */}

          {banners.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="font-medium text-neutral-700">
                No promotional banners yet.
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                Create your first homepage promotional banner.
              </p>

              <Link
                href="/admin/offers/banners/new"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-700"
              >
                <Plus size={17} />
                Create Banner
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}