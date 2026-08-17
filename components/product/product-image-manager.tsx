"use client";

import Image from "next/image";
import {
  ChangeEvent,
  FormEvent,
  PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Trash2,
  Star,
  Upload,
  ImagePlus,
  X,
  ZoomIn,
  Move,
  Check,
} from "lucide-react";

import {
  deleteProductImage,
  setPrimaryProductImage,
  uploadProductImages,
} from "@/lib/actions/product-image";

import type { ProductImage } from "@/types/product-image";

type ProductImageManagerProps = {
  productId: string;
  images: ProductImage[];
};

type SelectedImage = {
  file: File;
  preview: string;
};

type CropState = {
  x: number;
  y: number;
  zoom: number;
};

const MAX_IMAGES = 3;
const TARGET_SIZE = 300 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

/* =========================================================
   IMAGE COMPRESSION
========================================================= */

async function compressImage(
  file: File
): Promise<File> {
  const objectUrl =
    URL.createObjectURL(file);

  try {
    const image =
      await new Promise<HTMLImageElement>(
        (resolve, reject) => {
          const img =
            new window.Image();

          img.onload = () =>
            resolve(img);

          img.onerror = () =>
            reject(
              new Error(
                "Unable to read image."
              )
            );

          img.src = objectUrl;
        }
      );

    let width = image.naturalWidth;
    let height = image.naturalHeight;

    const maxDimension = 1600;

    if (
      width > maxDimension ||
      height > maxDimension
    ) {
      const ratio = Math.min(
        maxDimension / width,
        maxDimension / height
      );

      width = Math.round(
        width * ratio
      );

      height = Math.round(
        height * ratio
      );
    }

    let quality = 0.82;

    for (
      let attempt = 0;
      attempt < 8;
      attempt++
    ) {
      const canvas =
        document.createElement(
          "canvas"
        );

      canvas.width = width;
      canvas.height = height;

      const context =
        canvas.getContext("2d");

      if (!context) {
        throw new Error(
          "Unable to process image."
        );
      }

      context.drawImage(
        image,
        0,
        0,
        width,
        height
      );

      const blob =
        await new Promise<Blob | null>(
          (resolve) => {
            canvas.toBlob(
              resolve,
              "image/webp",
              quality
            );
          }
        );

      if (!blob) {
        throw new Error(
          "Unable to compress image."
        );
      }

      if (
        blob.size <= TARGET_SIZE ||
        attempt === 7
      ) {
        const baseName =
          file.name.replace(
            /\.[^/.]+$/,
            ""
          );

        return new File(
          [blob],
          `${baseName}.webp`,
          {
            type: "image/webp",
            lastModified:
              Date.now(),
          }
        );
      }

      if (quality > 0.45) {
        quality -= 0.08;
      } else {
        width = Math.round(
          width * 0.85
        );

        height = Math.round(
          height * 0.85
        );

        quality = 0.65;
      }
    }

    return file;
  } finally {
    URL.revokeObjectURL(
      objectUrl
    );
  }
}

/* =========================================================
   FILE SIZE
========================================================= */

function formatFileSize(
  bytes: number
) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(
      bytes / 1024
    ).toFixed(0)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}

/* =========================================================
   COMPONENT
========================================================= */

