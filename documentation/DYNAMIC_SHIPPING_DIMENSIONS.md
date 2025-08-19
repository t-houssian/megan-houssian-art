# Dynamic Shipping Dimensions Implementation

## Overview
Updated the shipping system to use dynamic package dimensions from Sanity CMS instead of hardcoded values, allowing for accurate shipping calculations based on each individual artwork's size and weight.

## Changes Made

### 1. Sanity Schema Update (`/sanity/schemas/original.ts`)
Added shipping information fields to the original artwork schema:

```typescript
{
  name: 'shipping',
  title: 'Shipping Information',
  type: 'object',
  fields: [
    {
      name: 'weight',
      title: 'Weight (ounces)',
      type: 'number',
      description: 'Weight of the artwork with packaging in ounces',
      initialValue: 16,
    },
    {
      name: 'dimensions',
      title: 'Package Dimensions',
      type: 'object',
      fields: [
        {
          name: 'length',
          title: 'Length (inches)',
          type: 'number',
          initialValue: 12,
        },
        {
          name: 'width',
          title: 'Width (inches)', 
          type: 'number',
          initialValue: 9,
        },
        {
          name: 'height',
          title: 'Height (inches)',
          type: 'number',
          initialValue: 2,
        },
      ],
    },
  ],
}
```

### 2. Original Detail Page Update (`/app/originals/[slug]/page.tsx`)
- Updated TypeScript type to include shipping information
- Modified Sanity query to fetch shipping data
- Passed shipping data to PurchaseSection component

### 3. Purchase Section Component (`/app/components/PurchaseSection.tsx`)
- Added shipping parameter to component props
- Updated checkout URL generation to include shipping dimensions as query parameters
- Added fallback handling for missing shipping data

### 4. Checkout Page Update (`/app/checkout/page.tsx`)
- Added URL parameter extraction for shipping dimensions (weight, length, width, height)
- Updated shipping calculation API call to use dynamic dimensions instead of hardcoded values
- Maintained fallback defaults (16oz, 12x9x2 inches) for backwards compatibility

## URL Parameters
The checkout page now accepts these additional parameters:
- `weight` - Package weight in ounces
- `length` - Package length in inches  
- `width` - Package width in inches
- `height` - Package height in inches

Example URL:
```
/checkout?product=Sunset%20Landscape&price=350&weight=24&length=16&width=12&height=3
```

## Benefits
1. **Accurate Shipping**: Each artwork can have custom shipping calculations based on actual size/weight
2. **CMS Management**: Artists can easily update shipping dimensions through Sanity Studio
3. **Flexible Pricing**: Different sized artworks get appropriate shipping costs
4. **Backwards Compatible**: System still works with default values if shipping data isn't set

## Next Steps
1. Update existing artwork entries in Sanity to include shipping dimensions
2. Consider adding different packaging types for different artwork styles
3. Potentially add shipping dimensions to print schema for consistency
