"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

import type { PromotionalBanner } from "@/types/promotional-banner";

type PromotionalBannerProps = {
  banner: PromotionalBanner;
};

export function PromotionalBanner({
  banner,
}: PromotionalBannerProps) {
  const [visible, setVisible] =
    useState(true);

  useEffect(() => {
    if (!banner.is_dismissible) {
      return;
    }

    const dismissed =
      localStorage.getItem(
        `mn-banner-dismissed-${banner.id}`
      );

    if (dismissed === "true") {
      setVisible(false);
    }
  }, [
    banner.id,
    banner.is_dismissible,
  ]);

  function handleClose() {
    setVisible(false);

    if (banner.is_dismissible) {
      localStorage.setItem(
        `mn-banner-dismissed-${banner.id}`,
        "true"
      );
    }
  }

  if (!visible) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden bg-neutral-900">
      {/* Background Image */}

      {banner.image_url && (
        <img
          src={banner.image_url}
          alt={banner.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Overlay */}

      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}

      <div className="relative mx-auto flex min-h-[320px] max-w-7xl items-center justify-center px-6 py-16 text-center sm:min-h-[400px]">
        <div className="max-w-2xl text-white">
          {/* Discount */}

          {banner.discount_text && (
            <div className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-sky-600 shadow">
              {banner.discount_text}
            </div>
          )}

          {/* Title */}

          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            {banner.title}
          </h2>

          {/* Description */}

          {banner.description && (
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/90 sm:text-base">
              {banner.description}
            </p>
          )}

          {/* Button */}

          {banner.button_text &&
            banner.button_link && (
              <div className="mt-7">
                <Link
                  href={
                    banner.button_link
                  }
                  className="inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-neutral-900 shadow-lg transition hover:bg-neutral-100"
                >
                  {banner.button_text}
                </Link>
              </div>
            )}
        </div>

        {/* Close */}

        {banner.is_dismissible && (
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close promotional banner"
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </section>
  );
}