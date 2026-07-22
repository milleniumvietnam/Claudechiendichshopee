# 🛒 Kinh Doanh Shopee - Curated Dropship Platform

**Business-in-a-Box: Shopee Product Curation + E-commerce + Payment Automation**

Built with Node.js, Next.js, Shopee API, SePay, and Telegram integration. Deploy on Vercel (frontend) + Railway (backend) in <30 minutes.

---

## 📊 Business Model

**Curated Dropship with Brand Building** — Pick 5-10 bestselling products from Shopee, add premium packaging/content, sell at 40-50% margins to Gen Z audience via livestream & social.

### 🎯 Target Products
- Wireless earbuds/headphones
- Power banks (10k-30k mAh)
- Phone chargers (fast-charge, multi-port)
- Smartwatch accessories
- Smart home items (mini vacuums, laptop stands)

### 💰 Revenue Projections
- Buy wholesale: ₫80k-150k per unit
- Sell retail: ₫150k-300k per unit
- **Target margin: 40-50%**
- Break-even: 20 units/month (at ₫2M volume)

---

## 🏗️ Architecture

```
Kinh Doanh Shopee/
├── backend/              # Node.js + Express API
│   ├── api/
│   │   ├── shopee.js     # Shopee API integration
│   │   ├── products.js   # Product CRUD
│   │   ├── orders.js     # Order management
│   │   └── payments.js   # SePay VietQR integration
│   ├── bot/              # Telegram bot automation
│   ├── models/           # Database schemas
│   ├── config/           # Environment & secrets
│   └── index.js          # Server entry
├── frontend/             # Next.js + React storefront
│   ├── pages/
│   ├── components/       # Product cards, checkout
│   ├── styles/
│   └── public/
├── shared/               # Shared utilities
│   ├── constants.js
│   ├── utils.js
│   └── validators.js
└── docs/                 # Setup & deployment guides
    ├── SETUP.md
    ├── SHOPEE_API.md
    ├── SEPAY_SETUP.md
    └── DEPLOYMENT.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL or MongoDB
- Shopee Shop account (seller)
- SePay business account
- Telegram bot token

### 1️⃣ Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in: SHOPEE_KEY, SHOPEE_SECRET, SEPAY_KEY, TELEGRAM_TOKEN, DATABASE_URL
npm run dev
```

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_API_URL
npm run dev
```

### 3️⃣ Deploy

**Frontend** → Vercel (1-click from GitHub)
**Backend** → Railway or Render (connect GitHub repo)
**Database** → Railway PostgreSQL or MongoDB Atlas

---

## 🔑 Key Features

✅ **Shopee Product Sync** — Auto-fetch trending products via Shopee API
✅ **Landing Page** — Curated storefront with product cards & reviews
✅ **Payment Automation** — SePay VietQR for instant order processing
✅ **Telegram Notifications** — Order alerts + delivery tracking
✅ **Admin Dashboard** — Manage inventory, orders, analytics
✅ **Livestream Integration** — Embed product links in TikTok/YouTube
✅ **Multi-Product Support** — Handle 50+ products with inventory sync

---

## 📱 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS |
| **Backend** | Node.js, Express, PostgreSQL |
| **APIs** | Shopee REST, SePay Webhook, Telegram Bot |
| **Deployment** | Vercel, Railway, GitHub Actions |
| **Auth** | JWT + API Keys |

---

## 🚀 Deployment (5 minutes)

### Option A: Vercel + Railway (Recommended)

```bash
# 1. Push to GitHub
git add .
git commit -m "Initial commit: Kinh Doanh Shopee"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kinh-doanh-shopee.git
git push -u origin main

# 2. Deploy Frontend
vercel --prod

# 3. Deploy Backend
# Go to railway.app → Connect GitHub → Select backend folder
```

### Option B: Docker (Production)

```bash
docker-compose up --build
```

---

## 📚 Guides

- **[Setup Guide](docs/SETUP.md)** — Install & configure locally
- **[Shopee API](docs/SHOPEE_API.md)** — Fetch products, sync inventory
- **[SePay Setup](docs/SEPAY_SETUP.md)** — Payment processing
- **[Deployment](docs/DEPLOYMENT.md)** — Production checklist

---

## 💡 Next Steps

1. **Pick 5-10 products** → Update `backend/config/products.json`
2. **Set Shopee credentials** → Generate API key at seller.shopee.vn
3. **Configure SePay** → Get VietQR merchant key
4. **Test payment flow** → Use SePay test mode
5. **Launch landing page** → Deploy to Vercel
6. **Enable Telegram bot** → Test order notifications
7. **Go live** → Connect to TikTok Shop affiliate or run ads

---

## 📞 Support

For questions:
- Check `docs/` folder
- Review `.env.example` files
- Run backend in debug mode: `DEBUG=* npm run dev`

---

**Built for Millenium Việt Nam — Thánh Gióng 2.0 Business Kit** 🚀
