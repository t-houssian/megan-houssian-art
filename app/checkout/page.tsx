"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios, { AxiosResponse } from "axios";
import { SiStripe, SiPaypal } from "react-icons/si";
import { cormorant, lora } from "../fonts";
import FreeAddressValidator from "../components/FreeAddressValidator";

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

type ShippingRate = {
  id: string;
  service: string;
  carrier: string;
  rate: number;
  delivery_days?: number;
  delivery_date?: string;
};

const CheckoutContent = () => {
  // Read product details from URL query parameters
  const searchParams = useSearchParams();
  const product = searchParams.get("product") || "";
  const basePriceDollars = searchParams.get("price")
    ? parseFloat(searchParams.get("price")!)
    : 20;
  // Stripe expects amounts in cents.
  const BASE_PRICE = basePriceDollars * 100;

  // Read shipping parameters from URL (with fallback defaults)
  const shippingWeight = searchParams.get("weight") 
    ? parseFloat(searchParams.get("weight")!)
    : 16; // Default to 16 oz
  const shippingLength = searchParams.get("length")
    ? parseFloat(searchParams.get("length")!)
    : 12; // Default to 12 inches
  const shippingWidth = searchParams.get("width")
    ? parseFloat(searchParams.get("width")!)
    : 9; // Default to 9 inches
  const shippingHeight = searchParams.get("height")
    ? parseFloat(searchParams.get("height")!)
    : 2; // Default to 2 inches

  // Local state
  const [shippingOption, setShippingOption] = useState<"shipping" | "pickup">("shipping");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe");
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculate shipping by calling your shipping API endpoint (e.g. using EasyPost)
  const calculateShipping = async (): Promise<void> => {
    setIsCalculating(true);
    setErrorMessage(null);
    try {
      const response: AxiosResponse<{ 
        rates: ShippingRate[]; 
        success: boolean; 
        fallback?: boolean;
      }> = await axios.post(
        "/api/calculate-shipping",
        {
          shippingAddress,
          // Use dynamic package details from URL parameters
          package: { 
            weight: shippingWeight, // Dynamic weight from Sanity
            dimensions: { 
              length: shippingLength, 
              width: shippingWidth, 
              height: shippingHeight 
            } 
          },
        }
      );
      
      const { rates } = response.data;
      if (rates.length > 0) {
        setShippingRates([rates[0]]);
        setShippingCost(rates[0].rate);
      } else {
        setShippingRates([]);
        setShippingCost(0);
        setErrorMessage("No shipping estimate is available for this address.");
      }
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage("Failed to calculate shipping: " + error.message);
        console.error(error.message);
      } else {
        setErrorMessage("Failed to calculate shipping.");
        console.error(error);
      }
    } finally {
      setIsCalculating(false);
    }
  };

  // Total price in cents
  const totalPrice = shippingOption === "pickup" ? BASE_PRICE : BASE_PRICE + shippingCost;

  const handleShippingAddressChange = (address: ShippingAddress) => {
    setShippingAddress(address);
    setShippingRates([]);
    setShippingCost(0);
  };

  // Handler for Stripe checkout: call your API route that creates a Stripe Checkout session.
  const handleStripeCheckout = async (): Promise<void> => {
    // Validate address only for shipping option
    if (shippingOption === "shipping") {
      if (!shippingAddress.name || !shippingAddress.addressLine1 || !shippingAddress.city) {
        setErrorMessage("Please fill in all required shipping fields.");
        return;
      }
      if (shippingCost <= 0) {
        setErrorMessage("Please calculate shipping before checkout.");
        return;
      }
    }

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const response = await axios.post("/api/create-stripe-checkout-session", {
        amount: totalPrice,
        product: product,
        shippingAddress: shippingOption === "pickup" ? null : shippingAddress,
        billingAddress: null, // Let Stripe collect billing info
        shippingOption: shippingOption,
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
        amount: (totalPrice / 100).toFixed(2),
        shippingOption,
        hasShippingAddress: !!shippingAddress.name,
      });
      
      const response = await axios.post("/api/paypal/createorder", {
        amount: (totalPrice / 100).toFixed(2), // converting cents to dollars
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
                          setShippingRates([]);
                          setShippingCost(0);
                        }}
                        className="mt-1 h-5 w-5 text-olive focus:ring-olive border-tan"
                      />
                      <div className="ml-4 flex-1">
                        <h3 className={`${lora.className} font-medium text-brown mb-2`}>Professional Shipping</h3>
                        <p className="text-warm-gray text-sm leading-relaxed">
                          Your artwork will be carefully packaged and shipped directly to your address with full insurance coverage.
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
                          setShippingRates([]);
                          setShippingCost(0);
                        }}
                        className="mt-1 h-5 w-5 text-olive focus:ring-olive border-tan"
                      />
                      <div className="ml-4 flex-1">
                        <h3 className={`${lora.className} font-medium text-brown mb-2 flex items-center`}>
                          Gallery Pickup in Marble Falls, TX
                          <span className="ml-2 px-2 py-1 bg-olive/10 text-olive text-xs rounded-full">FREE</span>
                        </h3>
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
                
                <button
                  onClick={calculateShipping}
                  disabled={isCalculating || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.country}
                  className={`mt-6 w-full px-8 py-4 rounded-xl transition-all duration-500 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-opacity-20 relative overflow-hidden group ${lora.className} font-medium ${
                    isCalculating || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.country
                      ? 'bg-tan/60 text-brown border-tan cursor-not-allowed opacity-70 transform-none'
                      : 'bg-gradient-to-r from-olive to-warm-gray text-ivory hover:from-warm-gray hover:to-olive border-white'
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center text-current">
                    {isCalculating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Calculating Shipping...
                      </>
                    ) : !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.country ? (
                      "Complete Address to Calculate Shipping"
                    ) : (
                      "Calculate Shipping"
                    )}
                  </span>
                  {!isCalculating && shippingAddress.addressLine1 && shippingAddress.city && shippingAddress.country && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
                  )}
                </button>

                {/* Address completion hint */}
                {(!shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.country) && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-amber-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-amber-800 text-sm font-medium">Complete your address to calculate shipping</p>
                        <p className="text-amber-700 text-xs mt-1">
                          Required: Street Address, City, and Country
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipping Summary */}
                {shippingRates.length > 0 && (
                  <div className="mt-6 bg-olive/5 rounded-lg p-4 border border-tan/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`${lora.className} font-medium text-brown`}>Shipping</span>
                      <span className={`${lora.className} font-medium text-brown`}>
                        ${(shippingCost / 100).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-warm-gray">
                      Please allow about 2 weeks to package and ship your artwork.
                    </p>
                  </div>
                )}
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
                            if (shippingOption === "shipping") {
                              if (!shippingAddress.name || !shippingAddress.addressLine1 || !shippingAddress.city) {
                                setErrorMessage("Please fill in all required shipping fields.");
                                throw new Error("Please fill in all required shipping fields.");
                              }
                              if (shippingCost <= 0) {
                                setErrorMessage("Please calculate shipping before checkout.");
                                throw new Error("Please calculate shipping before checkout.");
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
                  <span className={`${lora.className} font-medium text-brown`}>${(BASE_PRICE / 100).toFixed(2)}</span>
                </div>
                
                {shippingOption === "shipping" ? (
                  <div className="flex justify-between items-center py-3 border-b border-tan/30">
                    <span className={`${lora.className} text-warm-gray`}>Shipping</span>
                    <span className={`${lora.className} font-medium text-brown`}>${(shippingCost / 100).toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center py-3 border-b border-tan/30">
                    <span className={`${lora.className} text-warm-gray`}>Gallery Pickup</span>
                    <span className={`${lora.className} font-medium text-olive`}>${(shippingCost / 100).toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="bg-gradient-to-r from-olive/10 to-brown/10 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className={`${cormorant.className} text-xl font-medium text-brown`}>Total</span>
                  <span className={`${cormorant.className} text-2xl font-bold text-brown`}>${(totalPrice / 100).toFixed(2)}</span>
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