export function ProductImageManager({
  productId,
  images,
}: ProductImageManagerProps) {
  const inputRefs =
    useRef<
      Array<HTMLInputElement | null>
    >([]);

  const cropImageRef =
    useRef<HTMLImageElement | null>(
      null
    );

  const cropAreaRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const dragRef =
    useRef<{
      active: boolean;
      startX: number;
      startY: number;
      originX: number;
      originY: number;
    }>({
      active: false,
      startX: 0,
      startY: 0,
      originX: 0,
      originY: 0,
    });

  const [
    selectedImages,
    setSelectedImages,
  ] = useState<
    Array<SelectedImage | null>
  >([null, null, null]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    compressing,
    setCompressing,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState<string | null>(
    null
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  /* =======================================================
     CROP STATE
  ======================================================== */

  const [
    cropSlot,
    setCropSlot,
  ] = useState<number | null>(
    null
  );

  const [
    cropPreview,
    setCropPreview,
  ] = useState<string | null>(
    null
  );

  const [
    cropState,
    setCropState,
  ] = useState<CropState>({
    x: 0,
    y: 0,
    zoom: 1,
  });

  const existingImageCount =
    images.length;

  const availableSlots =
    Math.max(
      0,
      MAX_IMAGES -
        existingImageCount
    );

  const selectedCount =
    selectedImages.filter(
      Boolean
    ).length;

  const totalAfterUpload =
    existingImageCount +
    selectedCount;

  /* =========================================================
     SELECT IMAGE
  ========================================================= */

  async function handleSelectImage(
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setError(null);
    setMessage(null);

    if (
      !ALLOWED_TYPES.includes(
        file.type
      )
    ) {
      setError(
        "Only JPG, PNG and WebP images are allowed."
      );

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Each original image must be 5 MB or smaller."
      );

      return;
    }

    try {
      setCompressing(true);

      const compressed =
        await compressImage(file);

      const preview =
        URL.createObjectURL(
          compressed
        );

      /*
       * Open crop editor.
       */

      setCropSlot(index);
      setCropPreview(preview);

      setCropState({
        x: 0,
        y: 0,
        zoom: 1,
      });
    } catch {
      setError(
        "Unable to process this image. Please try another image."
      );
    } finally {
      setCompressing(false);
    }
  }

  /* =========================================================
     APPLY CROP POSITION
  ========================================================= */

  async function applyCrop() {
    if (
      cropSlot === null ||
      !cropPreview
    ) {
      return;
    }

    const slot =
      cropSlot;

    const image =
      cropImageRef.current;

    const cropArea =
      cropAreaRef.current;

    if (!image || !cropArea) {
      return;
    }

    const areaRect =
      cropArea.getBoundingClientRect();

    const imageRect =
      image.getBoundingClientRect();

    const canvas =
      document.createElement(
        "canvas"
      );

    /*
     * Final product image is square.
     */

    const outputSize = 1200;

    canvas.width =
      outputSize;

    canvas.height =
      outputSize;

    const context =
      canvas.getContext("2d");

    if (!context) {
      return;
    }

    /*
     * Calculate the visible crop
     * based on the actual displayed
     * image position.
     */

    const scaleX =
      image.naturalWidth /
      imageRect.width;

    const scaleY =
      image.naturalHeight /
      imageRect.height;

    const cropLeft =
      (areaRect.left -
        imageRect.left) *
      scaleX;

    const cropTop =
      (areaRect.top -
        imageRect.top) *
      scaleY;

    const cropWidth =
      areaRect.width *
      scaleX;

    const cropHeight =
      areaRect.height *
      scaleY;

    context.drawImage(
      image,
      cropLeft,
      cropTop,
      cropWidth,
      cropHeight,
      0,
      0,
      outputSize,
      outputSize
    );

    const blob =
      await new Promise<Blob | null>(
        (resolve) => {
          canvas.toBlob(
            resolve,
            "image/webp",
            0.92
          );
        }
      );

    if (!blob) {
      setError(
        "Unable to crop image."
      );

      return;
    }

    /*
     * Compress final cropped image.
     */

    const croppedFile =
      new File(
        [blob],
        `product-image-${slot + 1}.webp`,
        {
          type: "image/webp",
          lastModified:
            Date.now(),
        }
      );

    const finalFile =
      await compressImage(
        croppedFile
      );

    const finalPreview =
      URL.createObjectURL(
        finalFile
      );

    setSelectedImages(
      (current) => {
        const updated = [
          ...current,
        ];

        if (
          updated[slot]?.preview
        ) {
          URL.revokeObjectURL(
            updated[slot]!
              .preview
          );
        }

        updated[slot] = {
          file: finalFile,
          preview: finalPreview,
        };

        return updated;
      }
    );

    /*
     * Close crop editor.
     */

    URL.revokeObjectURL(
      cropPreview
    );

    setCropPreview(null);
    setCropSlot(null);
    setCropState({
      x: 0,
      y: 0,
      zoom: 1,
    });
  }

  /* =========================================================
     CANCEL CROP
  ========================================================= */

  function cancelCrop() {
    if (cropPreview) {
      URL.revokeObjectURL(
        cropPreview
      );
    }

    setCropPreview(null);
    setCropSlot(null);

    setCropState({
      x: 0,
      y: 0,
      zoom: 1,
    });
  }

  /* =========================================================
     DRAG START
  ========================================================= */

  function handleCropPointerDown(
    event: PointerEvent<HTMLDivElement>
  ) {
    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    dragRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: cropState.x,
      originY: cropState.y,
    };
  }

  /* =========================================================
     DRAG MOVE
  ========================================================= */

  function handleCropPointerMove(
    event: PointerEvent<HTMLDivElement>
  ) {
    if (
      !dragRef.current.active
    ) {
      return;
    }

    const deltaX =
      event.clientX -
      dragRef.current.startX;

    const deltaY =
      event.clientY -
      dragRef.current.startY;

    setCropState(
      (current) => ({
        ...current,
        x:
          dragRef.current
            .originX +
          deltaX,
        y:
          dragRef.current
            .originY +
          deltaY,
      })
    );
  }

  /* =========================================================
     DRAG END
  ========================================================= */

  function handleCropPointerUp() {
    dragRef.current.active =
      false;
  }

  /* =========================================================
     REMOVE SELECTED IMAGE
  ========================================================= */

  function removeSelectedImage(
    index: number
  ) {
    setSelectedImages(
      (current) => {
        const updated = [
          ...current,
        ];

        if (
          updated[index]?.preview
        ) {
          URL.revokeObjectURL(
            updated[index]!
              .preview
          );
        }

        updated[index] = null;

        return updated;
      }
    );

    setError(null);
    setMessage(null);
  }

  /* =========================================================
     UPLOAD
  ========================================================= */

  async function handleUpload(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const files =
      selectedImages
        .filter(
          (
            item
          ): item is SelectedImage =>
            item !== null
        )
        .map(
          (item) => item.file
        );

    if (!files.length) {
      setError(
        "Please select at least one image."
      );

      return;
    }

    if (
      existingImageCount +
        files.length >
      MAX_IMAGES
    ) {
      setError(
        `A product can have a maximum of ${MAX_IMAGES} images.`
      );

      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const formData =
        new FormData();

      files.forEach((file) => {
        formData.append(
          "files",
          file
        );
      });

      const result =
        await uploadProductImages(
          productId,
          formData
        );

      if (!result.success) {
        setError(
          result.error ||
            "Unable to upload images."
        );

        return;
      }

      selectedImages.forEach(
        (item) => {
          if (item?.preview) {
            URL.revokeObjectURL(
              item.preview
            );
          }
        }
      );

      setSelectedImages([
        null,
        null,
        null,
      ]);

      setMessage(
        "Images uploaded successfully."
      );

      window.location.reload();
    } catch {
      setError(
        "Something went wrong while uploading."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     SET PRIMARY
  ========================================================= */

  async function handleSetPrimary(
    imageId: string
  ) {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result =
        await setPrimaryProductImage(
          productId,
          imageId
        );

      if (!result.success) {
        setError(
          result.error ||
            "Unable to set primary image."
        );

        return;
      }

      setMessage(
        "Primary image updated."
      );

      window.location.reload();
    } catch {
      setError(
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     DELETE EXISTING IMAGE
  ========================================================= */

  async function handleDelete(
    imageId: string
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to permanently delete this image?"
      );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result =
        await deleteProductImage(
          productId,
          imageId
        );

      if (!result.success) {
        setError(
          result.error ||
            "Unable to delete image."
        );

        return;
      }

      setMessage(
        "Image deleted successfully."
      );

      window.location.reload();
    } catch {
      setError(
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     UPLOAD SLOT
  ========================================================= */

  function renderUploadSlot(
    index: number
  ) {
    const selected =
      selectedImages[index];

    const slotNumber =
      index + 1;

    return (
      <div
        key={index}
        className="relative"
      >
        <input
          ref={(element) => {
            inputRefs.current[
              index
            ] = element;
          }}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) =>
            handleSelectImage(
              index,
              event
            )
          }
        />

        <div
          className={`relative h-56 w-full overflow-hidden rounded-xl border-2 transition ${
            selected
              ? "border-sky-300 bg-neutral-100"
              : "border-dashed border-neutral-300 bg-neutral-50"
          }`}
        >
          {selected ? (
            <>
              <img
                src={selected.preview}
                alt={`Selected image ${slotNumber}`}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-x-0 bottom-0 bg-black/65 px-3 py-2">
                <p className="truncate text-xs font-medium text-white">
                  {selected.file.name}
                </p>

                <p className="mt-0.5 text-[11px] text-white/80">
                  {formatFileSize(
                    selected.file
                      .size
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  removeSelectedImage(
                    index
                  )
                }
                disabled={loading}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
                aria-label={`Remove image ${slotNumber}`}
              >
                <X size={16} />
              </button>

              <button
                type="button"
                onClick={() =>
                  inputRefs.current[
                    index
                  ]?.click()
                }
                disabled={
                  loading ||
                  compressing
                }
                className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-sm transition hover:bg-white disabled:opacity-50"
              >
                Change
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() =>
                inputRefs.current[
                  index
                ]?.click()
              }
              disabled={
                loading ||
                compressing
              }
              className="flex h-full w-full flex-col items-center justify-center px-4 text-center transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                <ImagePlus
                  size={20}
                />
              </div>

              <p className="text-sm font-semibold text-neutral-800">
                Image {slotNumber}
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                Click to select
              </p>

              <p className="mt-1 text-[11px] text-neutral-400">
                Crop & optimize
              </p>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* =====================================================
          UPLOAD
      ====================================================== */}

      <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">

        <div className="mb-5">

          <h2 className="text-lg font-semibold text-neutral-950">
            Upload Product Images
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Upload up to 3 images. Adjust
            the image position before upload.
            Images are optimized to approximately
            300 KB.
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">

            <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-600">
              JPG
            </span>

            <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-600">
              PNG
            </span>

            <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-600">
              WebP
            </span>

            <span className="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700">
              ~300 KB / image
            </span>

          </div>

        </div>

        {availableSlots === 0 ? (
          <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-5">

            <div className="flex items-start gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                <Star
                  size={17}
                  fill="currentColor"
                />
              </div>

              <div>

                <p className="text-sm font-semibold text-green-800">
                  Maximum images uploaded
                </p>

                <p className="mt-1 text-xs leading-5 text-green-700">
                  This product already has
                  3 images. Delete an existing
                  image if you want to upload
                  a different one.
                </p>

              </div>

            </div>

          </div>
        ) : (
          <form
            onSubmit={handleUpload}
          >

            {/* Narrower upload grid */}

            <div className="grid max-w-[900px] gap-3 sm:grid-cols-3">
              {Array.from(
                {
                  length:
                    availableSlots,
                },
                (_, index) =>
                  renderUploadSlot(
                    index
                  )
              )}
            </div>

            <div className="mt-5 flex max-w-[900px] flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm font-medium text-neutral-700">
                  {selectedCount} of{" "}
                  {availableSlots}{" "}
                  image slot
                  {availableSlots !==
                  1
                    ? "s"
                    : ""}{" "}
                  selected
                </p>

                {selectedCount >
                  0 && (
                  <p className="mt-1 text-xs text-neutral-500">
                    Total after upload:{" "}
                    {totalAfterUpload} /{" "}
                    {MAX_IMAGES} images
                  </p>
                )}

              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  compressing ||
                  selectedCount ===
                    0
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <Upload size={17} />

                {compressing
                  ? "Optimizing Images..."
                  : loading
                    ? "Uploading..."
                    : "Upload Images"}

              </button>

            </div>

          </form>
        )}

      </div>

      {/* =====================================================
          MESSAGES
      ====================================================== */}

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          GALLERY
      ====================================================== */}

      <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">

        <div className="mb-5">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-lg font-semibold text-neutral-950">
                Product Gallery
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Manage primary image and
                gallery images.
              </p>

            </div>

            <span className="w-fit rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
              {images.length} /{" "}
              {MAX_IMAGES} images
            </span>

          </div>

        </div>

        {images.length === 0 ? (
          <div className="rounded-xl border border-dashed px-6 py-14 text-center">

            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-600">
              <ImagePlus
                size={22}
              />
            </div>

            <p className="font-medium text-neutral-700">
              No images uploaded yet.
            </p>

            <p className="mt-1 text-sm text-neutral-500">
              Select up to 3 images above
              to create the product gallery.
            </p>

          </div>
        ) : (
          <div className="grid max-w-[900px] gap-4 sm:grid-cols-3">

            {images.map(
              (image) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-xl border bg-white"
                >

                  <div className="relative h-64 bg-neutral-100">

                    <Image
                      src={
                        image.image_url
                      }
                      alt={
                        image.alt_text ||
                        "Product image"
                      }
                      fill
                      className="object-cover"
                      sizes="300px"
                    />

                    {image.is_primary && (
                      <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white shadow-sm">
                        <Star
                          size={13}
                          fill="currentColor"
                        />
                        Primary
                      </div>
                    )}

                  </div>

                  <div className="space-y-3 p-4">

                    <div className="flex items-center justify-between text-xs text-neutral-500">

                      <span>
                        Position{" "}
                        {image.sort_order +
                          1}
                      </span>

                      <span>
                        {image.is_primary
                          ? "Main image"
                          : "Gallery"}
                      </span>

                    </div>

                    <div className="flex gap-2">

                      {!image.is_primary && (
                        <button
                          type="button"
                          disabled={
                            loading
                          }
                          onClick={() =>
                            handleSetPrimary(
                              image.id
                            )
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-yellow-50 hover:text-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Star
                            size={14}
                          />
                          Set Primary
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={
                          loading
                        }
                        onClick={() =>
                          handleDelete(
                            image.id
                          )
                        }
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Delete image"
                      >
                        <Trash2
                          size={15}
                        />
                      </button>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

      {/* =====================================================
          CROP MODAL
      ====================================================== */}

      {cropPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">

          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="flex items-center justify-between border-b px-5 py-4">

              <div>

                <h3 className="text-lg font-semibold text-neutral-950">
                  Adjust Image
                </h3>

                <p className="mt-1 text-xs text-neutral-500">
                  Drag the image to position
                  it and use zoom to adjust
                  the crop.
                </p>

              </div>

              <button
                type="button"
                onClick={cancelCrop}
                className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
              >
                <X size={19} />
              </button>

            </div>

            {/* Crop Area */}

            <div className="flex justify-center bg-neutral-950 p-5">

              <div
                ref={cropAreaRef}
                className="relative h-[360px] w-[360px] max-w-full overflow-hidden rounded-xl bg-neutral-900 shadow-inner"
                onPointerDown={
                  handleCropPointerDown
                }
                onPointerMove={
                  handleCropPointerMove
                }
                onPointerUp={
                  handleCropPointerUp
                }
                onPointerCancel={
                  handleCropPointerUp
                }
                style={{
                  touchAction:
                    "none",
                  cursor:
                    "grab",
                }}
              >

                <img
                  ref={
                    cropImageRef
                  }
                  src={cropPreview}
                  alt="Crop preview"
                  draggable={false}
                  className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
                  style={{
                    width: `${
                      100 *
                      cropState.zoom
                    }%`,
                    height:
                      "auto",
                    transform: `translate(-50%, -50%) translate(${cropState.x}px, ${cropState.y}px)`,
                  }}
                />

                {/* Crop guide */}

                <div className="pointer-events-none absolute inset-0 border-2 border-white/80" />

                <div className="pointer-events-none absolute inset-0">

                  <div className="absolute left-1/3 top-0 h-full border-l border-white/30" />

                  <div className="absolute left-2/3 top-0 h-full border-l border-white/30" />

                  <div className="absolute left-0 top-1/3 w-full border-t border-white/30" />

                  <div className="absolute left-0 top-2/3 w-full border-t border-white/30" />

                </div>

              </div>

            </div>

            {/* Controls */}

            <div className="space-y-4 px-5 py-5">

              <div className="flex items-center gap-3">

                <ZoomIn
                  size={17}
                  className="shrink-0 text-neutral-500"
                />

                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={
                    cropState.zoom
                  }
                  onChange={(event) =>
                    setCropState(
                      (current) => ({
                        ...current,
                        zoom: Number(
                          event.target
                            .value
                        ),
                      })
                    )
                  }
                  className="w-full"
                />

                <span className="w-12 text-right text-xs font-medium text-neutral-600">
                  {cropState.zoom.toFixed(
                    1
                  )}
                  x
                </span>

              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-500">

                <Move size={14} />

                Drag the image inside
                the square to position it

              </div>

            </div>

            {/* Actions */}

            <div className="flex justify-end gap-3 border-t bg-neutral-50 px-5 py-4">

              <button
                type="button"
                onClick={cancelCrop}
                className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={applyCrop}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                <Check size={17} />
                Apply Crop
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}