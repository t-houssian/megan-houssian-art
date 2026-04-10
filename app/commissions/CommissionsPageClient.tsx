"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { cormorant, lora } from "../fonts";
import { formatRoundedDollars, roundUpToNearestTenDollars } from "../../lib/money";
import type { CommissionsPageSettings } from "../../lib/commissions-page-settings";

interface CanvasItem {
  id: number;
  option: string;
  customWidth: string;
  customHeight: string;
  quantity: number;
}

interface ReferenceImage {
  file: File;
  preview: string;
}

type CommissionsPageClientProps = {
  settings: CommissionsPageSettings;
};

const MAX_UPLOAD_TOTAL_BYTES = 25 * 1024 * 1024;

export default function CommissionsPageClient({ settings }: CommissionsPageClientProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const referenceInputRef = useRef<HTMLInputElement | null>(null);
  const referenceImagesCacheRef = useRef<ReferenceImage[]>([]);

  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([
    {
      id: 1,
      option: settings.predefinedCanvasOptions[0],
      customWidth: "",
      customHeight: "",
      quantity: 1,
    },
  ]);

  const router = useRouter();

  const parseDimensions = (option: string): { width: number; height: number } | null => {
    const parts = option.toLowerCase().split("x");
    if (parts.length === 2) {
      const width = parseFloat(parts[0].replace(/[^0-9.]/g, ""));
      const height = parseFloat(parts[1].replace(/[^0-9.]/g, ""));
      if (!isNaN(width) && !isNaN(height)) {
        return { width, height };
      }
    }
    return null;
  };

  const sortedPredefinedOptions = settings.predefinedCanvasOptions.slice().sort((a, b) => {
    const dimsA = parseDimensions(a);
    const dimsB = parseDimensions(b);
    const areaA = dimsA ? dimsA.width * dimsA.height : 0;
    const areaB = dimsB ? dimsB.width * dimsB.height : 0;
    return areaB - areaA;
  });

  const calculateItemPrice = (item: CanvasItem): number => {
    let width: number;
    let height: number;

    if (item.option === "custom") {
      width = parseFloat(item.customWidth);
      height = parseFloat(item.customHeight);
    } else {
      const dims = parseDimensions(item.option);
      if (!dims) return 0;
      width = dims.width;
      height = dims.height;
    }

    if (isNaN(width) || isNaN(height)) return 0;
    return width * height * settings.pricePerSquareInch * item.quantity;
  };

  const getEffectivePrice = (raw: number): number => {
    if (raw <= 0) return 0;
    const basePrice = raw < settings.minimumCommissionPrice ? settings.minimumCommissionPrice : raw;
    return roundUpToNearestTenDollars(basePrice);
  };

  const effectiveTotal = canvasItems.reduce(
    (sum, item) => sum + getEffectivePrice(calculateItemPrice(item)),
    0
  );
  const upfrontCost = roundUpToNearestTenDollars(effectiveTotal * (settings.depositPercentage / 100));

  const handleCanvasOptionChange = (id: number, value: string) => {
    setCanvasItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              option: value,
              customWidth: value === "custom" ? item.customWidth : "",
              customHeight: value === "custom" ? item.customHeight : "",
            }
          : item
      )
    );
  };

  const handleCanvasItemChange = (
    id: number,
    field: "customWidth" | "customHeight" | "quantity",
    value: string
  ) => {
    setCanvasItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, [field]: field === "quantity" ? parseInt(value, 10) || 1 : value }
          : item
      )
    );
  };

  const addCanvasItem = () => {
    const newId = Math.max(...canvasItems.map((item) => item.id)) + 1;
    setCanvasItems((prev) => [
      ...prev,
      {
        id: newId,
        option: sortedPredefinedOptions[0],
        customWidth: "",
        customHeight: "",
        quantity: 1,
      },
    ]);
  };

  const removeCanvasItem = (id: number) => {
    setCanvasItems((prev) => prev.filter((item) => item.id !== id));
  };

  const appendReferenceImages = (files: File[]) => {
    if (!files.length) return;

    setReferenceImages((prev) => {
      const signatures = new Set(
        prev.map((item) => `${item.file.name}-${item.file.size}-${item.file.lastModified}`)
      );

      const newItems: ReferenceImage[] = [];
      let newBytes = 0;
      let hasNonImage = false;
      let hasDuplicates = false;

      files.forEach((file) => {
        if (!file.type.startsWith("image/")) {
          hasNonImage = true;
          return;
        }

        const signature = `${file.name}-${file.size}-${file.lastModified}`;
        if (signatures.has(signature)) {
          hasDuplicates = true;
          return;
        }

        const preview = URL.createObjectURL(file);
        newItems.push({ file, preview });
        signatures.add(signature);
        newBytes += file.size;
      });

      if (!newItems.length) {
        if (hasNonImage) {
          setUploadError("Only image files can be uploaded.");
        } else if (hasDuplicates) {
          setUploadError("These files are already added.");
        }
        return prev;
      }

      const existingBytes = prev.reduce((sum, item) => sum + item.file.size, 0);
      if (existingBytes + newBytes > MAX_UPLOAD_TOTAL_BYTES) {
        newItems.forEach((item) => URL.revokeObjectURL(item.preview));
        setUploadError("Please keep reference images under 25MB in total.");
        return prev;
      }

      setUploadError(
        hasNonImage
          ? "Some files were skipped because they were not images."
          : hasDuplicates
            ? "Some files were skipped because they were already added."
            : null
      );

      return [...prev, ...newItems];
    });
  };

  const handleReferenceImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    appendReferenceImages(files);
    event.target.value = "";
  };

  const handleDropZoneClick = () => {
    referenceInputRef.current?.click();
  };

  const handleDropZoneKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      referenceInputRef.current?.click();
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDragActive(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    const target = event.relatedTarget as Node | null;
    if (target && event.currentTarget.contains(target)) {
      return;
    }
    setIsDragActive(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    const files = Array.from(event.dataTransfer?.files ?? []);
    appendReferenceImages(files);
  };

  const removeReferenceImage = (index: number) => {
    setReferenceImages((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return next;
    });
    setUploadError(null);
    if (referenceInputRef.current) {
      referenceInputRef.current.value = "";
    }
  };

  useEffect(() => {
    referenceImagesCacheRef.current = referenceImages;
  }, [referenceImages]);

  useEffect(() => {
    return () => {
      referenceImagesCacheRef.current.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, []);

  const referenceImagesTotalSize = referenceImages.reduce((sum, image) => sum + image.file.size, 0);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const size = bytes / Math.pow(1024, exponent);
    return `${size.toFixed(size >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (referenceImagesTotalSize > MAX_UPLOAD_TOTAL_BYTES) {
      setUploadError("Please keep reference images under 25MB in total.");
      return;
    }

    const submission = new FormData();
    submission.append("formType", "commission");
    submission.append("name", name);
    submission.append("email", email);
    submission.append("description", description);
    submission.append("canvasItems", JSON.stringify(canvasItems));
    submission.append("effectiveTotal", effectiveTotal.toString());
    submission.append("upfrontCost", upfrontCost.toString());
    submission.append("referenceImagesTotalBytes", referenceImagesTotalSize.toString());
    referenceImages.forEach(({ file }) => {
      submission.append("referenceImages", file);
    });

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        body: submission,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || "Failed to send email");
      }

      router.push("/success");
    } catch (error) {
      console.error("Error sending email:", error);
      if (error instanceof Error && error.message.includes("25MB")) {
        setUploadError("Attachments exceed the 25MB limit. Please remove or compress your files.");
      } else {
        alert("There was an error sending your message. Please try again later.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-paper to-accent-cream">
      <div className="max-w-4xl mx-auto py-16 px-6">
        <div className="text-center mb-12">
          <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light text-brown mb-4 tracking-wide`}>
            {settings.pageTitle}
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-olive to-transparent mx-auto"></div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl p-8 shadow-vintage-lg mb-10">
          <p className={`${lora.className} text-brown/80 leading-relaxed mb-3`}>
            {settings.introLead}
          </p>
          <div className="mb-6">
            <h3 className={`${lora.className} text-brown font-semibold mb-3`}>{settings.checklistHeading}</h3>
            <ul className={`${lora.className} list-disc list-outside pl-6 space-y-2 text-sm text-warm-gray leading-relaxed marker:text-olive/80`}>
              {settings.checklistItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <p className={`${lora.className} text-brown/80 leading-relaxed`}>
            {settings.introClosing}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl p-8 shadow-vintage-lg">
            <h2 className={`${cormorant.className} text-2xl font-medium mb-6 text-brown flex items-center`}>
              {settings.informationSectionTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className={`block text-brown font-medium mb-2 ${lora.className}`}>
                  {settings.nameLabel}
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder={settings.namePlaceholder}
                  className="w-full border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email" className={`block text-brown font-medium mb-2 ${lora.className}`}>
                  {settings.emailLabel}
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder={settings.emailPlaceholder}
                  className="w-full border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>
            <div className="mt-6">
              <label htmlFor="description" className={`block text-brown font-medium mb-2 ${lora.className}`}>
                {settings.descriptionLabel}
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder={settings.descriptionPlaceholder}
                className="w-full border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              ></textarea>
            </div>

            <div className="mt-6">
              <label
                htmlFor="referenceImages"
                className={`block text-brown font-medium mb-3 ${lora.className}`}
              >
                {settings.referenceImagesLabel}
              </label>
              <input
                ref={referenceInputRef}
                id="referenceImages"
                type="file"
                accept="image/*"
                multiple
                onChange={handleReferenceImagesChange}
                className="sr-only"
              />
              <div
                role="button"
                tabIndex={0}
                onClick={handleDropZoneClick}
                onKeyDown={handleDropZoneKeyDown}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${isDragActive ? "border-olive bg-olive/10 shadow-vintage-lg" : "border-tan/60 bg-white/70 hover:border-olive/60 hover:bg-olive/10"}`}
                aria-label="Upload reference images"
              >
                <svg
                  className="h-12 w-12 text-olive/80"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16V4m0 0-4 4m4-4 4 4M4 16h16v4H4z"
                  />
                </svg>
                <p className={`${lora.className} text-brown font-medium`}>
                  {settings.referenceImagesDropzoneTitle}
                </p>
                <p className="text-sm text-warm-gray">{settings.referenceImagesDropzoneHint}</p>
              </div>
              {uploadError && (
                <p
                  className={`mt-3 text-sm ${
                    uploadError.includes("skipped") || uploadError.includes("already added")
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
                >
                  {uploadError}
                </p>
              )}
              {referenceImages.length > 0 && (
                <div className="mt-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {referenceImages.map((image, index) => (
                      <div
                        key={`${image.file.name}-${index}`}
                        className="group relative overflow-hidden rounded-xl border border-tan/40 bg-white/90 shadow-sm"
                      >
                        <Image
                          src={image.preview}
                          alt={`Reference ${image.file.name}`}
                          width={640}
                          height={256}
                          unoptimized
                          className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="p-3 text-left">
                          <p className="text-sm font-medium text-brown truncate">{image.file.name}</p>
                          <p className="mt-1 text-xs text-warm-gray">{formatFileSize(image.file.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeReferenceImage(index)}
                          className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm font-semibold text-red-600 shadow-sm transition-colors duration-200 hover:bg-red-600 hover:text-white"
                          aria-label={`Remove ${image.file.name}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-warm-gray">
                    <span>
                      {referenceImages.length} {referenceImages.length === 1 ? "image" : "images"}
                    </span>
                    <span>Total: {formatFileSize(referenceImagesTotalSize)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl p-8 shadow-vintage-lg">
            <h2 className={`${cormorant.className} text-2xl font-medium mb-6 text-brown flex items-center`}>
              {settings.canvasSectionTitle}
            </h2>
            <div className="space-y-6">
              {canvasItems.map((item) => {
                const isCustom = item.option === "custom";
                const gridCols = isCustom ? "md:grid-cols-4" : "md:grid-cols-2";
                const quantityColClasses = isCustom
                  ? "md:col-span-1 md:col-start-4"
                  : "md:col-span-1 md:col-start-2";

                return (
                  <div
                    key={item.id}
                    className="border border-tan/50 bg-gradient-to-r from-ivory to-paper p-6 rounded-xl shadow-sm"
                  >
                    <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
                      <div className="md:col-span-1">
                        <label className={`block text-brown font-medium mb-2 ${lora.className}`}>
                          {settings.canvasSizeLabel}
                        </label>
                        <select
                          value={item.option}
                          onChange={(event) => handleCanvasOptionChange(item.id, event.target.value)}
                          className="w-full border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
                        >
                          {sortedPredefinedOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                          <option value="custom">{settings.customSizeLabel}</option>
                        </select>
                      </div>

                      {item.option === "custom" && (
                        <>
                          <div className="md:col-span-1">
                            <label className={`block text-brown font-medium mb-2 ${lora.className}`}>
                              {settings.customWidthLabel}
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.customWidth}
                              onChange={(event) =>
                                handleCanvasItemChange(item.id, "customWidth", event.target.value)
                              }
                              className="w-full border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
                              required
                            />
                          </div>
                          <div className="md:col-span-1">
                            <label className={`block text-brown font-medium mb-2 ${lora.className}`}>
                              {settings.customHeightLabel}
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.customHeight}
                              onChange={(event) =>
                                handleCanvasItemChange(item.id, "customHeight", event.target.value)
                              }
                              className="w-full border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
                              required
                            />
                          </div>
                        </>
                      )}

                      <div className={`md:self-end ${quantityColClasses}`}>
                        <label className={`block text-brown font-medium mb-2 ${lora.className}`}>
                          {settings.quantityLabel}
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) =>
                            handleCanvasItemChange(item.id, "quantity", event.target.value)
                          }
                          className="w-full border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    {item.option === "custom" && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-700">{settings.customSizeNote}</p>
                      </div>
                    )}

                    <div className="mt-4 p-4 bg-olive/10 rounded-lg">
                      <p className={`${lora.className} font-semibold text-brown`}>
                        {settings.itemEstimateLabel}:{" "}
                        {formatRoundedDollars(getEffectivePrice(calculateItemPrice(item)))}
                      </p>
                    </div>

                    {canvasItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCanvasItem(item.id)}
                        className="mt-4 text-red-600 hover:text-red-800 font-medium text-sm underline transition-colors duration-200"
                      >
                        {settings.removeCanvasButtonLabel}
                      </button>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={addCanvasItem}
                className={`${lora.className} w-full bg-gradient-to-r from-btn-brown to-btn-brown-hover text-paper px-6 py-3 rounded-lg border border-paper/20 hover:from-btn-brown-hover hover:to-brown transition-all duration-500 shadow-vintage hover:shadow-vintage-lg transform hover:-translate-y-0.5 font-medium`}
              >
                {settings.addCanvasButtonLabel}
              </button>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-tan/30 rounded-2xl p-8 shadow-vintage-lg">
            <h2 className={`${cormorant.className} text-2xl font-medium mb-6 text-brown flex items-center`}>
              {settings.summarySectionTitle}
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-3 border-b border-tan/30">
                <span className={`${lora.className} text-warm-gray`}>{settings.totalLabel}</span>
                <span className={`${cormorant.className} text-2xl font-bold text-brown`}>
                  {formatRoundedDollars(effectiveTotal)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-tan/30">
                <span className={`${lora.className} text-warm-gray`}>
                  {settings.depositLabel} ({settings.depositPercentage}%)
                </span>
                <span className={`${lora.className} font-semibold text-olive`}>
                  {formatRoundedDollars(upfrontCost)}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-accent-cream to-paper rounded-xl p-6 border border-tan/30 space-y-3">
              {settings.summaryNotes.map((note) => (
                <div key={note} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-olive rounded-full mt-2 flex-shrink-0"></div>
                  <p className={`${lora.className} text-sm text-brown leading-relaxed`}>{note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className={`bg-gradient-to-r from-btn-brown to-btn-brown-hover text-paper px-8 py-4 rounded-lg hover:from-btn-brown-hover hover:to-brown transition-all duration-500 font-serif text-lg shadow-vintage hover:shadow-vintage-lg transform hover:-translate-y-1 border border-opacity-20 border-paper relative overflow-hidden group ${lora.className}`}
            >
              <span className="relative z-10">{settings.submitButtonLabel}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-paper to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
