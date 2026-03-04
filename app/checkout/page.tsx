"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios, { AxiosResponse } from "axios";
import { SiStripe, SiPaypal } from "react-icons/si";
import { cormorant, lora } from "../fonts";
import FreeAddressValidator from "../components/FreeAddressValidator";
import { formatRoundedCents, roundUpCentsToNearestTenDollars, roundUpToNearestTenDollars } from "../../lib/money";

let stripePromise: ReturnType<typeof loadStripe> | null = null;

const getStripeClient = async () => {
  if (!stripePromise) {
    let publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    // Fallback to server-provided key if NEXT_PUBLIC env is not present at build time.
    if (!publishableKey) {
      const response: AxiosResponse<{ publishableKey?: string; error?: string }> = await axios.get("/api/stripe-config");
      publishableKey = response.data.publishableKey;
      if (!publishableKey) {
        throw new Error(response.data.error || "Stripe publishable key is not configured.");
      }
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};

type ShippingAddress = {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const CHECKOUT_DRAFT_KEY = "mha-checkout-draft-v1";

const defaultShippingAddress: ShippingAddress = {
  name: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

type CheckoutDraft = {
  product: string;
  basePriceDollars: number;
  returnTo: string;
  shippingOption: "shipping" | "pickup";
  checkoutEmail: string;
  shippingAddress: ShippingAddress;
  shippingCost: number;
};

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const CheckoutContent = () => {
  const router = useRouter();
  // Read product details from URL query parameters
  const searchParams = useSearchParams();
  const product = searchParams.get("product") || "";
  const returnToFromQuery = searchParams.get("returnTo");
  const normalizedReturnToFromQuery =
    returnToFromQuery && returnToFromQuery.startsWith("/") && !returnToFromQuery.startsWith("//")
      ? returnToFromQuery
      : "";
  const priceParam = searchParams.get("price");
  const parsedBasePrice = priceParam ? Number.parseFloat(priceParam) : 20;
  const basePriceDollars = roundUpToNearestTenDollars(Number.isFinite(parsedBasePrice) ? parsedBasePrice : 20);
  // Stripe expects amounts in cents.
  const BASE_PRICE = roundUpCentsToNearestTenDollars(basePriceDollars * 100);

  // Local state
  const [shippingOption, setShippingOption] = useState<"shipping" | "pickup">("shipping");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(defaultShippingAddress);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [checkoutEmail, setCheckoutEmail] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [returnToPath, setReturnToPath] = useState<string>(normalizedReturnToFromQuery);
  const [isDraftInitialized, setIsDraftInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || isDraftInitialized) return;

    let parsedDraft: CheckoutDraft | null = null;

    try {
      const raw = window.sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
      if (raw) parsedDraft = JSON.parse(raw) as CheckoutDraft;
    } catch {
      parsedDraft = null;
    }

    const resolvedReturnTo = normalizedReturnToFromQuery || parsedDraft?.returnTo || "";
    if (resolvedReturnTo) setReturnToPath(resolvedReturnTo);

    const hasCheckoutParams = Boolean(product && priceParam);

    // If user returns to bare /checkout (e.g., from browser back), send them to the artwork page.
    if (!hasCheckoutParams && resolvedReturnTo) {
      router.replace(resolvedReturnTo);
      return;
    }

    // Restore shipping info if it's the same artwork/price.
    if (
      parsedDraft &&
      parsedDraft.product === product &&
      parsedDraft.basePriceDollars === basePriceDollars
    ) {
      setShippingOption(parsedDraft.shippingOption);
      setCheckoutEmail(parsedDraft.checkoutEmail || "");
      setShippingAddress({ ...defaultShippingAddress, ...parsedDraft.shippingAddress });
      setShippingCost(0);
    }

    setIsDraftInitialized(true);
  }, [
    isDraftInitialized,
    normalizedReturnToFromQuery,
    product,
    priceParam,
    basePriceDollars,
    router,
  ]);

  useEffect(() => {
    if (typeof window === "undefined" || !isDraftInitialized) return;
    if (!product || !priceParam) return;

    const draft: CheckoutDraft = {
      product,
      basePriceDollars,
      returnTo: returnToPath,
      shippingOption,
      checkoutEmail,
      shippingAddress,
      shippingCost,
    };

    window.sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
  }, [
    isDraftInitialized,
    product,
    priceParam,
    basePriceDollars,
    returnToPath,
    shippingOption,
    checkoutEmail,
    shippingAddress,
    shippingCost,
  ]);

  // Shipping is free site-wide.
  const totalPrice = BASE_PRICE;

  const handleShippingAddressChange = (address: ShippingAddress) => {
    setShippingAddress(address);
    setShippingCost(0);
  };

  // Handler for Stripe checkout: call your API route that creates a Stripe Checkout session.
  const handleStripeCheckout = async (): Promise<void> => {
    // Validate address only for shipping option
    if (!isValidEmail(checkoutEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (shippingOption === "shipping") {
      if (!shippingAddress.name || !shippingAddress.addressLine1 || !shippingAddress.city) {
        setErrorMessage("Please fill in all required shipping fields.");
        return;
      }
    }

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const response = await axios.post("/api/create-stripe-checkout-session", {
        amount: totalPrice,
        product: product,
        checkoutEmail: checkoutEmail.trim(),
        shippingAddress: shippingOption === "pickup" ? null : shippingAddress,
        billingAddress: null, // Let Stripe collect billing info
        shippingOption: shippingOption,
        returnTo: returnToPath || null,
      });
      const { sessionId } = response.data;
      const stripe = await getStripeClient();
      if (!stripe) throw new Error("Stripe failed to load. Please check configuration.");
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data?.error;
        setErrorMessage(typeof apiError === "string" ? apiError : (error.message || "Stripe checkout failed."));
        console.error(error.message);
      } else if (error instanceof Error) {
        setErrorMessage(error.message || "Stripe checkout failed.");
        console.error(error.message);
      } else {
        setErrorMessage("Stripe checkout failed.");
        console.error(error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler for PayPal: create an order on your server.
  const createPayPalOrder = async (): Promise<string> => {
    try {
      console.log('Creating PayPal order with:', {
        amount: formatRoundedCents(totalPrice),
        shippingOption,
        hasShippingAddress: !!shippingAddress.name,
      });
      
      const response = await axios.post("/api/paypal/createorder", {
        amount: formatRoundedCents(totalPrice), // rounded dollars, no decimals
        checkoutEmail: checkoutEmail.trim(),
        shippingAddress: shippingOption === "pickup" ? null : shippingAddress,
        billingAddress: null, // Let PayPal collect billing info
        shippingOption: shippingOption,
      });
      
      console.log('PayPal order response:', response.data);
      
      if (!response.data || !response.data.orderId) {
        throw new Error('No order ID received from server');
      }
      
      return response.data.orderId as string;
    } catch (error: unknown) {
      console.error('PayPal order creation error:', error);
      let errorMessage = "PayPal order creation failed.";
      
      if (error instanceof Error) {
        errorMessage = "PayPal order creation failed: " + error.message;
      } else if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.error || error.message;
        errorMessage = "PayPal order creation failed: " + errorMsg;
      }
      
      setErrorMessage(errorMessage);
      
      // Throw error to prevent PayPal SDK from proceeding with empty order ID
      throw new Error(errorMessage);
    }
  };

  // onPayPalApprove: handle approval by capturing the order on the server.
  const onPayPalApprove = async (data: Record<string, unknown>): Promise<void> => {
    try {
      const orderId = data.orderID as string;
      const response = await axios.post("/api/paypal/captureorder", { orderId });
      if (response.data.success) {
        window.location.href = "/success";
      } else {
        throw new Error("Order capture failed");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage("PayPal capture failed: " + error.message);
        console.error(error.message);
      } else {
        setErrorMessage("PayPal capture failed.");
        console.error(error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-paper to-accent-cream">
      <div className="max-w-4xl mx-auto py-12 px-6">
        {/* Elegant Header */}
        <div className="text-center mb-12">
          <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light text-brown mb-4 tracking-wide`}>
            Complete Your Purchase
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-olive to-transparent mx-auto mb-6"></div>
          <p className={`${lora.className} text-lg text-warm-gray max-w-2xl mx-auto leading-relaxed`}>
            Acquiring <span className="italic font-medium text-brown">&ldquo;{product}&rdquo;</span> - A unique piece from the curated collection
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Options */}
            <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl p-8 shadow-vintage-lg">
              <h2 className={`${cormorant.className} text-2xl font-medium mb-6 text-brown flex items-center`}>
                Delivery Method
              </h2>
              <div className="space-y-4">
                <label className="group cursor-pointer block">
                  <div className={`border-2 rounded-xl p-6 transition-all duration-300 ${
                    shippingOption === "shipping" 
                      ? "border-olive bg-olive/5 shadow-md" 
                      : "border-tan/50 hover:border-olive/50 hover:bg-olive/2"
                  }`}>
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="shippingOption"
                        value="shipping"
                        checked={shippingOption === "shipping"}
                        onChange={() => {
                          setShippingOption("shipping");
                          setShippingCost(0);
                        }}
                        className="mt-1 h-5 w-5 text-olive focus:ring-olive border-tan"
                      />
                      <div className="ml-4 flex-1">
                        <h3 className={`${lora.className} font-medium text-brown mb-2`}>Professional Shipping</h3>
                        <p className="text-warm-gray text-sm leading-relaxed">
                          Your artwork will be carefully packaged and shipped directly to your address at no extra cost.
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
                
                <label className="group cursor-pointer block">
                  <div className={`border-2 rounded-xl p-6 transition-all duration-300 ${
                    shippingOption === "pickup" 
                      ? "border-olive bg-olive/5 shadow-md" 
                      : "border-tan/50 hover:border-olive/50 hover:bg-olive/2"
                  }`}>
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="shippingOption"
                        value="pickup"
                        checked={shippingOption === "pickup"}
                        onChange={() => {
                          setShippingOption("pickup");
                          setShippingCost(0);
                        }}
                        className="mt-1 h-5 w-5 text-olive focus:ring-olive border-tan"
                      />
                      <div className="ml-4 flex-1">
                        <h3 className={`${lora.className} font-medium text-brown mb-2`}>Gallery Pickup in Marble Falls, TX</h3>
                        <p className="text-warm-gray text-sm leading-relaxed">
                          Schedule a personal appointment to acquire your artwork. A perfect opportunity to discuss the piece and the artistic process.
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Address Section */}
            {shippingOption === "shipping" ? (
              <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl p-8 shadow-vintage-lg">
                <h2 className={`${cormorant.className} text-2xl font-medium mb-6 text-brown flex items-center`}>
                  Delivery Address
                </h2>
                
                <FreeAddressValidator
                  currentAddress={shippingAddress}
                  onAddressChange={handleShippingAddressChange}
                  className="block w-full rounded-lg border border-tan/50 bg-white/90 px-4 py-3 text-brown placeholder-warm-gray/60 focus:border-olive focus:ring-2 focus:ring-olive/20 transition-all duration-200"
                />
                <div className="mt-6 bg-olive/5 rounded-lg p-4 border border-tan/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`${lora.className} font-medium text-brown`}>Shipping</span>
                    <span className={`${lora.className} font-medium text-olive`}>Free</span>
                  </div>
                  <p className="text-sm text-warm-gray">
                    Free shipping is included. Please allow about 2 weeks to package and ship your artwork.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl p-8 shadow-vintage-lg">
                <h2 className={`${cormorant.className} text-2xl font-medium mb-6 text-brown flex items-center`}>
                  Gallery Appointment Details
                </h2>
                <div className="bg-gradient-to-r from-accent-cream to-paper rounded-xl p-6 border border-tan/30">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div>
                        <h4 className="font-medium text-brown">Gallery Location</h4>
                        <p className="text-warm-gray">Marble Falls, Texas</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div>
                        <h4 className="font-medium text-brown">Appointment Coordination</h4>
                        <p className="text-warm-gray">Gallery Pickup instructions will be sent via email after payment</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div>
                        <h4 className="font-medium text-brown">Flexible Scheduling</h4>
                        <p className="text-warm-gray">Personal appointments available by arrangement</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-3 bg-olive/10 rounded-lg">
                    <p className="text-sm text-olive font-medium">
                      Your billing information will be collected securely during checkout
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl p-8 shadow-vintage-lg">
              <h2 className={`${cormorant.className} text-2xl font-medium mb-6 text-brown flex items-center`}>
                Payment Method
              </h2>

              <div className="mb-6">
                <label htmlFor="checkout-email" className={`${lora.className} block text-brown font-medium mb-2`}>
                  Email for Confirmation
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  value={checkoutEmail}
                  onChange={(event) => setCheckoutEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="block w-full rounded-lg border border-tan/50 bg-white/90 px-4 py-3 text-brown placeholder-warm-gray/60 focus:border-olive focus:ring-2 focus:ring-olive/20 transition-all duration-200"
                  required
                />
                <p className="mt-2 text-sm text-warm-gray">
                  We&apos;ll send your receipt and shipping updates to this email.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <label className="group cursor-pointer">
                  <div className={`border-2 rounded-xl p-6 transition-all duration-300 ${
                    paymentMethod === "stripe" 
                      ? "border-olive bg-olive/5 shadow-md" 
                      : "border-tan/50 hover:border-olive/50 hover:bg-olive/2"
                  }`}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="stripe"
                        checked={paymentMethod === "stripe"}
                        onChange={() => setPaymentMethod("stripe")}
                        className="h-5 w-5 text-olive focus:ring-olive border-tan"
                      />
                      <SiStripe className="w-8 h-8 ml-4 mr-3 text-brown" />
                      <span className={`${lora.className} font-medium text-brown`}>Stripe/Card</span>
                    </div>
                  </div>
                </label>
                <label className="group cursor-pointer">
                  <div className={`border-2 rounded-xl p-6 transition-all duration-300 ${
                    paymentMethod === "paypal" 
                      ? "border-olive bg-olive/5 shadow-md" 
                      : "border-tan/50 hover:border-olive/50 hover:bg-olive/2"
                  }`}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentMethod === "paypal"}
                        onChange={() => setPaymentMethod("paypal")}
                        className="h-5 w-5 text-olive focus:ring-olive border-tan"
                      />
                      <SiPaypal className="w-8 h-8 ml-4 mr-3 text-brown" />
                      <span className={`${lora.className} font-medium text-brown`}>PayPal</span>
                    </div>
                  </div>
                </label>
              </div>

              {/* Error Messages */}
              {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Payment Buttons */}
              {paymentMethod === "stripe" ? (
                <button
                  onClick={handleStripeCheckout}
                  disabled={isProcessing}
                  className={`w-full bg-gradient-to-r from-brown to-warm-gray text-ivory px-8 py-4 rounded-xl hover:from-warm-gray hover:to-brown transition-all duration-500 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none border border-opacity-20 border-white relative overflow-hidden group ${lora.className} font-medium`}
                >
                  <span className="relative z-10 flex items-center justify-center text-ivory">
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-ivory" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : "Continue with Stripe/Card"}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
                </button>
              ) : (
                <div>
                  {!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-amber-700 text-sm">PayPal payment is temporarily unavailable. Please use card payment or contact support.</p>
                    </div>
                  ) : (
                    <PayPalScriptProvider
                      options={{
                        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                        currency: "USD",
                        intent: "capture",
                      }}
                    >
                      <PayPalButtons
                        style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal", height: 55 }}
                        createOrder={async (): Promise<string> => {
                          try {
                            if (!isValidEmail(checkoutEmail)) {
                              setErrorMessage("Please enter a valid email address.");
                              throw new Error("Please enter a valid email address.");
                            }
                            if (shippingOption === "shipping") {
                              if (!shippingAddress.name || !shippingAddress.addressLine1 || !shippingAddress.city) {
                                setErrorMessage("Please fill in all required shipping fields.");
                                throw new Error("Please fill in all required shipping fields.");
                              }
                            }
                            const orderId = await createPayPalOrder();
                            return orderId;
                          } catch (error) {
                            console.error("PayPal createOrder error:", error);
                            // Re-throw the error to prevent PayPal from proceeding
                            throw error;
                          }
                        }}
                        onApprove={onPayPalApprove}
                        onError={(err: unknown) => {
                          console.error("PayPal Error:", err);
                          setErrorMessage("PayPal payment failed. Please try again or use card payment.");
                        }}
                      />
                    </PayPalScriptProvider>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm border border-tan/30 rounded-2xl p-8 shadow-vintage-lg sticky top-8">
              <h2 className={`${cormorant.className} text-2xl font-medium mb-6 text-brown`}>Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-tan/30">
                  <span className={`${lora.className} text-warm-gray`}>Artwork Price</span>
                  <span className={`${lora.className} font-medium text-brown`}>{formatRoundedCents(BASE_PRICE)}</span>
                </div>
                
                {shippingOption === "shipping" ? (
                  <div className="flex justify-between items-center py-3 border-b border-tan/30">
                    <span className={`${lora.className} text-warm-gray`}>Shipping</span>
                    <span className={`${lora.className} font-medium text-olive`}>Free</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center py-3 border-b border-tan/30">
                    <span className={`${lora.className} text-warm-gray`}>Gallery Pickup</span>
                    <span className={`${lora.className} font-medium text-olive`}>Free</span>
                  </div>
                )}
              </div>
              
              <div className="bg-gradient-to-r from-olive/10 to-brown/10 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className={`${cormorant.className} text-xl font-medium text-brown`}>Total</span>
                  <span className={`${cormorant.className} text-2xl font-bold text-brown`}>{formatRoundedCents(totalPrice)}</span>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-warm-gray leading-relaxed">
                  Secure payment processing. Your information is protected with industry-standard encryption.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CheckoutPageWrapper() {
  return (
    <Suspense fallback={<div className="text-brown bg-ivory min-h-screen flex items-center justify-center">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
