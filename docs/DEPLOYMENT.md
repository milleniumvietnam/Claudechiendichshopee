# 🚀 Deployment Guide - Production Ready

Deploy Kinh Doanh Shopee to production in 30 minutes using Vercel + Railway.

---

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│ Users (Browser/Mobile)                  │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    ┌───▼────────┐      ┌─────▼──────────┐
    │  Vercel    │      │   Railway      │
    │ (Frontend) │      │  (Backend API) │
    │ Next.js    │      │  Node.js/Expr  │
    └───┬────────┘      └─────┬──────────┘
        │                     │
        └──────────────────┬──┘
                           │
                    ┌──────▼────────┐
                    │   Railway DB   │
                    │ PostgreSQL/    │
                    │   MongoDB      │
                    └────────────────┘

External Services:
├── Shopee API (seller.shopee.vn)
├── SePay VietQR (sepay.vn)
└── Telegram Bot API
```

---

## Part 1: Push to GitHub

### Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `kinh-doanh-shopee`
3. Description: "Curated dropship platform with Shopee API + SePay payment"
4. Public or Private
5. Create repository

### Push Your Code

```bash
cd "Kinh Doanh Shopee"

# Initialize Git (if not already done)
git init
git config user.name "Your Name"
git config user.email "your-email@example.com"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/kinh-doanh-shopee.git

# Push to GitHub
git add .
git commit -m "Initial commit: Kinh Doanh Shopee platform"
git branch -M main
git push -u origin main
```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **Import Project**
4. Select your `kinh-doanh-shopee` repository

### Step 2: Configure Build

**Project settings:**
- **Framework Preset**: Next.js
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 3: Environment Variables

Add to Vercel:

```
NEXT_PUBLIC_API_URL=https://kinh-doanh-shopee-api.railway.app
NEXT_PUBLIC_APP_NAME=Kinh Doanh Shopee
NEXT_PUBLIC_APP_DESCRIPTION=Curated Dropship Platform
```

(Replace API URL with your Railway backend URL after deployment)

### Step 4: Deploy

Click **Deploy** → Wait for build → Get your frontend URL:
```
https://kinh-doanh-shopee.vercel.app
```

---

## Part 3: Deploy Backend to Railway

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **New Project → Deploy from GitHub**
4. Select your `kinh-doanh-shopee` repository

### Step 2: Configure Root Directory

In Railway project settings:
- **Root Directory**: `backend`

### Step 3: Add PostgreSQL Database

1. In Railway dashboard, click **+ New**
2. Select **Database → PostgreSQL**
3. Railway auto-fills `DATABASE_URL`

### Step 4: Environment Variables

Add to Railway:

```env
NODE_ENV=production
PORT=5000

SHOPEE_KEY=your_shopee_key
SHOPEE_SECRET=your_shopee_secret
SHOPEE_PARTNER_ID=your_partner_id
SHOPEE_SHOP_ID=your_shop_id

SEPAY_API_KEY=your_sepay_key
SEPAY_SECRET_KEY=your_sepay_secret
SEPAY_MERCHANT_ID=your_merchant_id
SEPAY_WEBHOOK_URL=https://kinh-doanh-shopee-api.railway.app/api/payments/webhook

TELEGRAM_BOT_TOKEN=your_telegram_token
TELEGRAM_CHAT_ID=your_chat_id

JWT_SECRET=your_random_32_char_secret
FRONTEND_URL=https://kinh-doanh-shopee.vercel.app
```

(Railway auto-fills `DATABASE_URL` from PostgreSQL service)

### Step 5: Deploy

Railway auto-deploys on push to GitHub. Wait for build completion.

Get your Railway API URL:
```
https://kinh-doanh-shopee-api.railway.app
```

---

## Part 4: Update Vercel with Backend URL

1. Go to Vercel dashboard
2. Select your project
3. Settings → Environment Variables
4. Update:
   ```
   NEXT_PUBLIC_API_URL=https://kinh-doanh-shopee-api.railway.app
   ```
5. Redeploy (trigger new build)

---

## Part 5: Configure SePay Webhook

1. Go to SePay merchant dashboard
2. Set webhook URL:
   ```
   https://kinh-doanh-shopee-api.railway.app/api/payments/webhook
   ```
3. Test webhook in SePay → should return `200 OK`

---

## Part 6: Test Production

### Check Health

```bash
curl https://kinh-doanh-shopee-api.railway.app/api/health
# Should return: {"status":"OK",...}
```

### Test Frontend

Visit https://kinh-doanh-shopee.vercel.app → should load

### Test Payment Flow

1. Create order via UI
2. Scan QR code (use SePay test mode)
3. Check Telegram for order notification

---

## Monitoring & Logs

### View Backend Logs

```bash
# Railway logs (auto-streamed)
railway logs
```

### View Frontend Logs

```bash
# Vercel dashboard → Analytics → Functions
# Or check Vercel CLI:
vercel logs
```

### Monitor Uptime

- Set up monitoring: [Uptime Robot](https://uptimerobot.com)
- Monitor: `https://kinh-doanh-shopee-api.railway.app/api/health`

---

## Custom Domain (Optional)

### Frontend Custom Domain

1. Vercel → Settings → Domains
2. Add your custom domain (e.g., `shop.yourdomain.com`)
3. Update DNS records per Vercel instructions

### Backend Custom Domain

1. Railway → Settings → Custom Domain
2. Add your domain (e.g., `api.yourdomain.com`)
3. Update DNS records

---

## Performance Optimization

### Frontend (Vercel)

```bash
# Enable analytics
vercel analytics enable

# Monitor Core Web Vitals
vercel insights
```

### Backend (Railway)

Monitor in Railway dashboard:
- Response times
- Error rates
- CPU/Memory usage
- Database connections

---

## Troubleshooting

### Deployment Failed

```bash
# Check logs
railway logs
# or
vercel logs
```

### CORS Error

In `backend/.env`:
```env
FRONTEND_URL=https://kinh-doanh-shopee.vercel.app
```

Redeploy backend.

### Database Connection Error

```bash
# Test connection
railway connect

# Or check connection string format:
# postgresql://user:password@host:5432/database
```

### Payment QR Not Working

1. Verify SEPAY_API_KEY in Railway
2. Check webhook URL in SePay dashboard
3. Test webhook: SePay → Settings → Test Webhook

---

## Scaling Checklist

- [ ] Vercel Pro for better performance
- [ ] Railway Pro for dedicated resources
- [ ] CDN for image optimization (Cloudflare)
- [ ] Database backups enabled
- [ ] Monitoring alerts set up
- [ ] API rate limiting configured
- [ ] SSL certificate auto-renewed

---

## Cost Estimate (Monthly)

| Service | Free | Paid |
|---------|------|------|
| **Vercel** | $0 | $20+ |
| **Railway** | $5/mo | $50+ |
| **PostgreSQL** | Included | Included |
| **Total** | ~$5 | ~$70+ |

---

**Deployed successfully?** Now go live with marketing! 🚀
