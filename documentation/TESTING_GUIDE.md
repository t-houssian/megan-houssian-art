# 🧪 Testing vs Production Mode Guide

## ❌ **Current Issue:**
You're using **live Stripe keys** but trying to test with **test card numbers**. This won't work!

## ✅ **Solution: Switch to Test Mode**

### 1. **Get Your Test Keys:**

1. Go to https://dashboard.stripe.com/
2. **Toggle to "Test Mode"** (switch in top right corner)
3. Go to **Developers → API keys**
4. Copy these two keys:
   - **Secret key** (starts with `sk_test_`)
   - **Publishable key** (starts with `pk_test_`)

### 2. **Replace the Keys in `.env.local`:**

I've already updated your `.env.local` file with placeholders. Replace these lines:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_PUBLISHABLE_KEY_HERE
```

### 3. **Restart Your Development Server:**

```bash
npm run dev
```

## 🎯 **Test Cards That Will Work (in test mode):**

### ✅ Successful Payments:
- `4242 4242 4242 4242` - Visa
- `4000 0566 5566 5556` - Visa (debit)
- `5555 5555 5555 4444` - Mastercard
- `3782 822463 10005` - American Express

### ❌ Declined Payments:
- `4000 0000 0000 0002` - Card declined
- `4000 0000 0000 9995` - Insufficient funds
- `4000 0000 0000 9987` - Lost card

### 🔐 3D Secure Testing:
- `4000 0027 6000 3184` - Requires authentication

## 🎭 **Test vs Live Mode Summary:**

| Mode | Keys Start With | Use For | Real Money? |
|------|----------------|---------|-------------|
| **Test** | `sk_test_`, `pk_test_` | Development & Testing | ❌ No |
| **Live** | `sk_live_`, `pk_live_` | Production | ✅ Yes |

## 🚀 **When Ready for Production:**

Simply uncomment the live keys in `.env.local` and comment out the test keys:

```env
# DEVELOPMENT - USE TEST KEYS (comment out)
# STRIPE_SECRET_KEY=sk_test_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# PRODUCTION - LIVE KEYS (uncomment)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

This way you can easily switch between test and production! 🎨
