"use client";

import { useState } from "react";

import {
  togglePromotionalBanner,
} from "@/lib/actions/promotional-banner";

type Props = {
  id: string;
  isActive: boolean;
};

export function PromotionalBannerToggle({
  id,
  isActive,
}: Props) {
  const [active, setActive] =
    useState(isActive);

  const [loading, setLoading] =
    useState(false);

  async function handleToggle() {
    if (loading) {
      return;
    }

    const nextValue =
      !active;

    setLoading(true);

    try {
      const result =
        await togglePromotionalBanner(
          id,
          nextValue
        );

      if (!result.success) {
        throw new Error(
          result.error ||
            "Unable to update banner status."
        );
      }

      setActive(nextValue);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      title={
        active
          ? "Click to deactivate"
          : "Click to activate"
      }
      className="inline-flex items-center gap-2"
    >
      <span
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          active
            ? "bg-green-500"
            : "bg-neutral-300"
        } ${
          loading
            ? "cursor-not-allowed opacity-60"
            : ""
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            active
              ? "translate-x-6"
              : "translate-x-1"
          }`}
        />
      </span>

      <span
        className={`text-xs font-semibold ${
          active
            ? "text-green-700"
            : "text-neutral-500"
        }`}
      >
        {active
          ? "Active"
          : "Inactive"}
      </span>
    </button>
  );
}