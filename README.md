# 🎨 Megan Houssian Art - E-commerce Website

A professional art gallery and e-commerce platform built with Next.js, featuring full payment processing and content management.

## ✨ Features

- **🎨 Art Gallery** - Showcase originals and prints with high-quality images
- **💳 Payment Processing** - Complete Stripe and PayPal integration
- **📍 Smart Address Validation** - Professional checkout experience (100% free!)
- **📱 Mobile Responsive** - Perfect experience on all devices
- **🔧 Content Management** - Powered by Sanity CMS
- **📧 Collector Email List** - Kit-powered signup form for early access updates
- **🚀 Production Ready** - Enterprise-level checkout system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm

### Installation

1. **Clone the repository**
```bash
git clone [repository-url]
cd megan-houssian-art
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file with your API keys:
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# PayPal Configuration  
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
# Required in production so completed original artwork payments can mark pieces sold in Sanity.
# SANITY_API_TOKEN, SANITY_TOKEN, SANITY_AUTH_TOKEN, and SANITY_API_WRITE_TOKEN also work.
SANITY_WRITE_TOKEN=your_sanity_write_token

# Kit Email List
KIT_API_KEY=your_kit_api_key_here
# Optional: route signups to one specific Kit form
KIT_FORM_ID=1234567
# Optional: social links included in transactional email footer
EMAIL_SOCIAL_INSTAGRAM_URL=https://www.instagram.com/meganhoussianart/
EMAIL_SOCIAL_PINTEREST_URL=https://pin.it/1Scq2kp48
EMAIL_SOCIAL_FACEBOOK_URL=https://www.facebook.com/marketplace/profile/61550348800548/?ref=permalink&mibextid=6ojiHh
# Use your production domain here so email CTA links point to your live site
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

4. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the website.

## 🛍️ E-commerce Features

### Payment Processing
- **Stripe Integration** - Credit/debit card processing
- **PayPal Integration** - PayPal account payments
- **Test Mode** - Safe testing with test cards
- **Production Ready** - Switch to live keys when ready

### Checkout Experience
- **Smart Address Validation** - State autocomplete and postal code formatting
- **Shipping Calculation** - Automatic shipping cost calculation
- **Mobile Optimized** - Responsive checkout flow
- **Error Handling** - User-friendly error messages

### Content Management
- **Sanity CMS** - Manage artwork, collections, and content
- **Image Optimization** - Next.js image optimization
- **SEO Friendly** - Optimized for search engines

### Email Capture
- **Collector Early Access Section** - Homepage signup section for first name + email
- **Kit API Integration** - Server-side subscription endpoint at `/api/kit/subscribe`
- **Branded Transactional Templates** - Polished Mailgun templates with site + social links
- **Welcome Email** - Sends a post-signup thank-you email through Mailgun
- **Cross-page Links** - About and Contact pages link directly to the signup section

## 📚 Documentation

### Setup & Configuration
- **[Payment Setup Guide](./documentation/PAYMENT_SETUP.md)** - Complete payment integration setup
- **[PayPal Setup Guide](./documentation/PAYPAL_SETUP_GUIDE.md)** - Detailed PayPal integration and testing
- **[Testing Guide](./documentation/TESTING_GUIDE.md)** - How to test payments safely
- **[Stripe Setup Help](./documentation/STRIPE_SETUP_HELP.md)** - Detailed Stripe configuration

### Technical Implementation
- **[Free Address Solution](./documentation/FREE_ADDRESS_SOLUTION.md)** - Cost-free address validation system
- **[Final Success Summary](./documentation/FINAL_SUCCESS_SUMMARY.md)** - Complete feature overview

## 🧪 Testing

### Payment Testing (Test Mode)
Use these test cards with Stripe in test mode:

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`  
- **3D Secure**: `4000 0027 6000 3184`

See the [Testing Guide](./documentation/TESTING_GUIDE.md) for complete testing instructions.

### Address Validation Testing
- Try typing "CA" or "California" in the state field
- Test postal code formatting (12345 becomes 12345-0000)
- Test validation with incomplete addresses

## 🏗️ Tech Stack

- **Framework**: Next.js 15.1.6 with App Router
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Payment**: Stripe + PayPal APIs
- **CMS**: Sanity
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
megan-houssian-art/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── stripe/         # Stripe payment endpoints
│   │   ├── paypal/         # PayPal payment endpoints
│   │   └── calculate-shipping/
│   ├── checkout/           # Checkout page
│   ├── components/         # React components
│   ├── originals/          # Original artwork pages
│   └── prints/             # Print artwork pages
├── documentation/          # All setup and technical docs
├── lib/                    # Utility functions
├── public/                 # Static assets
└── sanity/                 # Sanity CMS configuration
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Ensure Node.js 18+ support
- Set all required environment variables
- Build command: `npm run build`
- Start command: `npm start`

## 💰 Cost Breakdown

| Service | Cost | Purpose |
|---------|------|---------|
| **Hosting** | Free tier available | Website hosting |
| **Address Validation** | 🆓 Free | Built-in solution |
| **Payment Processing** | 2.9% + 30¢ per transaction | Stripe/PayPal fees |
| **CMS** | Free tier available | Content management |

## 🔧 Content Management (Sanity)

### Development
```bash
cd sanity
npm run dev
# or
sanity start
```

### Schema Changes
```bash
cd sanity  
sanity build
```

Visit the [Sanity documentation](https://www.sanity.io/docs) for detailed CMS management.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

- **Payment Issues**: Check the [Payment Setup Guide](./documentation/PAYMENT_SETUP.md)
- **Testing Problems**: See the [Testing Guide](./documentation/TESTING_GUIDE.md)
- **General Setup**: Review the documentation folder

## 📄 License

This project is proprietary. All rights reserved.
