# EasyPost Shipping Integration

This document explains the EasyPost shipping integration that has been added to the Megan Houssian Art website.

## 🚀 **What's Been Implemented**

### 1. **Real-Time Shipping Rates** (/api/calculate-shipping)
- Gets actual shipping rates from USPS, UPS, FedEx via EasyPost
- Falls back to simple calculation if EasyPost is not configured
- Returns multiple shipping options with delivery estimates
- Handles address validation automatically

### 2. **Automatic Label Purchasing** (/api/purchase-shipping)
- Purchases shipping labels after successful payment
- Provides tracking numbers automatically
- Returns printable label URLs
- Integrates with payment webhooks

### 3. **Updated Checkout Flow** (/app/checkout/page.tsx)
- Multiple shipping rate selection
- Real-time rate calculation
- Carrier and delivery time display
- Seamless integration with existing payment flow

### 4. **Payment Integration**
- **Stripe**: Automatic label purchasing via webhook
- **PayPal**: Framework ready (needs temporary storage for shipping data)
- Metadata storage for shipment tracking

## 🔧 **Setup Instructions**

### 1. **Get EasyPost API Key**
1. Sign up at [easypost.com](https://easypost.com)
2. Get your test API key from the dashboard
3. Replace the placeholder in `.env.local`:

```bash
# Replace this line:
EASYPOST_API_KEY=EZAK_your_test_api_key_here

# With your actual test key:
EASYPOST_API_KEY=EZAK_your_actual_test_key_here
```

### 2. **Update Gallery Address**
In `/app/api/calculate-shipping/route.ts`, replace the placeholder address:

```typescript
from_address: {
  name: "Megan Houssian Art",
  street1: "Your Gallery Address", // TODO: Replace with actual address
  city: "Marble Falls",
  state: "TX",
  zip: "78654",
  country: "US",
},
```

### 3. **Test the Integration**
1. Start your development server: `npm run dev`
2. Go to checkout page
3. Enter a test address (EasyPost provides test addresses)
4. Click "Calculate Shipping Costs"
5. You should see real shipping rates!

## 📦 **Package Details**

The current package settings are optimized for artwork:
- **Weight**: 16 ounces (1 lb)
- **Dimensions**: 12" x 9" x 2" (length x width x height)

You can adjust these in the checkout page by modifying the `calculateShipping` function.

## 🎯 **How It Works**

### Customer Experience:
1. Customer enters shipping address
2. Clicks "Calculate Shipping Costs"
3. Sees real shipping options with prices and delivery times
4. Selects preferred shipping method
5. Completes payment
6. **Automatically**: Shipping label is purchased and tracking number is generated

### Your Experience:
1. Receive payment notification
2. Check your EasyPost dashboard for the shipping label
3. Print the label and attach to package
4. Customer automatically gets tracking information

## 🔄 **Fallback System**

If EasyPost is not configured or fails:
- System falls back to your original shipping calculation
- Customers still see shipping costs
- No disruption to checkout process
- You can manually handle shipping

## 🚨 **Production Checklist**

Before going live:
1. ✅ EasyPost package installed
2. ⏳ **Replace test API key with production key**
3. ⏳ **Update gallery address in shipping calculation**
4. ⏳ **Test with real addresses**
5. ⏳ **Set up Stripe webhook endpoint** (for automatic label purchasing)
6. ⏳ **Test end-to-end flow**

## 💰 **Pricing**

- **EasyPost**: $0.05 per shipment + actual shipping cost
- **No monthly fees**
- **Free test environment**

## 📞 **Support**

If you encounter issues:
1. Check the browser console for error messages
2. Check the EasyPost dashboard for API logs
3. Verify your API key is correct
4. Ensure the gallery address is valid

## 🎨 **Next Steps**

Consider adding:
1. Insurance options for valuable artwork
2. Signature confirmation for high-value pieces
3. International shipping rates
4. Package tracking page for customers
5. Email notifications with tracking info

---

The integration is now ready! Once you add your EasyPost API key, you'll have professional shipping with real rates and automatic label generation.
