# Product Visibility Fix

## Problem

Products created in the dashboard were not showing up on the store frontend, even though they appeared correctly in the dashboard.

## Root Cause

The product creation form (`/dashboard/products/new`) was not setting an explicit `status` field when creating products. This caused products to be created with a default status that wasn't being properly handled by the storefront display logic.

## Solution

### 1. **Added Product Status Field to Creation Form**

The product creation form now includes:
- Default status set to `"active"` for immediate visibility
- Clear UI toggle between "Active" and "Draft" status
- Visual explanation of what each status means

**Location**: `/frontend/web/app/dashboard/products/new/page.tsx`

### 2. **Added Status Filtering in Template Adapter**

The template adapter now filters products to only show "active" products on the storefront:
- Product list endpoint filters for `status === "active"`
- Single product lookup also checks active status
- Draft products remain visible only in dashboard

**Location**: `/frontend/web/app/api/adapters/[templateId]/[...path]/route.ts`

### 3. **Migration Script for Existing Products**

A script is provided to update all existing draft products to "active" status:

```bash
npm run fix:product-status
```

**Location**: `/scripts/fix-product-status.js`

## How It Works Now

### Product Lifecycle

1. **Creation**: 
   - New products default to "active" status
   - Users can choose "draft" if they want to hide the product
   - Status is explicitly saved in the database

2. **Dashboard Display**:
   - Shows ALL products (active, draft, archived)
   - Status badge indicates current state
   - Toggle button allows quick status changes

3. **Storefront Display**:
   - Only shows products with `status === "active"`
   - Draft products are hidden from customers
   - Archived products are excluded

### Status Options

| Status | Dashboard | Storefront | Use Case |
|--------|-----------|------------|----------|
| **Active** | ✅ Visible | ✅ Visible | Products ready for sale |
| **Draft** | ✅ Visible | ❌ Hidden | Work in progress, not ready |
| **Archived** | ✅ Visible | ❌ Hidden | Discontinued products |

## For Existing Stores

If you have products that were created before this fix and they're not showing up on your store:

### Option 1: Use the Migration Script (Recommended)

```bash
# From the project root
npm run fix:product-status
```

This will update all draft products to "active" status automatically.

### Option 2: Manual Update via Dashboard

1. Go to **Dashboard → Products**
2. Find products with "Draft" status (yellow badge)
3. Click the toggle icon next to the status badge
4. Status will change to "Active" (green badge)
5. Products will now appear on your storefront

### Option 3: Database Direct Update

If you have database access:

```sql
UPDATE "Product" 
SET status = 'active' 
WHERE status = 'draft' 
AND "deletedAt" IS NULL;
```

## Testing

### Verify Products Are Visible

1. **Create a new product**:
   - Go to Dashboard → Products → Add Product
   - Fill in product details
   - Ensure "Active" is selected (default)
   - Click "Save Product"

2. **Check dashboard**:
   - Product should appear with green "Active" badge
   - Toggle should show enabled state

3. **Check storefront**:
   - Visit your store at `/store/[your-store-id]`
   - Product should be visible in the product grid
   - Product detail page should be accessible

### Verify Draft Products Are Hidden

1. **Create a draft product**:
   - Select "Draft" status before saving
   - Save product

2. **Verify**:
   - Dashboard: Product shows with yellow "Draft" badge
   - Storefront: Product does NOT appear

## Technical Details

### API Endpoints

- **Dashboard Products API** (`/api/products`): Returns ALL products (active, draft) for the logged-in store
- **Storefront Products API** (`/api/adapters/[templateId]/products`): Returns ONLY active products

### Database Schema

The `Product` model includes:
```prisma
model Product {
  // ...
  status String @default("draft")
  // ...
}
```

### Status Flow

```
Create Product → Set Status → Save to DB → API Filters → Template Display
                     ↓
                  active
                     ↓
              Show on Store ✅
                  
                     OR
                     
                  draft
                     ↓
              Hide from Store ❌
```

## Future Improvements

1. **Scheduled Publishing**: Allow setting future publish dates
2. **Bulk Status Updates**: Select multiple products and change status
3. **Status History**: Track when products were activated/drafted
4. **Auto-draft on Stock Zero**: Automatically draft products when out of stock

## Support

If products are still not showing up after applying this fix:

1. Check browser console for API errors
2. Verify `storeId` is being passed correctly in the URL
3. Check database that products have `status = 'active'`
4. Clear browser cache and refresh
5. Check that products have at least one image (recommended but not required)

## Related Files

- `/frontend/web/app/dashboard/products/new/page.tsx` - Product creation form
- `/frontend/web/app/dashboard/products/page.tsx` - Product list with status toggle
- `/frontend/web/app/api/adapters/[templateId]/[...path]/route.ts` - Template adapter with filtering
- `/frontend/web/lib/db.ts` - Database queries
- `/scripts/fix-product-status.js` - Migration script
