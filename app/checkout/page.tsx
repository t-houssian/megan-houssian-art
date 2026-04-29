"use client";

import React, { useState, Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios, { AxiosResponse } from "axios";
import { SiStripe, SiPaypal } from "react-icons/si";
import { cormorant, lora } from "../fonts";
import FreeAddressValidator from "../components/FreeAddressValidator";
import {
  dollarsToCents,
  formatCents,
  formatCurrencyFromCents,
  roundUpCentsToNearestTenDollars,
  roundUpToNearestTenDollars,
} from "../../lib/money";
import type { CartItem, CartPayloadItem } from "../../lib/cart-types";
import { clearCart, readCart } from "../components/cart-storage";
import {
  calculateTexasSalesTaxCents,
  shouldCollectTexasSalesTax,
  TEXAS_SALES_TAX_PERCENT_LABEL,
} from "../../lib/sales-tax";

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
  originalSlug: string;
  isTestProduct: boolean;
  returnTo: string;
  shippingOption: "shipping" | "pickup";
  checkoutEmail: string;
  earlyAccessPassword: string;
  shippingAddress: ShippingAddress;
  shippingCost: number;
};

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const getEmailValidationMessage = (paymentMethodLabel: string, email: string) => {
  if (!email.trim()) {
    return `Please enter your email above before continuing with ${paymentMethodLabel}.`;
  }

  if (!isValidEmail(email.trim())) {
    return `Please enter a valid email address above before continuing with ${paymentMethodLabel}.`;
  }

  return null;
};

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
  const originalSlug = searchParams.get("originalSlug") || "";
  const isCartCheckout = searchParams.get("cart") === "1";
  const isTestProduct = searchParams.get("testProduct") === "1";
  const parsedBasePrice = priceParam ? Number.parseFloat(priceParam) : 20;
  const rawBasePriceDollars = Number.isFinite(parsedBasePrice) ? parsedBasePrice : 20;
  const basePriceDollars = isTestProduct
    ? rawBasePriceDollars
    : roundUpToNearestTenDollars(rawBasePriceDollars);
  // Stripe expects amounts in cents.
  const BASE_PRICE = isTestProduct
    ? dollarsToCents(basePriceDollars)
    : roundUpCentsToNearestTenDollars(basePriceDollars * 100);

  // Local state
  const [shippingOption, setShippingOption] = useState<"shipping" | "pickup">("shipping");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(defaultShippingAddress);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [checkoutEmail, setCheckoutEmail] = useState<string>("");
  const [earlyAccessPassword, setEarlyAccessPassword] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [returnToPath, setReturnToPath] = useState<string>(normalizedReturnToFromQuery);
  const [isDraftInitialized, setIsDraftInitialized] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const checkoutEmailRef = useRef<HTMLInputElement>(null);
  const payPalCreateOrderErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isCartCheckout || typeof window === "undefined") return;
    setCartItems(readCart());
  }, [isCartCheckout]);

  const cartPayloadItems: CartPayloadItem[] = cartItems.map((item) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    price: item.price,
    originalSlug: item.originalSlug,
    isTestProduct: item.isTestProduct,
    printSlug: item.printSlug,
    printProductType: item.printProductType,
    printProductName: item.printProductName,
    printSize: item.printSize,
    printSizeName: item.printSizeName,
    quantity: item.quantity ?? 1,
  }));

  const earlyAccessPasswordsForCart = cartItems.reduce<Record<string, string>>((passwords, item) => {
    if (item.type === "original" && item.originalSlug && typeof window !== "undefined") {
      passwords[item.originalSlug] = window.sessionStorage.getItem(`mha-early-access-password:${item.originalSlug}`) || "";
    }
    return passwords;
  }, {});

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

    const storedEarlyAccessPassword =
      originalSlug && typeof window !== "undefined"
        ? window.sessionStorage.getItem(`mha-early-access-password:${originalSlug}`) || ""
        : "";
    if (storedEarlyAccessPassword) {
      setEarlyAccessPassword(storedEarlyAccessPassword);
    }

    const hasCheckoutParams = Boolean(product && priceParam) || isCartCheckout;

    // If user returns to bare /checkout (e.g., from browser back), send them to the artwork page.
    if (!hasCheckoutParams && resolvedReturnTo) {
      router.replace(resolvedReturnTo);
      return;
    }

    // Restore shipping info if it's the same artwork/price.
    if (
      parsedDraft &&
      parsedDraft.product === product &&
      parsedDraft.basePriceDollars === basePriceDollars &&
      parsedDraft.originalSlug === originalSlug &&
      parsedDraft.isTestProduct === isTestProduct
    ) {
      setShippingOption(parsedDraft.shippingOption);
      setCheckoutEmail(parsedDraft.checkoutEmail || "");
      setEarlyAccessPassword(storedEarlyAccessPassword || parsedDraft.earlyAccessPassword || "");
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
    originalSlug,
    isTestProduct,
    isCartCheckout,
    router,
  ]);

  useEffect(() => {
    if (typeof window === "undefined" || !isDraftInitialized) return;
    if (isCartCheckout) return;
    if (!product || !priceParam) return;

    const draft: CheckoutDraft = {
      product,
      basePriceDollars,
      originalSlug,
      isTestProduct,
      returnTo: returnToPath,
      shippingOption,
      checkoutEmail,
      earlyAccessPassword,
      shippingAddress,
      shippingCost,
    };

    window.sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
  }, [
    isDraftInitialized,
    product,
    priceParam,
    basePriceDollars,
    originalSlug,
    isTestProduct,
    returnToPath,
    shippingOption,
    checkoutEmail,
    earlyAccessPassword,
    shippingAddress,
    shippingCost,
    isCartCheckout,
  ]);

  // Shipping is free site-wide.
  const cartTotalPrice = cartItems.reduce(
    (total, item) => total + dollarsToCents(item.price * (item.quantity ?? 1)),
    0
  );
  const subtotalPrice = isCartCheckout ? cartTotalPrice : BASE_PRICE;
  const collectsSalesTax = shouldCollectTexasSalesTax(shippingOption, shippingAddress);
  const salesTaxPrice = calculateTexasSalesTaxCents(subtotalPrice, shippingOption, shippingAddress);
  const totalPrice = subtotalPrice + salesTaxPrice;
  const productDisplayName = isCartCheckout
    ? cartItems.length === 1
      ? cartItems[0].title
      : `${cartItems.length} artwork items`
    : product;

  const handleShippingAddressChange = (address: ShippingAddress) => {
    setShippingAddress(address);
    setShippingCost(0);
  };

  const focusCheckoutEmail = () => {
    checkoutEmailRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    checkoutEmailRef.current?.focus({ preventScroll: true });
  };

  const getCheckoutValidationMessage = (paymentMethodLabel: string) => {
    const emailValidationMessage = getEmailValidationMessage(paymentMethodLabel, checkoutEmail);
    if (emailValidationMessage) return emailValidationMessage;

    if (shippingOption === "shipping") {
      if (
        !shippingAddress.name ||
        !shippingAddress.addressLine1 ||
        !shippingAddress.city ||
        !shippingAddress.state ||
        !shippingAddress.postalCode ||
        !shippingAddress.country
      ) {
        return "Please fill in all required shipping fields.";
      }
    }

    return null;
  };

  // Handler for Stripe checkout: call your API route that creates a Stripe Checkout session.
  const handleStripeCheckout = async (): Promise<void> => {
    const validationMessage = getCheckoutValidationMessage("Stripe/Card");
    if (validationMessage) {
      setErrorMessage(validationMessage);
      if (validationMessage.toLowerCase().includes("email")) focusCheckoutEmail();
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const response = await axios.post("/api/create-stripe-checkout-session", {
        amount: subtotalPrice,
        product: productDisplayName,
        originalSlug: isCartCheckout ? "" : originalSlug,
        earlyAccessPassword: isCartCheckout ? "" : earlyAccessPassword,
        earlyAccessPasswords: isCartCheckout ? earlyAccessPasswordsForCart : undefined,
        cartItems: isCartCheckout ? cartPayloadItems : undefined,
        checkoutEmail: checkoutEmail.trim(),
        shippingAddress: shippingOption === "pickup" ? null : shippingAddress,
        billingAddress: null, // Let Stripe collect billing info
        shippingOption: shippingOption,
        returnTo: returnToPath || (isCartCheckout ? "/cart" : null),
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
        amount: formatCents(subtotalPrice),
        shippingOption,
        hasShippingAddress: !!shippingAddress.name,
      });
      
      const response = await axios.post("/api/paypal/createorder", {
        amount: formatCents(subtotalPrice),
        product: productDisplayName,
        originalSlug: isCartCheckout ? "" : originalSlug,
        earlyAccessPassword: isCartCheckout ? "" : earlyAccessPassword,
        earlyAccessPasswords: isCartCheckout ? earlyAccessPasswordsForCart : undefined,
        cartItems: isCartCheckout ? cartPayloadItems : undefined,
        checkoutEmail: checkoutEmail.trim(),
        shippingAddress: shippingOption === "pickup" ? null : shippingAddress,
        billingAddress: null, // Let PayPal collect billing info
        shippingOption: shippingOption,
      });
      
      console.log('PayPal order response:', response.data);
      
      if (!response.data || !response.data.orderId) {
        throw new Error('No order ID received from server');
      }
      payPalCreateOrderErrorRef.current = null;
      return response.data.orderId as string;
    } catch (error: unknown) {
      console.error('PayPal order creation error:', error);
      let errorMessage = "PayPal order creation failed.";
      
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.error || error.message;
        errorMessage = "PayPal order creation failed: " + errorMsg;
      } else if (error instanceof Error) {
        errorMessage = "PayPal order creation failed: " + error.message;
      }
      
      payPalCreateOrderErrorRef.current = errorMessage;
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
        if (isCartCheckout) clearCart();
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
    <div className="min-h-screen bg-ivory">
      <div className="max-w-6xl mx-auto py-12 px-6">
        {/* Elegant Header */}
        <div className="text-center mb-12">
          <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light text-brown mb-4 tracking-wide`}>
            Complete Your Purchase
          </h1>
          <div className="w-24 h-px bg-olive/70 mx-auto mb-6"></div>
        </div>

        {isCartCheckout && cartItems.length === 0 && (
          <div className="mb-8 border-l-2 border-amber-500 pl-4">
            <p className={`${lora.className} text-amber-700 text-sm`}>
              Your cart is empty. Add artwork to your cart before checking out.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-12 lg:gap-16">
          {/* Left Column - Order Details */}
          <div className="space-y-10">
            {/* Delivery Options */}
            <section className="border-t border-tan/40 pt-8">
              <h2 className={`${cormorant.className} text-2xl font-medium mb-6 text-brown flex items-center`}>
                Delivery Method
              </h2>
              <div className="border-b border-tan/40">
                <label className="group cursor-pointer block">
                  <div className="border-t border-tan/40 py-5 transition-colors duration-300 hover:text-olive">
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
                  <div className="border-t border-tan/40 py-5 transition-colors duration-300 hover:text-olive">
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
            </section>

            {/* Address Section */}
            {shippingOption === "shipping" ? (
              <section className="border-t border-tan/40 pt-8">
                <h2 className={`${cormorant.className} text-2xl font-medium mb-6 text-brown flex items-center`}>
                  Delivery Address
                </h2>
                
                <FreeAddressValidator
                  currentAddress={shippingAddress}
                  onAddressChange={handleShippingAddressChange}
                  className="block w-full border-0 border-b border-tan/60 bg-transparent px-0 py-3 text-brown placeholder-warm-gray/60 focus:border-olive focus:outline-none focus:ring-0 transition-all duration-200"
                />
                <div className="mt-6 border-t border-tan/40 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`${lora.className} font-medium text-brown`}>Shipping</span>
                    <span className={`${lora.className} font-medium text-olive`}>Free</span>
                  </div>
                  <p className="text-sm text-warm-gray">
                    Free shipping is included. Please allow about 2 weeks to package and ship your artwork.
                  </p>
                </div>
              </section>
            ) : (
              <section className="border-t border-tan/40 pt-8">
                <h2 className={`${cormorant.className} text-2xl font-medium mb-6 text-brown flex items-center`}>
                  Gallery Appointment Details
                </h2>
                <div>
                  <div className="space-y-4 border-y border-tan/40 py-5">
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
                  <div className="mt-5">
                    <p className="text-sm text-olive font-medium">
                      Your billing information will be collected securely during checkout
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Payment Method */}
            <section className="border-t border-tan/40 pt-8">
              <h2 className={`${cormorant.className} text-2xl font-medium mb-6 text-brown flex items-center`}>
                Payment Method
              </h2>

              <div className="mb-6">
                <label htmlFor="checkout-email" className={`${lora.className} block text-brown font-medium mb-2`}>
                  Email for Confirmation
                </label>
                <input
                  id="checkout-email"
                  ref={checkoutEmailRef}
                  type="email"
                  value={checkoutEmail}
                  onChange={(event) => {
                    setCheckoutEmail(event.target.value);
                    if (errorMessage?.toLowerCase().includes("email")) {
                      setErrorMessage(null);
                    }
                  }}
                  placeholder="you@example.com"
                  className="block w-full border-0 border-b border-tan/60 bg-transparent px-0 py-3 text-brown placeholder-warm-gray/60 focus:border-olive focus:outline-none focus:ring-0 transition-all duration-200"
                  required
                />
                <p className="mt-2 text-sm text-warm-gray">
                  We&apos;ll send your receipt and shipping updates to this email.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mb-8 border-y border-tan/40">
                <label className="group cursor-pointer block border-b border-tan/40 py-5 sm:border-b-0">
                  <div>
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
                <label className="group cursor-pointer block py-5">
                  <div>
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
                      <span className={`${lora.className} font-medium text-brown`}>PayPal/Card</span>
                    </div>
                  </div>
                </label>
              </div>

              {/* Error Messages */}
              {errorMessage && (
                <div className="mb-6 border-l-2 border-red-500 pl-4">
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Payment Buttons */}
              {paymentMethod === "stripe" ? (
                <button
                  onClick={handleStripeCheckout}
                  disabled={isProcessing || subtotalPrice <= 0}
                  className={`w-full border border-btn-brown bg-btn-brown px-8 py-4 text-lg text-paper transition-colors duration-300 hover:bg-btn-brown-hover disabled:cursor-not-allowed disabled:opacity-60 ${lora.className} font-medium`}
                >
                  <span className="flex items-center justify-center text-paper">
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-paper" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : "Continue with Stripe/Card"}
                  </span>
                </button>
              ) : (
                <div>
                  {!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? (
                    <div className="border-l-2 border-amber-500 pl-4">
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
                            const validationMessage = getCheckoutValidationMessage("PayPal/Card");
                            if (validationMessage) {
                              setErrorMessage(validationMessage);
                              if (validationMessage.toLowerCase().includes("email")) focusCheckoutEmail();
                              throw new Error(validationMessage);
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
                          if (payPalCreateOrderErrorRef.current) {
                            setErrorMessage(payPalCreateOrderErrorRef.current);
                            return;
                          }
                          if (
                            err instanceof Error &&
                            (err.message.includes("email above") || err.message.includes("required shipping fields"))
                          ) {
                            setErrorMessage(err.message);
                            return;
                          }
                          setErrorMessage("PayPal payment failed. Please try again or use card payment.");
                        }}
                      />
                    </PayPalScriptProvider>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <aside className="sticky top-8 border-t border-tan/40 pt-8">
              <h2 className={`${cormorant.className} text-2xl font-medium mb-6 text-brown`}>Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {isCartCheckout ? (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start gap-4 py-3 border-b border-tan/30">
                      <div>
                        <span className={`${lora.className} block text-warm-gray`}>{item.title}</span>
                        <span className={`${lora.className} block text-xs text-warm-gray/80`}>
                          {item.type === "original"
                            ? "Original"
                            : `${item.printProductName || "Print"}${item.printSizeName ? `, ${item.printSizeName}` : ""}`}
                          {(item.quantity ?? 1) > 1 ? ` x ${item.quantity}` : ""}
                        </span>
                      </div>
                      <span className={`${lora.className} font-medium text-brown`}>
                        {formatCurrencyFromCents(dollarsToCents(item.price * (item.quantity ?? 1)))}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between items-center py-3 border-b border-tan/30">
                    <span className={`${lora.className} text-warm-gray`}>Artwork Price</span>
                    <span className={`${lora.className} font-medium text-brown`}>{formatCurrencyFromCents(BASE_PRICE)}</span>
                  </div>
                )}
                
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
                <div className="flex justify-between items-center py-3 border-b border-tan/30">
                  <span className={`${lora.className} text-warm-gray`}>Texas Sales Tax ({TEXAS_SALES_TAX_PERCENT_LABEL})</span>
                  <span className={`${lora.className} font-medium text-brown`}>
                    {collectsSalesTax ? formatCurrencyFromCents(salesTaxPrice) : "$0.00"}
                  </span>
                </div>
              </div>
              
              <div className="border-y border-tan/40 py-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className={`${cormorant.className} text-xl font-medium text-brown`}>Total</span>
                  <span className={`${cormorant.className} text-2xl font-bold text-brown`}>{formatCurrencyFromCents(totalPrice)}</span>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-warm-gray leading-relaxed">
                  Secure payment processing. Your information is protected with industry-standard encryption.
                </p>
              </div>
            </aside>
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
