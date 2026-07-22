# 🚀 Setup Guide - Kinh Doanh Shopee

Complete local setup instructions for the curated dropship platform.

---

## Prerequisites

- **Node.js** 16+ (download from nodejs.org)
- **PostgreSQL** 13+ or **MongoDB** 4.4+
- **Git** (for version control)
- A **Shopee Seller Account** (seller.shopee.vn)
- **SePay merchant account** (sepay.vn)
- **Telegram Bot Token** (from @BotFather on Telegram)

---

## Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/kinh-doanh-shopee.git
cd "kinh-doanh-shopee"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

---

## Step 2: Database Setup

### Option A: PostgreSQL

```bash
# Create database
createdb kinh_doanh_shopee

# Set DATABASE_URL in .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/kinh_doanh_shopee
```

### Option B: MongoDB

```bash
# Create cluster on mongodb.com
# Get connection string and set:
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/kinh_doanh_shopee
```

---

## Step 3: Environment Configuration

### Backend (.env)

```bash
cp backend/.env.example backend/.env
```

Fill in the required values:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://...

# From seller.shopee.vn/dev/app
SHOPEE_KEY=your_key
SHOPEE_SECRET=your_secret
SHOPEE_PARTNER_ID=your_partner_id
SHOPEE_SHOP_ID=your_shop_id

# From sepay.vn
SEPAY_API_KEY=your_api_key
SEPAY_SECRET_KEY=your_secret
SEPAY_MERCHANT_ID=your_merchant_id

# From @BotFather on Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_admin_chat_id

JWT_SECRET=generate_a_random_32_char_string_here
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```bash
cp frontend/.env.example frontend/.env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Step 4: Get Your Credentials

### Shopee API Credentials

1. Go to **seller.shopee.vn**
2. Navigate to **Settings → API Development**
3. Create an app and get:
   - **App Key**
   - **App Secret**
   - **Shop ID** (visible in Seller Center)
   - **Partner ID** (in API docs)

### SePay Credentials

1. Go to **sepay.vn**
2. Sign up as merchant
3. Get:
   - **API Key**
   - **Secret Key**
   - **Merchant ID**
4. Set webhook URL: `https://your-domain.com/api/payments/webhook`

### Telegram Bot Token

1. Open Telegram and search for **@BotFather**
2. Send `/start` then `/newbot`
3. Name your bot: "Kinh Doanh Shopee Bot"
4. Copy the **HTTP API Token**
5. Get your **Chat ID**: Send a message to your bot, then:
   ```bash
   curl https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
   ```
   Look for your `chat_id`

---

## Step 5: Run Locally

### Terminal 1 - Backend

```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

Visit **http://localhost:3000** 🎉

---

## Step 6: Test the Flow

### 1. Check API Health
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"OK",...}
```

### 2. Fetch Products
```bash
curl http://localhost:5000/api/products/trending?keyword=phụ%20kiện%20điện%20thoại&limit=5
```

### 3. Create Test Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Nguyen Van A",
    "phone": "0901234567",
    "address": "123 Hang Gai, Hoan Kiem, Hanoi",
    "productName": "Wireless Earbuds",
    "quantity": 1,
    "amount": 250000
  }'
```

### 4. Create Payment QR
```bash
curl -X POST http://localhost:5000/api/payments/create-qr \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-123456",
    "amount": 250000,
    "description": "Payment for order"
  }'
```

---

## Troubleshooting

### API Connection Error
- Check SHOPEE_KEY, SHOPEE_SECRET are correct
- Verify Shopee Shop ID is set
- Check firewall/VPN isn't blocking

### Database Connection Failed
- Verify DATABASE_URL format is correct
- Check PostgreSQL/MongoDB is running
- Use `psql` or `mongosh` to test connection

### Telegram Bot Not Sending
- Verify TELEGRAM_BOT_TOKEN is correct
- Check TELEGRAM_CHAT_ID is valid
- Bot must be in the chat first

### Payment QR Not Generating
- Check SEPAY_API_KEY is correct
- Verify merchant status in SePay dashboard
- Check firewall rules for SePay endpoints

---

## Next Steps

1. **Configure products** → Edit `backend/config/products.json`
2. **Design landing page** → Update `frontend/pages/index.js`
3. **Set up Telegram notifications** → Test with `/api/admin/stats`
4. **Deploy to production** → See `DEPLOYMENT.md`

---

**Having issues?** Check logs: `DEBUG=* npm run dev`
