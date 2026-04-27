"use client";
import React, { useState, useEffect } from "react";
import { lora, cormorant } from "../fonts";
import { formatRoundedDollars } from "../../lib/money";
import AddToCartButton from "./AddToCartButton";

type PrintOption = {
  name: string;
  description: string;
  sizes: Array<{
    name: string;
    price: number;
    value: string;
  }>;
};

type PrintOptions = {
  [key: string]: PrintOption;
};

type LumaPrintPurchaseProps = {
  artworkTitle: string;
  artworkImageUrl?: string;
  printSlug: string;
};

type AccordionSectionProps = {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
};

// Accordion Component
function AccordionSection({ title, isOpen, onToggle, children, badge }: AccordionSectionProps) {
  return (
    <div className="border-t border-tan/40">
      <button
        onClick={onToggle}
        className="w-full py-6 text-left flex items-center justify-between"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h3 className={`${cormorant.className} text-2xl font-medium text-brown`}>{title}</h3>
          {badge && (
            <span className="text-sm font-medium text-olive">
              {badge}
            </span>
          )}
        </div>
        <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-6 h-6 text-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}

// Main component
export default function LumaPrintPurchase({ artworkTitle, artworkImageUrl, printSlug }: LumaPrintPurchaseProps) {
  const [printOptions, setPrintOptions] = useState<PrintOptions>({});
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [criticalError, setCriticalError] = useState<string | null>(null);
  
  // Accordion state
  const [openSections, setOpenSections] = useState({
    printType: true,
    customer: false,
    shipping: false,
    summary: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    try {
      setOpenSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    } catch (error) {
      console.error('Toggle section error:', error);
      setCriticalError('Interface error occurred');
    }
  };

  // Fetch available print products
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetch('/api/luma/products');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.printOptions) {
          setPrintOptions(data.printOptions);
          // Auto-select first product and size
          const firstProductKey = Object.keys(data.printOptions)[0];
          if (firstProductKey) {
            setSelectedProduct(firstProductKey);
            if (data.printOptions[firstProductKey].sizes.length > 0) {
              setSelectedSize(data.printOptions[firstProductKey].sizes[0].value);
            }
            // Auto-expand customer info section when print is selected
            setOpenSections(prev => ({
              ...prev,
              customer: true
            }));
          }
        } else {
          setErrorMessage(data.error || 'Failed to load print options');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setErrorMessage('Unable to load print options. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const getSelectedPrice = () => {
    try {
      const option = printOptions[selectedProduct];
      if (!option) return 0;
      const size = option.sizes.find((s: { value: string; price: number }) => s.value === selectedSize);
      return size?.price || 0;
    } catch (error) {
      console.error('Get price error:', error);
      return 0;
    }
  };

  const getSelectedProductName = () => {
    try {
      const option = printOptions[selectedProduct];
      const size = option?.sizes.find((s: { value: string; name: string }) => s.value === selectedSize);
      return option && size ? `${option.name} - ${size.name}` : '';
    } catch (error) {
      console.error('Get product name error:', error);
      return '';
    }
  };

  const getSelectedSizeName = () => {
    try {
      return printOptions[selectedProduct]?.sizes.find((s) => s.value === selectedSize)?.name || selectedSize;
    } catch {
      return selectedSize;
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedProduct || !selectedSize || !customerInfo.name || !customerInfo.email || !shippingAddress.street) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      const response = await fetch('/api/luma/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artwork_title: artworkTitle,
          artwork_image_url: artworkImageUrl,
          product_type: selectedProduct,
          size: selectedSize,
          customer_info: customerInfo,
          shipping_address: shippingAddress,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage(`Print order submitted successfully! Order ID: ${data.order.order_id}`);
        // Reset form or redirect
      } else {
        setErrorMessage(data.error || 'Failed to submit order');
      }
    } catch (error) {
      setErrorMessage('Failed to submit order. Please try again.');
      console.error('Error submitting order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Critical error fallback
  if (criticalError) {
    return (
      <section className="bg-ivory py-8">
        <div className="max-w-2xl">
          <div className="border-y border-tan/40 py-10 text-center">
            <div className="text-red-600 mb-6">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 14.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className={`${cormorant.className} text-3xl font-medium text-brown mb-4`}>
              Print Ordering Unavailable
            </h1>
            <p className={`${lora.className} text-warm-gray mb-6`}>
              {criticalError}
            </p>
            <button 
              onClick={() => {
                setCriticalError(null);
                window.location.reload();
              }}
              className={`${lora.className} border border-btn-brown bg-btn-brown px-8 py-3 text-paper transition-colors duration-300 hover:bg-btn-brown-hover`}
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (successMessage) {
    return (
      <section className="bg-ivory py-8">
        <div className="max-w-3xl">
          <div className="border-y border-tan/40 py-10 text-center">
            <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center border border-btn-brown bg-btn-brown">
              <svg className="w-12 h-12 text-paper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light text-brown mb-8 tracking-wide`}>
              Order Submitted Successfully!
            </h1>
            <div className="mb-8 border-y border-tan/40 py-6">
              <p className={`${lora.className} text-brown font-medium text-lg mb-2`}>{successMessage}</p>
            </div>
            <p className={`${lora.className} text-warm-gray leading-relaxed text-lg mb-8`}>
              You&apos;ll receive a confirmation email shortly with tracking information once your print is ready for shipping.
            </p>
            <div className="pt-8 border-t border-tan/20">
              <p className={`${lora.className} text-warm-gray italic`}>
                Thank you for supporting fine art - your print will be handled with the utmost care and attention to detail.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-ivory relative">
      {/* Custom styles for enhanced dropdowns */}
      <style jsx global>{`
        select {
          position: relative;
          z-index: 10;
        }
        select option {
          padding: 12px 16px !important;
          background: var(--bg-paper) !important;
          color: var(--text-brown) !important;
          border: none !important;
          font-family: inherit !important;
          font-size: 16px !important;
          line-height: 1.5 !important;
          min-height: 44px !important;
        }
        select option:hover {
          background: var(--accent-cream) !important;
        }
        select option:checked {
          background: var(--btn-brown) !important;
          color: var(--bg-ivory) !important;
        }
        /* Ensure dropdowns are above other elements */
        .select-wrapper {
          position: relative;
          z-index: 30;
        }
        /* Smooth animations */
        .accordion-content {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .accordion-content.expanded {
          animation: slideDown 0.4s ease-out;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        /* Custom focus styles */
        .focus-ring:focus {
          outline: none;
          box-shadow: 0 0 0 3px var(--focus-ring-soft), 0 0 0 1px var(--focus-ring-strong);
        }
        /* Dropdown hover effect */
        .select-wrapper:hover svg {
          transform: translateY(-1px);
        }
        /* Loading states */
        .loading-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      
      <div className="max-w-4xl">
        {isLoading ? (
          <div className="border-y border-tan/40 py-10 text-center">
            <div className="animate-spin h-12 w-12 border-b-2 border-btn-brown mx-auto mb-6"></div>
            <p className={`${lora.className} text-warm-gray text-lg`}>Loading print options...</p>
          </div>
        ) : errorMessage && Object.keys(printOptions).length === 0 ? (
          <div className="border-y border-tan/40 py-10 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 14.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className={`${cormorant.className} text-2xl font-medium text-brown mb-4`}>
              Unable to Load Print Options
            </h3>
            <p className={`${lora.className} text-warm-gray mb-6`}>
              {errorMessage}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className={`${lora.className} border border-btn-brown bg-btn-brown px-8 py-3 text-paper transition-colors duration-300 hover:bg-btn-brown-hover`}
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Print Type & Size Selection */}
            <AccordionSection
              title="Select Print Type & Size"
              isOpen={openSections.printType}
              onToggle={() => toggleSection('printType')}
              badge={selectedProduct && selectedSize ? getSelectedProductName() : undefined}
            >
              <div className="space-y-8 pt-6">
                {/* Product Selection */}
                <div>
                  <label className={`${lora.className} block text-brown font-semibold mb-4 text-lg`}>Print Type</label>
                  <div className="relative select-wrapper">
                    <select
                      value={selectedProduct}
                      onChange={(e) => {
                        const newProductType = e.target.value;
                        const newProduct = printOptions[newProductType];
                        
                        // Check if current size is available in the new product type
                        const currentSizeAvailable = newProduct?.sizes.some(size => size.value === selectedSize);
                        
                        setSelectedProduct(newProductType);
                        
                        // Only change size if current size is not available in new product type
                        if (!currentSizeAvailable && newProduct?.sizes.length > 0) {
                          setSelectedSize(newProduct.sizes[0].value);
                        }
                        
                        // Auto-expand customer section when selection is made
                        setOpenSections(prev => ({
                          ...prev,
                          customer: true
                        }));
                      }}
                      className={`${lora.className} focus-ring w-full border-0 border-b border-tan/60 bg-transparent px-0 py-4 text-brown transition-all duration-300 focus:border-btn-brown focus:ring-0 appearance-none cursor-pointer`}
                      style={{ minHeight: '56px' }}
                    >
                      <option value="" disabled>Select a print type...</option>
                      {Object.entries(printOptions).map(([key, option]) => (
                        <option key={key} value={key}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg className="w-5 h-5 text-brown transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Display selected print description */}
                  {selectedProduct && printOptions[selectedProduct] && (
                    <div className="mt-4 border-l border-tan/60 pl-4">
                      <p className={`${lora.className} text-warm-gray leading-relaxed text-sm`}>
                        {printOptions[selectedProduct].description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Size Selection */}
                {selectedProduct && printOptions[selectedProduct] && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className={`${lora.className} text-brown font-semibold text-lg`}>Size & Price</label>
                      <span className={`${lora.className} text-warm-gray text-sm`}>
                        {printOptions[selectedProduct]?.sizes.length} sizes available
                      </span>
                    </div>
                    <div className="relative select-wrapper">
                      <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className={`${lora.className} focus-ring w-full border-0 border-b border-tan/60 bg-transparent px-0 py-4 text-brown transition-all duration-300 focus:border-btn-brown focus:ring-0 appearance-none cursor-pointer`}
                        style={{ minHeight: '56px' }}
                      >
                        <option value="" disabled>Select a size...</option>
                        {printOptions[selectedProduct]?.sizes.map((size) => (
                          <option key={size.value} value={size.value}>
                            {size.name} - {formatRoundedDollars(size.price)}
                          </option>
                        ))}
                      </select>
                      {/* Custom dropdown arrow */}
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <svg className="w-5 h-5 text-brown transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Display selected size details with enhanced visual */}
                    {selectedSize && (
                      <div className="mt-4 border-y border-tan/40 py-5">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className={`${lora.className} text-brown font-medium block`}>
                              Selected: {printOptions[selectedProduct]?.sizes.find(s => s.value === selectedSize)?.name}
                            </span>
                            <span className={`${lora.className} text-warm-gray text-sm mt-1 block`}>
                              {printOptions[selectedProduct]?.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className={`${cormorant.className} text-3xl font-medium text-btn-brown block`}>
                              {formatRoundedDollars(
                                printOptions[selectedProduct]?.sizes.find((s) => s.value === selectedSize)?.price || 0
                              )}
                            </span>
                            <span className={`${lora.className} text-warm-gray text-sm`}>
                              + Free Shipping
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </AccordionSection>

            {/* Customer Information */}
            <AccordionSection
              title="Contact Information"
              isOpen={openSections.customer}
              onToggle={() => toggleSection('customer')}
              badge={customerInfo.name && customerInfo.email ? '✓ Complete' : 'Required'}
            >
              <div className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={customerInfo.name}
                    onChange={(e) => {
                      setCustomerInfo({...customerInfo, name: e.target.value});
                      // Auto-expand shipping when name is entered
                      if (e.target.value && !openSections.shipping) {
                        setOpenSections(prev => ({...prev, shipping: true}));
                      }
                    }}
                    className={`${lora.className} focus-ring w-full border-0 border-b border-tan/60 bg-transparent px-0 py-4 text-brown placeholder-warm-gray transition-all duration-300 focus:border-btn-brown focus:ring-0`}
                  />
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    className={`${lora.className} focus-ring w-full border-0 border-b border-tan/60 bg-transparent px-0 py-4 text-brown placeholder-warm-gray transition-all duration-300 focus:border-btn-brown focus:ring-0`}
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number (optional)"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  className={`${lora.className} focus-ring w-full border-0 border-b border-tan/60 bg-transparent px-0 py-4 text-brown placeholder-warm-gray transition-all duration-300 focus:border-btn-brown focus:ring-0`}
                />
              </div>
            </AccordionSection>

            {/* Shipping Address */}
            <AccordionSection
              title="Shipping Address"
              isOpen={openSections.shipping}
              onToggle={() => toggleSection('shipping')}
              badge={shippingAddress.street && shippingAddress.city && shippingAddress.state && shippingAddress.zip ? '✓ Complete' : 'Required'}
            >
              <div className="pt-6 space-y-6">
                <input
                  type="text"
                  placeholder="Street Address *"
                  value={shippingAddress.street}
                  onChange={(e) => {
                    setShippingAddress({...shippingAddress, street: e.target.value});
                    // Auto-expand summary when address is entered
                    if (e.target.value && !openSections.summary) {
                      setOpenSections(prev => ({...prev, summary: true}));
                    }
                  }}
                  className={`${lora.className} w-full border-0 border-b border-tan/60 bg-transparent px-0 py-4 text-brown placeholder-warm-gray transition-all duration-300 focus:border-btn-brown focus:ring-0`}
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="City *"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    className={`${lora.className} w-full border-0 border-b border-tan/60 bg-transparent px-0 py-4 text-brown placeholder-warm-gray transition-all duration-300 focus:border-btn-brown focus:ring-0`}
                  />
                  <input
                    type="text"
                    placeholder="State *"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                    className={`${lora.className} w-full border-0 border-b border-tan/60 bg-transparent px-0 py-4 text-brown placeholder-warm-gray transition-all duration-300 focus:border-btn-brown focus:ring-0`}
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code *"
                    value={shippingAddress.zip}
                    onChange={(e) => setShippingAddress({...shippingAddress, zip: e.target.value})}
                    className={`${lora.className} w-full border-0 border-b border-tan/60 bg-transparent px-0 py-4 text-brown placeholder-warm-gray transition-all duration-300 focus:border-btn-brown focus:ring-0`}
                  />
                  <select
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                    className={`${lora.className} w-full border-0 border-b border-tan/60 bg-transparent px-0 py-4 text-brown transition-all duration-300 focus:border-btn-brown focus:ring-0`}
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                  </select>
                </div>
              </div>
            </AccordionSection>

            {/* Order Summary & Submit */}
            <AccordionSection
              title="Order Summary & Checkout"
              isOpen={openSections.summary}
              onToggle={() => toggleSection('summary')}
              badge={formatRoundedDollars(getSelectedPrice())}
            >
              <div className="pt-6">
                {/* Error Message */}
                {errorMessage && (
                  <div className="border-l-2 border-red-400 pl-4 mb-8">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className={`${lora.className} text-red-700`}>{errorMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-y border-tan/40 py-6">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h4 className={`${cormorant.className} text-2xl font-medium text-brown mb-2`}>
                        &quot;{artworkTitle}&quot;
                      </h4>
                      <p className={`${lora.className} text-warm-gray text-lg`}>
                        {getSelectedProductName()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`${cormorant.className} text-3xl font-medium text-btn-brown mb-1`}>
                        {formatRoundedDollars(getSelectedPrice())}
                      </p>
                      <p className={`${lora.className} text-sm text-warm-gray`}>
                        Free shipping included
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting || !selectedProduct || !selectedSize || !customerInfo.name || !customerInfo.email || !shippingAddress.street}
                    className={`w-full border border-btn-brown bg-btn-brown px-8 py-4 text-accent-cream transition-colors duration-300 hover:bg-btn-brown-hover disabled:cursor-not-allowed disabled:opacity-50 ${lora.className} text-lg font-medium`}
                  >
                    <span className="relative z-10">
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-accent-cream" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing Order...
                        </>
                      ) : (
                        `Order Print - ${formatRoundedDollars(getSelectedPrice())}`
                      )}
                    </span>
                  </button>
                  <div className="mt-4">
                    <AddToCartButton
                      disabled={!selectedProduct || !selectedSize}
                      item={{
                        id: `print:${printSlug}:${selectedProduct}:${selectedSize}`,
                        type: "print",
                        title: artworkTitle,
                        price: getSelectedPrice(),
                        imageUrl: artworkImageUrl,
                        printSlug,
                        printProductType: selectedProduct,
                        printProductName: printOptions[selectedProduct]?.name,
                        printSize: selectedSize,
                        printSizeName: getSelectedSizeName(),
                        quantity: 1,
                      }}
                    />
                  </div>
                </div>
              </div>
            </AccordionSection>
          </div>
        )}
      </div>
    </section>
  );
}
