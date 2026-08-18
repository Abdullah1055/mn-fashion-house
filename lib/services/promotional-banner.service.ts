import { createClient } from "@/lib/supabase/server";

import type { PromotionalBanner } from "@/types/promotional-banner";

/* =========================================================
   GET ALL PROMOTIONAL BANNERS
========================================================= */

export async function getPromotionalBanners(): Promise<
  PromotionalBanner[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("promotional_banners")
    .select("*")
    .order("display_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as PromotionalBanner[];
}

/* =========================================================
   GET ACTIVE HOMEPAGE BANNER
========================================================= */

export async function getActivePromotionalBanner(): Promise<
  PromotionalBanner | null
> {
  const supabase = await createClient();

  const now =
    new Date().toISOString();

  const { data, error } =
    await supabase
      .from("promotional_banners")
      .select("*")
      .eq("is_active", true)
      .or(
        `start_at.is.null,start_at.lte.${now}`
      )
      .or(
        `end_at.is.null,end_at.gte.${now}`
      )
      .order("display_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data as PromotionalBanner | null;
}

/* =========================================================
   GET SINGLE PROMOTIONAL BANNER
========================================================= */

export async function getPromotionalBannerById(
  id: string
): Promise<PromotionalBanner | null> {
  const supabase = await createClient();

  const { data, error } =
    await supabase
      .from("promotional_banners")
      .select("*")
      .eq("id", id)
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data as PromotionalBanner | null;
}