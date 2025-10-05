"use client";

import { useState } from "react";
import { cormorant, lora } from "../fonts";
import { useRouter } from "next/navigation";

interface CanvasItem {
  id: number;
  option: string; // one of the predefined options OR "custom"
  customWidth: string; // used when option === "custom"
  customHeight: string; // used when option === "custom"
  quantity: number;
}

// Predefined canvas options (no duplicates)
const predefinedOptions = [
  `24" X 36"`,
  `24" X 48"`,
  `30" X 40"`,
  `6" X 6"`,
  `4" X 6"`,
  `5" X 7"`,
  `8" X 8"`,
  `10" X 10"`,
  `12" X 12"`,
  `14" X 14"`,
  `18" X 18"`,
  `20" X 20"`,
  `8" X 10"`,
  `8" X 16"`,
  `9" X 12"`,
  `10" X 20"`,
  `11" X 14"`,
  `12" X 16"`,
  `12" X 24"`,
  `14" X 18"`,
  `16" X 20"`,
  `18" X 24"`,
  `20" X 24"`,
  `22" X 28"`,
  `24" X 30"`,
  `20" X 36"`,
  `12" X 36"`,
  `36" X 48"`,
  `30" X 30"`,
  `36" X 36"`,
  `48" X 48"`,
  `48" X 60"`,
];

const pricePerSqInch = 1;

