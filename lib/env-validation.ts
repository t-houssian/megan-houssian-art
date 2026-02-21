// Environment variable validation utility
// This helps ensure all required environment variables are set

export function validateStripeConfig() {
  const required = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  return {
    isValid: missing.length === 0,
    missing,
    config: required,
  };
}

export function validatePayPalConfig() {
  const required = {
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  return {
    isValid: missing.length === 0,
    missing,
    config: required,
  };
}

export function validateEasyPostConfig() {
  const required = {
    EASYPOST_API_KEY: process.env.EASYPOST_API_KEY,
    EASYPOST_FROM_STREET1: process.env.EASYPOST_FROM_STREET1,
    EASYPOST_FROM_CITY: process.env.EASYPOST_FROM_CITY,
    EASYPOST_FROM_STATE: process.env.EASYPOST_FROM_STATE,
    EASYPOST_FROM_ZIP: process.env.EASYPOST_FROM_ZIP,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  return {
    isValid: missing.length === 0,
    missing,
    config: required,
  };
}

// Log configuration status (for development)
if (process.env.NODE_ENV === 'development') {
  const stripe = validateStripeConfig();
  const paypal = validatePayPalConfig();
  const easypost = validateEasyPostConfig();
  
  console.log('💳 Payment Configuration Status:');
  console.log(`  Stripe: ${stripe.isValid ? '✅ Configured' : '❌ Missing: ' + stripe.missing.join(', ')}`);
  console.log(`  PayPal: ${paypal.isValid ? '✅ Configured' : '❌ Missing: ' + paypal.missing.join(', ')}`);
  console.log(`  EasyPost: ${easypost.isValid ? '✅ Configured' : '❌ Missing: ' + easypost.missing.join(', ')}`);
}
