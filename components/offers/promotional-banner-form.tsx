"use client";

import Link from "next/link";
import {
  ImagePlus,
  X,
  ZoomIn,
  ZoomOut,
  Move,
} from "lucide-react";
import {
  useRef,
  useState,
} from "react";

import {
  createPromotionalBanner,
  updatePromotionalBanner,
} from "@/lib/actions/promotional-banner";

import { createClient } from "@/lib/supabase/client";

import type { PromotionalBanner } from "@/types/promotional-banner";

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const TARGET_SIZE =
  300 * 1024;

const OUTPUT_WIDTH = 1600;
const OUTPUT_HEIGHT = 600;

type PromotionalBannerFormProps = {
  mode?: "create" | "edit";
  banner?: PromotionalBanner;
};

type Position = {
  x: number;
  y: number;
};

export function PromotionalBannerForm({
  mode = "create",
  banner,
}: PromotionalBannerFormProps) {
  const isEdit =
    mode === "edit";

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [sourceImage, setSourceImage] =
    useState<string | null>(
      banner?.image_url ?? null
    );

  const [fileName, setFileName] =
    useState<string | null>(null);

  const [imageWidth, setImageWidth] =
    useState(0);

  const [imageHeight, setImageHeight] =
    useState(0);

  const [zoom, setZoom] =
    useState(1);

  const [position, setPosition] =
    useState<Position>({
      x: 50,
      y: 50,
    });

  const [imageChanged, setImageChanged] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState("");

  function resetImage() {
    setSourceImage(
      banner?.image_url ?? null
    );

    setFileName(null);

    setImageWidth(0);
    setImageHeight(0);

    setZoom(1);

    setPosition({
      x: 50,
      y: 50,
    });

    setImageChanged(false);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  }

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);

    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file.type)
    ) {
      setError(
        "Only JPG, PNG and WebP images are allowed."
      );

      event.target.value = "";

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        "Image must be 5 MB or smaller."
      );

      event.target.value = "";

      return;
    }

    const objectUrl =
      URL.createObjectURL(file);

    const image =
      new Image();

    image.onload = () => {
      setImageWidth(
        image.naturalWidth
      );

      setImageHeight(
        image.naturalHeight
      );

      setSourceImage(objectUrl);

      setFileName(file.name);

      setZoom(1);

      setPosition({
        x: 50,
        y: 50,
      });

      setImageChanged(true);
    };

    image.onerror = () => {
      URL.revokeObjectURL(
        objectUrl
      );

      setError(
        "Unable to read this image."
      );
    };

    image.src = objectUrl;
  }

  async function createCroppedImage(): Promise<File> {
    if (!sourceImage) {
      throw new Error(
        "Please select a banner image."
      );
    }

    const image =
      await loadImage(
        sourceImage
      );

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      OUTPUT_WIDTH;

    canvas.height =
      OUTPUT_HEIGHT;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) {
      throw new Error(
        "Unable to process image."
      );
    }

    const scale = Math.max(
      OUTPUT_WIDTH /
        image.naturalWidth,
      OUTPUT_HEIGHT /
        image.naturalHeight
    );

    const scaledWidth =
      image.naturalWidth *
      scale *
      zoom;

    const scaledHeight =
      image.naturalHeight *
      scale *
      zoom;

    const extraX =
      scaledWidth -
      OUTPUT_WIDTH;

    const extraY =
      scaledHeight -
      OUTPUT_HEIGHT;

    const drawX =
      -(extraX *
        (position.x / 100));

    const drawY =
      -(extraY *
        (position.y / 100));

    ctx.fillStyle =
      "#ffffff";

    ctx.fillRect(
      0,
      0,
      OUTPUT_WIDTH,
      OUTPUT_HEIGHT
    );

    ctx.drawImage(
      image,
      drawX,
      drawY,
      scaledWidth,
      scaledHeight
    );

    let quality = 0.82;

    let blob =
      await canvasToBlob(
        canvas,
        quality
      );

    while (
      blob.size > TARGET_SIZE &&
      quality > 0.35
    ) {
      quality -= 0.06;

      blob =
        await canvasToBlob(
          canvas,
          quality
        );
    }

    return new File(
      [blob],
      getOutputFileName(),
      {
        type: "image/jpeg",
      }
    );
  }

  function getOutputFileName() {
    const baseName =
      fileName
        ?.replace(
          /\.[^/.]+$/,
          ""
        )
        .replace(
          /[^a-zA-Z0-9-_]/g,
          "-"
        ) ||
      "banner";

    return `${baseName}-${Date.now()}.jpg`;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    setLoading(true);

    try {
      const form =
        event.currentTarget;

      const formData =
        new FormData(form);

      const supabase =
        createClient();

      let newStoragePath:
        | string
        | null = null;

      /*
       * CREATE MODE
       *
       * Image is required.
       */

      if (
        !isEdit &&
        !sourceImage
      ) {
        throw new Error(
          "Please select a banner image."
        );
      }

      /*
       * EDIT MODE
       *
       * If image wasn't changed,
       * keep existing image data.
       */

      if (
        isEdit &&
        !imageChanged
      ) {
        if (
          banner?.image_url
        ) {
          formData.set(
            "image_url",
            banner.image_url
          );
        }

        if (
          banner?.storage_path
        ) {
          formData.set(
            "storage_path",
            banner.storage_path
          );
        }
      }

      /*
       * NEW IMAGE
       *
       * Crop → Compress → Upload
       */

      if (imageChanged) {
        setUploadProgress(
          "Preparing image..."
        );

        const croppedFile =
          await createCroppedImage();

        setUploadProgress(
          "Uploading image..."
        );

        newStoragePath =
          `banners/${crypto.randomUUID()}.jpg`;

        const {
          error: uploadError,
        } =
          await supabase.storage
            .from(
              "promotional-banners"
            )
            .upload(
              newStoragePath,
              croppedFile,
              {
                contentType:
                  "image/jpeg",
                cacheControl:
                  "31536000",
                upsert: false,
              }
            );

        if (uploadError) {
          throw new Error(
            uploadError.message
          );
        }

        const {
          data: publicUrlData,
        } =
          supabase.storage
            .from(
              "promotional-banners"
            )
            .getPublicUrl(
              newStoragePath
            );

        formData.set(
          "image_url",
          publicUrlData.publicUrl
        );

        formData.set(
          "storage_path",
          newStoragePath
        );
      }

      /*
       * Original file input isn't
       * needed by server action.
       */

      formData.delete(
        "image"
      );

      /*
       * CREATE
       */

      if (!isEdit) {
        setUploadProgress(
          "Saving banner..."
        );

        const result =
          await createPromotionalBanner(
            formData
          );

        if (!result.success) {
          /*
           * DB insert failed.
           * Remove newly uploaded image.
           */

          if (newStoragePath) {
            await supabase.storage
              .from(
                "promotional-banners"
              )
              .remove([
                newStoragePath,
              ]);
          }

          throw new Error(
            result.error ||
              "Unable to create banner."
          );
        }

        window.location.href =
          "/admin/offers/banners";

        return;
      }

      /*
       * EDIT
       */

      if (!banner) {
        throw new Error(
          "Banner data is missing."
        );
      }

      setUploadProgress(
        "Saving changes..."
      );

      const result =
        await updatePromotionalBanner(
          banner.id,
          formData
        );

      if (!result.success) {
        /*
         * Update failed.
         * Remove newly uploaded image.
         */

        if (newStoragePath) {
          await supabase.storage
            .from(
              "promotional-banners"
            )
            .remove([
              newStoragePath,
            ]);
        }

        throw new Error(
          result.error ||
            "Unable to update banner."
        );
      }

      /*
       * New image successfully saved.
       *
       * Remove old image from
       * Supabase Storage.
       */

      if (
        newStoragePath &&
        banner.storage_path &&
        banner.storage_path !==
          newStoragePath
      ) {
        await supabase.storage
          .from(
            "promotional-banners"
          )
          .remove([
            banner.storage_path,
          ]);
      }

      window.location.href =
        "/admin/offers/banners";
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);

      setUploadProgress("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* =====================================================
          BANNER INFORMATION
      ====================================================== */}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Banner Information
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Add the content that will
            appear on your promotional
            banner.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Title */}

          <div className="lg:col-span-2">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-semibold"
            >
              Banner Title
            </label>

            <input
              id="title"
              name="title"
              required
              defaultValue={
                banner?.title ?? ""
              }
              placeholder="Eid Special Sale"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Description */}

          <div className="lg:col-span-2">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={
                banner?.description ??
                ""
              }
              placeholder="Celebrate Eid with our latest fashion collection."
              className="w-full resize-none rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Discount */}

          <div>
            <label
              htmlFor="discount_text"
              className="mb-2 block text-sm font-semibold"
            >
              Discount Text
            </label>

            <input
              id="discount_text"
              name="discount_text"
              defaultValue={
                banner?.discount_text ??
                ""
              }
              placeholder="Up to 30% OFF"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Display Order */}

          <div>
            <label
              htmlFor="display_order"
              className="mb-2 block text-sm font-semibold"
            >
              Display Order
            </label>

            <input
              id="display_order"
              name="display_order"
              type="number"
              min="0"
              defaultValue={
                banner?.display_order ??
                0
              }
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          BANNER IMAGE
      ====================================================== */}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Banner Image
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Recommended ratio: 1600 × 600.
            You can crop and reposition
            the image before uploading.
          </p>
        </div>

        {!sourceImage ? (
          <label
            htmlFor="banner-image"
            className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center transition hover:border-sky-400 hover:bg-sky-50"
          >
            <ImagePlus
              size={36}
              className="text-neutral-400"
            />

            <p className="mt-3 font-medium">
              Upload Banner Image
            </p>

            <p className="mt-1 text-xs text-neutral-500">
              JPG, PNG or WebP • Maximum
              5 MB
            </p>

            <input
              ref={fileInputRef}
              id="banner-image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={
                handleImageChange
              }
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-5">
            {/* Preview */}

            <div className="overflow-hidden rounded-xl border bg-neutral-900">
              <div className="relative mx-auto aspect-[1600/600] max-h-[420px] w-full overflow-hidden bg-neutral-900">
                <img
                  src={sourceImage}
                  alt={
                    banner?.title ||
                    "Banner preview"
                  }
                  className="absolute h-full w-full select-none object-cover"
                  style={{
                    objectPosition: `${position.x}% ${position.y}%`,
                    transform: `scale(${zoom})`,
                  }}
                />

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-xs text-white">
                    <Move size={14} />
                    Banner Preview
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}

            <div className="grid gap-5 md:grid-cols-3">
              {/* Zoom */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Zoom
                  </label>

                  <span className="text-xs text-neutral-500">
                    {zoom.toFixed(1)}
                    x
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <ZoomOut
                    size={17}
                    className="text-neutral-500"
                  />

                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(
                      event
                    ) =>
                      setZoom(
                        Number(
                          event.target
                            .value
                        )
                      )
                    }
                    className="w-full"
                  />

                  <ZoomIn
                    size={17}
                    className="text-neutral-500"
                  />
                </div>
              </div>

              {/* Horizontal */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Horizontal
                  </label>

                  <span className="text-xs text-neutral-500">
                    {Math.round(
                      position.x
                    )}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={position.x}
                  onChange={(
                    event
                  ) =>
                    setPosition({
                      ...position,
                      x: Number(
                        event.target
                          .value
                      ),
                    })
                  }
                  className="w-full"
                />
              </div>

              {/* Vertical */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Vertical
                  </label>

                  <span className="text-xs text-neutral-500">
                    {Math.round(
                      position.y
                    )}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={position.y}
                  onChange={(
                    event
                  ) =>
                    setPosition({
                      ...position,
                      y: Number(
                        event.target
                          .value
                      ),
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>

            {/* File information */}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-neutral-50 px-4 py-3">
              <div className="text-xs text-neutral-500">
                {fileName ? (
                  <>
                    <div>
                      {fileName}
                    </div>

                    {imageWidth >
                      0 &&
                      imageHeight >
                        0 && (
                        <div className="mt-1">
                          Original:{" "}
                          {
                            imageWidth
                          }{" "}
                          ×{" "}
                          {
                            imageHeight
                          }
                          px
                        </div>
                      )}
                  </>
                ) : (
                  <div>
                    Existing banner
                    image
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSourceImage(
                    null
                  );
                  setImageChanged(
                    false
                  );
                  setFileName(null);

                  if (
                    fileInputRef.current
                  ) {
                    fileInputRef.current.value =
                      "";
                  }
                }}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-white"
              >
                <X size={14} />

                {isEdit
                  ? "Remove Image"
                  : "Change Image"}
              </button>
            </div>
          </div>
        )}

        {/* Hidden existing image data */}

        {isEdit &&
          !imageChanged && (
            <>
              <input
                type="hidden"
                name="image_url"
                value={
                  banner?.image_url ??
                  ""
                }
                readOnly
              />

              <input
                type="hidden"
                name="storage_path"
                value={
                  banner?.storage_path ??
                  ""
                }
                readOnly
              />
            </>
          )}
      </div>

      {/* =====================================================
          BUTTON SETTINGS
      ====================================================== */}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">
          Button Settings
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Configure the call-to-action
          button.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {/* Button Text */}

          <div>
            <label
              htmlFor="button_text"
              className="mb-2 block text-sm font-semibold"
            >
              Button Text
            </label>

            <input
              id="button_text"
              name="button_text"
              defaultValue={
                banner?.button_text ??
                "Shop Now"
              }
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Button Link */}

          <div>
            <label
              htmlFor="button_link"
              className="mb-2 block text-sm font-semibold"
            >
              Button Link
            </label>

            <input
              id="button_link"
              name="button_link"
              defaultValue={
                banner?.button_link ??
                ""
              }
              placeholder="/shop"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          SCHEDULE
      ====================================================== */}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">
          Schedule
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Optionally control when the banner
          becomes visible.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {/* Start */}

          <div>
            <label
              htmlFor="start_at"
              className="mb-2 block text-sm font-semibold"
            >
              Start Date & Time
            </label>

            <input
              id="start_at"
              name="start_at"
              type="datetime-local"
              defaultValue={formatDateTimeLocal(
                banner?.start_at
              )}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* End */}

          <div>
            <label
              htmlFor="end_at"
              className="mb-2 block text-sm font-semibold"
            >
              End Date & Time
            </label>

            <input
              id="end_at"
              name="end_at"
              type="datetime-local"
              defaultValue={formatDateTimeLocal(
                banner?.end_at
              )}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          DISPLAY SETTINGS
      ====================================================== */}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">
          Display Settings
        </h2>

        <div className="mt-5 space-y-4">
          {/* Active */}

          <label className="flex cursor-pointer gap-3">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={
                banner?.is_active ??
                true
              }
              className="mt-1 h-4 w-4"
            />

            <span>
              <span className="block text-sm font-medium">
                Active
              </span>

              <span className="text-xs text-neutral-500">
                Make this banner available
                on the homepage.
              </span>
            </span>
          </label>

          {/* Dismissible */}

          <label className="flex cursor-pointer gap-3">
            <input
              type="checkbox"
              name="is_dismissible"
              defaultChecked={
                banner?.is_dismissible ??
                true
              }
              className="mt-1 h-4 w-4"
            />

            <span>
              <span className="block text-sm font-medium">
                Allow users to close the
                banner
              </span>

              <span className="text-xs text-neutral-500">
                Customers can dismiss this
                banner from the homepage.
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          ACTIONS
      ====================================================== */}

      <div className="flex items-center justify-between gap-4">
        <div className="text-xs text-neutral-500">
          {uploadProgress && (
            <span>
              {uploadProgress}
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/offers/banners"
            className="rounded-xl border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-sky-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
                ? "Save Changes"
                : "Create Banner"}
          </button>
        </div>
      </div>
    </form>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function loadImage(
  src: string
): Promise<HTMLImageElement> {
  return new Promise(
    (resolve, reject) => {
      const image =
        new Image();

      image.onload = () =>
        resolve(image);

      image.onerror = () =>
        reject(
          new Error(
            "Unable to load image."
          )
        );

      image.src = src;
    }
  );
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise(
    (resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "Unable to compress image."
              )
            );

            return;
          }

          resolve(blob);
        },
        "image/jpeg",
        quality
      );
    }
  );
}

function formatDateTimeLocal(
  value?: string | null
): string {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  const hours =
    String(
      date.getHours()
    ).padStart(2, "0");

  const minutes =
    String(
      date.getMinutes()
    ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}