export default function CommissionsPage() {
  // Client info state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");

  // Canvas items state
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([
    {
      id: 1,
      option: predefinedOptions[0],
      customWidth: "",
      customHeight: "",
      quantity: 1,
    },
  ]);

  // Place useRouter hook inside the component body.
  const router = useRouter();

  // Helper to parse dimensions from a string like '24" X 36"'
  const parseDimensions = (option: string): { width: number; height: number } | null => {
    const parts = option.toLowerCase().split("x");
    if (parts.length === 2) {
      const w = parseFloat(parts[0].replace(/[^0-9.]/g, ""));
      const h = parseFloat(parts[1].replace(/[^0-9.]/g, ""));
      if (!isNaN(w) && !isNaN(h)) {
        return { width: w, height: h };
      }
    }
    return null;
  };

  // Sort predefined options from largest to smallest (by area)
  const sortedPredefinedOptions = predefinedOptions.slice().sort((a, b) => {
    const dimsA = parseDimensions(a);
    const dimsB = parseDimensions(b);
    const areaA = dimsA ? dimsA.width * dimsA.height : 0;
    const areaB = dimsB ? dimsB.width * dimsB.height : 0;
    return areaB - areaA;
  });

  // Calculate raw price for a single canvas item
  const calculateItemPrice = (item: CanvasItem): number => {
    let width: number, height: number;
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
    const area = width * height;
    return area * pricePerSqInch * item.quantity;
  };

  // Helper to get effective price per item using our rounding rule:
  // - If the raw price is under $100:
  //     * If it's under $50, return $50.
  //     * Otherwise, round up to the next multiple of $25.
  // - If $100 or more, use the raw price.
  const getEffectivePrice = (raw: number): number => {
    if (raw <= 0) return 0;
    return raw < 250 ? 250 : raw;
  };

  // Calculate overall effective total by summing each item's effective price
  const effectiveTotal = canvasItems.reduce(
    (sum, item) => sum + getEffectivePrice(calculateItemPrice(item)),
    0
  );
  const upfrontCost = effectiveTotal * 0.2;

  // Handlers
  const handleCanvasOptionChange = (id: number, value: string) => {
    setCanvasItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              option: value,
              // Reset custom dimensions if not "custom"
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
          ? { ...item, [field]: field === "quantity" ? parseInt(value) || 1 : value }
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted", {
      name,
      email,
      description,
      canvasItems,
      effectiveTotal,
      upfrontCost,
    });
    // Prepare submission data
    const formData = { name, email, description, canvasItems, effectiveTotal, upfrontCost };

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        throw new Error("Failed to send email");
      }
      console.log("Email sent successfully!");
      router.push("/success");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("There was an error sending your message. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-paper to-accent-cream">
      <div className="max-w-4xl mx-auto py-16 px-6">
        {/* Elegant Header */}
        <div className="text-center mb-12">
          <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light text-brown mb-4 tracking-wide`}>
            Commission a Custom Piece
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-olive to-transparent mx-auto mb-6"></div>
          <div className={`${lora.className} text-lg text-warm-gray max-w-3xl mx-auto leading-relaxed space-y-4`}>
            <p>
              Thank you for your interest in a custom piece. Commissions are available at a
              rate of <span className="font-semibold text-brown">$1 per square inch</span>.
            </p>
            <p className="text-base">
              <span className="italic">Please note:</span> A 20% upfront non‐recoverable deposit is required to cover materials.
            </p>
          </div>
        </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Client Information */}
        <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl p-8 shadow-vintage-lg">
          <h2 className={`${cormorant.className} text-2xl font-medium mb-6 text-brown flex items-center`}>

            Your Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className={`block text-brown font-medium mb-2 ${lora.className}`}>
                Your Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Your full name"
                className="w-full border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className={`block text-brown font-medium mb-2 ${lora.className}`}>
                Your Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="example@email.com"
                className="w-full border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-6">
            <label htmlFor="description" className={`block text-brown font-medium mb-2 ${lora.className}`}>
              Artwork Description or Notes
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Tell us about your ideas (colors, style, subject)..."
              className="w-full border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* Canvas Options */}
        <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl p-8 shadow-vintage-lg">
          <h2 className={`${cormorant.className} text-2xl font-medium mb-6 text-brown flex items-center`}>

            Canvas Selections
          </h2>
          <div className="space-y-6">
            {canvasItems.map((item) => (
              <div key={item.id} className="border border-tan/50 bg-gradient-to-r from-ivory to-paper p-6 rounded-xl shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Canvas Size Selector */}
                  <div>
                    <label className={`block text-brown font-medium mb-2 ${lora.className}`}>Canvas Size</label>
                    <select
                      value={item.option}
                      onChange={(e) => handleCanvasOptionChange(item.id, e.target.value)}
                      className="w-full border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
                    >
                      {sortedPredefinedOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                      <option value="custom">Custom Size</option>
                    </select>
                  </div>

                  {/* Custom Dimensions */}
                  {item.option === "custom" && (
                    <>
                      <div>
                        <label className={`block text-brown font-medium mb-2 ${lora.className}`}>
                          Custom Width (inches)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.customWidth}
                          onChange={(e) =>
                            handleCanvasItemChange(item.id, "customWidth", e.target.value)
                          }
                          className="w-full border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-brown font-medium mb-2 ${lora.className}`}>
                          Custom Height (inches)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.customHeight}
                          onChange={(e) =>
                            handleCanvasItemChange(item.id, "customHeight", e.target.value)
                          }
                          className="w-full border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
                          required
                        />
                      </div>
                    </>
                  )}
                  {item.option !== "custom" && (
                    <div className="md:col-span-2">
                      <div className="h-14"></div>
                    </div>
                  )}
                  {/* Quantity */}
                  <div className={item.option === "custom" ? "md:col-start-1" : "md:col-start-3"}>
                    <label className={`block text-brown font-medium mb-2 ${lora.className}`}>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleCanvasItemChange(item.id, "quantity", e.target.value)
                      }
                      className="w-full border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {item.option === "custom" && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">
                      Note: I'll source the canvas for custom sizes, and pricing may increase depending on the dimensions.
                    </p>
                  </div>
                )}

                {/* Updated per-item total using the effective pricing */}
                <div className="mt-4 p-4 bg-olive/10 rounded-lg">
                  <p className={`${lora.className} font-semibold text-brown`}>
                    Estimated Total: ${getEffectivePrice(calculateItemPrice(item)).toFixed(2)}
                  </p>
                </div>

                {canvasItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCanvasItem(item.id)}
                    className="mt-4 text-red-600 hover:text-red-800 font-medium text-sm underline transition-colors duration-200"
                  >
                    Remove Item
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addCanvasItem}
              className="w-full bg-gradient-to-r from-tan to-brown text-white px-6 py-3 rounded-lg hover:from-brown hover:to-warm-gray transition-all duration-400 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
            >
              Add Another Canvas
            </button>
          </div>
        </div>

        {/* Overall Calculation & Summary */}
        <div className="bg-white/90 backdrop-blur-sm border border-tan/30 rounded-2xl p-8 shadow-vintage-lg">
          <h2 className={`${cormorant.className} text-2xl font-medium mb-6 text-brown flex items-center`}>
            Commission Summary
          </h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center py-3 border-b border-tan/30">
              <span className={`${lora.className} text-warm-gray`}>Total Commission Cost</span>
              <span className={`${cormorant.className} text-2xl font-bold text-brown`}>${effectiveTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-tan/30">
              <span className={`${lora.className} text-warm-gray`}>Upfront Deposit (20%)</span>
              <span className={`${lora.className} font-semibold text-olive`}>${upfrontCost.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-accent-cream to-paper rounded-xl p-6 border border-tan/30 space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-olive rounded-full mt-2 flex-shrink-0"></div>
              <p className={`${lora.className} text-sm text-brown leading-relaxed`}>
                Smaller canvas sizes 14&quot; x 18&quot; and under have fixed prices rather than the normal $1 per square inch to account for creation time and materials.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-olive rounded-full mt-2 flex-shrink-0"></div>
              <p className={`${lora.className} text-sm text-brown leading-relaxed`}>
                This form is just a request for a commission. I will reach out to you to discuss the details and provide a final quote.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-olive rounded-full mt-2 flex-shrink-0"></div>
              <p className={`${lora.className} text-sm text-brown leading-relaxed`}>
                I may not be able to accept all commissions due to time constraints but will do my best to accommodate. Thank you so much for your interest in my work! I look forward to working with you.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className={`bg-gradient-to-r from-btn-brown to-btn-brown-hover text-paper px-8 py-4 rounded-lg hover:from-btn-brown-hover hover:to-brown transition-all duration-500 font-serif text-lg shadow-vintage hover:shadow-vintage-lg transform hover:-translate-y-1 border border-opacity-20 border-paper relative overflow-hidden group ${lora.className}`}
          >
            <span className="relative z-10">Submit Commission Request</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-paper to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
