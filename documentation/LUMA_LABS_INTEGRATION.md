# Luma Labs Print Integration

This document explains the Luma Labs API integration for the prints section of the Megan Houssian Art website.

## 🎨 **What's Been Implemented**

### 1. **Separate Print Workflow**
- **Prints Page**: Uses Luma Labs API for professional printing and shipping
- **Originals Page**: Still uses the existing EasyPost + Stripe/PayPal checkout flow
- Complete separation of concerns between print orders and original artwork sales

### 2. **Luma Labs API Integration**

#### `/api/luma/products` - Print Options
- Fetches available print types (Canvas, Fine Art Paper, Metal)
- Returns sizing options and pricing for each print type
- Currently using mock data until Luma API structure is confirmed

#### `/api/luma/create-order` - Order Creation
- Submits print orders directly to Luma Labs
- Handles customer information and shipping addresses
- Returns order confirmation and tracking information

### 3. **Enhanced Print Experience** (`LumaPrintPurchase` Component)
- **Print Type Selection**: Canvas, Fine Art Paper, Metal prints
- **Size Options**: Multiple sizes with dynamic pricing
- **Customer Info**: Name, email, phone collection
- **Shipping Address**: Complete address form
- **Order Summary**: Clear pricing and product details
- **Real-time Validation**: Form validation and error handling

### 4. **Professional Print Options**
- **Canvas Prints**: Gallery wrap, multiple sizes ($25-$75)
- **Fine Art Paper**: Premium archival inks ($15-$60)  
- **Metal Prints**: Exceptional durability ($40-$125)
- **Shipping Included**: No separate shipping calculations needed

## 🔧 **Technical Details**

### API Authentication
The Luma Labs API uses HMAC-SHA256 signature authentication:
```typescript
function generateSignature(method: string, path: string, params: string, secret: string): string {
  const data = `${method}${path}${params}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}
```

### Environment Variables
```bash
LUMA_PRINTS_API_KEY=your_api_key_here
LUMA_PRINTS_API_SECRET=your_api_secret_here
```

### Print Workflow
1. **Customer browses prints** → `/prints`
2. **Selects artwork** → `/prints/[slug]`
3. **Chooses print options** → Print type, size, customer info
4. **Submits order** → Direct to Luma Labs
5. **Receives confirmation** → Order ID and tracking info

## 🎯 **Key Benefits**

### For Customers:
- ✅ **Professional Quality** - High-end printing equipment and materials
- ✅ **Multiple Options** - Various print types and sizes
- ✅ **Direct Shipping** - Professionally packaged and shipped
- ✅ **No Shipping Costs** - Included in print price
- ✅ **Order Tracking** - Automatic tracking information

### For You:
- ✅ **Hands-Off Fulfillment** - Luma Labs handles everything
- ✅ **Professional Results** - Gallery-quality prints
- ✅ **Scalable** - Handle unlimited print orders
- ✅ **Automated** - No manual processing required
- ✅ **Revenue Stream** - Passive income from prints

## 🔄 **Mock Data vs Real API**

Currently using mock data for:
- Available print products and sizes
- Pricing structure
- Order creation responses

**To activate real Luma Labs API:**
1. Confirm the exact API endpoints with Luma Labs
2. Update the API calls in `/api/luma/products/route.ts`
3. Update the order creation in `/api/luma/create-order/route.ts`
4. Test with actual Luma Labs staging environment

## 📊 **Print Options Currently Available**

### Canvas Prints
- 8" x 10" - $25.00
- 11" x 14" - $35.00  
- 16" x 20" - $55.00
- 18" x 24" - $75.00

### Fine Art Paper Prints  
- 8" x 10" - $15.00
- 11" x 14" - $25.00
- 16" x 20" - $40.00
- 18" x 24" - $60.00

### Metal Prints
- 8" x 10" - $40.00
- 11" x 14" - $60.00
- 16" x 20" - $95.00
- 18" x 24" - $125.00

## 🚀 **Next Steps**

### Immediate (Ready to Test):
1. ✅ Luma Labs API integration framework complete
2. ✅ Print selection interface working
3. ✅ Order form validation implemented
4. ✅ Separated from originals workflow

### When Luma API Details Are Available:
1. ⏳ Replace mock data with real Luma API calls
2. ⏳ Test actual order submission
3. ⏳ Implement order status checking
4. ⏳ Add email confirmation with tracking

### Future Enhancements:
1. 📧 Email notifications for customers and gallery
2. 📱 Order tracking page for customers  
3. 🎨 Print preview functionality
4. 💳 Optional payment processing (if Luma doesn't handle)
5. 📊 Sales analytics and reporting

## 🔍 **Testing**

### To Test Print Ordering:
1. Navigate to `/prints`
2. Select any artwork
3. Choose print type and size
4. Fill in customer information
5. Submit order (currently creates mock order)

### Expected Behavior:
- Form validation works
- Price updates dynamically
- Order submission shows success message
- Mock order ID is generated

## 📞 **Luma Labs Integration Notes**

When you get the specific API documentation from Luma Labs, update these files:
- `/api/luma/products/route.ts` - Real product catalog
- `/api/luma/create-order/route.ts` - Real order submission
- Environment variables with actual API endpoints

The framework is completely ready - just needs the real API endpoints plugged in!

---

**Status**: 🟡 Framework Complete - Awaiting Real API Details
