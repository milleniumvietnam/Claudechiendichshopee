# 🔗 Shopee API Setup Guide

Step-by-step instructions to get Shopee API credentials and integrate with Kinh Doanh Shopee.

---

## Step 1: Create Shopee Seller Account

1. Go to **[seller.shopee.vn](https://seller.shopee.vn)**
2. Sign up or log in
3. Complete seller verification (ID card + bank account)
4. Activate your shop

---

## Step 2: Register API Application

### 1. Access Developer Portal

- Go to **seller.shopee.vn**
- Click your profile → **Settings**
- Find **API Development** or **App & Integration**

### 2. Create New App

1. Click **Create New App**
2. Fill in application details:
   - **App Name**: "Kinh Doanh Shopee Platform"
   - **Description**: "Shopee product sync and dropship automation"
   - **Redirect URI**: `https://your-domain.com/api/shopee/callback`

### 3. Get Credentials

After creation, you'll receive:

```
App Key (Consumer Key):      your_app_key_here
App Secret (Consumer Secret): your_app_secret_here
Partner ID:                  your_partner_id_here
```

Copy these into your `.env`:

```env
SHOPEE_KEY=your_app_key_here
SHOPEE_SECRET=your_app_secret_here
SHOPEE_PARTNER_ID=your_partner_id_here
```

---

## Step 3: Get Shop ID

Your **Shop ID** is visible in:

1. Seller Center → **Settings → Shop Info**
2. Look for **Shop ID** (numeric, e.g., `12345678`)

Add to `.env`:

```env
SHOPEE_SHOP_ID=12345678
```

---

## Step 4: Authorize Application

Shopee uses OAuth 2.0. When you first run the app:

1. User visits frontend
2. Click "Connect Shopee" (if product sync not yet enabled)
3. Redirected to Shopee login
4. User authorizes app
5. Redirected back with `access_token`

---

## API Endpoints Used

The backend integrates with these Shopee endpoints:

### Product Search
```
GET /api/v2/product/get_list
Parameters:
- shop_id (required)
- keyword (required for search)
- limit (optional, default 20)
```

Example:
```bash
curl -X GET "https://partner.shopeemobile.com/api/v2/product/get_list?shop_id=12345678&keyword=phone%20accessories&limit=20" \
  -H "Authorization: YOUR_SIGNATURE" \
  -H "X-Partner-Id: YOUR_PARTNER_ID"
```

### Product Details
```
GET /api/v2/product/get_detail
Parameters:
- shop_id (required)
- product_id (required)
```

### Get Orders
```
GET /api/v2/order/list
Parameters:
- shop_id (required)
- order_status (optional: all, unpaid, paid, shipped, etc)
```

### Get Categories
```
GET /api/v2/shop/get_category
Parameters:
- shop_id (required)
```

---

## Testing the Integration

### Test 1: Health Check

```bash
curl http://localhost:5000/api/health
# Expected response: {"status":"OK",...}
```

### Test 2: Fetch Categories

```bash
curl http://localhost:5000/api/categories
# Should return Shopee category list
```

### Test 3: Search Products

```bash
curl "http://localhost:5000/api/products/trending?keyword=phone%20accessories&limit=10"
# Should return 10 phone accessories from Shopee
```

### Test 4: Get Product Details

```bash
curl http://localhost:5000/api/products/12345
# Should return product details including price, stock, ratings
```

---

## Product Data Retrieved

For each product, we get:

```json
{
  "product_id": 12345,
  "product_name": "Wireless Earbuds XYZ",
  "product_image": "https://...",
  "price": 250000,
  "price_before_discount": 300000,
  "discount": 17,
  "sold": 1250,
  "rating": 4.7,
  "rating_count": 850,
  "stock": 500,
  "shop_id": 67890,
  "shop_name": "TechStore Vietnam",
  "seller_location": "Ho Chi Minh"
}
```

---

## Sync Strategy

### Recommended: Daily Sync

```bash
# Backend job (runs daily at midnight)
// In backend/jobs/syncProducts.js
const syncProducts = async () => {
  const categories = ['phụ kiện điện thoại', 'smartwatch', 'pin sạc'];
  
  for (const category of categories) {
    const products = await shopee.searchProducts(category, 50);
    // Save to database
  }
  
  await telegram.sendDailyReport(stats);
};

// Run via cron job
node --require dotenv/config backend/jobs/syncProducts.js
```

### Or: On-Demand Sync

Trigger manually via API:

```bash
POST /api/admin/sync-products
Response: { synced: 150, errors: 0 }
```

---

## Troubleshooting

### Problem: Invalid Signature Error

**Cause**: SHOPEE_SECRET incorrect or request format wrong

**Solution**:
1. Verify SHOPEE_SECRET in `.env`
2. Check timestamp is current (within 5 minutes)
3. Verify request path format

### Problem: 401 Unauthorized

**Cause**: SHOPEE_KEY or SHOPEE_PARTNER_ID incorrect

**Solution**:
1. Go to seller.shopee.vn → API Development
2. Double-check credentials
3. Ensure app is authorized

### Problem: Rate Limit Exceeded

**Cause**: Too many API calls (limit: ~100 calls/minute)

**Solution**:
1. Add delay between requests (backend does this automatically)
2. Implement caching layer
3. Batch requests where possible

### Problem: 404 - Product Not Found

**Cause**: Product ID doesn't exist or was deleted

**Solution**:
1. Verify product_id is correct
2. Product may have been delisted
3. Try searching by keyword instead

---

## Best Practices

✅ **Do:**
- Cache product data (reduce API calls)
- Implement request delay (don't spam API)
- Validate data before saving
- Handle expired access tokens gracefully
- Log all API errors

❌ **Don't:**
- Hardcode credentials in code
- Make synchronous API calls in frontend
- Store raw prices (always include markup)
- Ignore rate limiting

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| GET /product/get_list | 100 calls/min |
| GET /product/get_detail | 100 calls/min |
| GET /order/list | 50 calls/min |
| GET /shop/get_category | 50 calls/min |

---

## Shopee Partner Program Bonus

When you sync Shopee products and drive sales:
- Get **affiliate commission** (if using affiliate links)
- Build **seller relationship** (open to partnerships)
- Access **promotional campaigns** (Mega Sales, etc)

---

**Ready?** Start syncing products now:

```bash
cd backend
npm run dev

# In another terminal:
curl http://localhost:5000/api/products/trending?keyword=smartwatch
```

🎉 Enjoy your curated dropship platform!
