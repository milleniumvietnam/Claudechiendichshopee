# 🐳 Docker Setup - Local Development

Complete guide to run **Kinh Doanh Shopee** locally using Docker Compose (PostgreSQL + Backend + Frontend all in one command).

---

## Prerequisites

1. **Docker Desktop** installed and running
   - Download from [docker.com](https://docker.com/products/docker-desktop)
   - Verify: `docker --version`

2. **Docker Compose** (included with Docker Desktop)
   - Verify: `docker-compose --version`

---

## Quick Start (3 Steps)

### Step 1: Copy Environment File

```bash
cd "Kinh Doanh Shopee"
cp .env.docker .env
```

### Step 2: Update Credentials (Optional)

Edit `.env` and add your actual credentials if you have them:

```bash
# Add your Shopee API keys
SHOPEE_KEY=your_key
SHOPEE_SECRET=your_secret
SHOPEE_PARTNER_ID=your_partner_id
SHOPEE_SHOP_ID=your_shop_id

# Add your SePay keys
SEPAY_API_KEY=your_key
SEPAY_SECRET_KEY=your_secret

# Add your Telegram bot token
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id
```

If you don't have credentials yet, just leave them blank and add later.

### Step 3: Start Everything

```bash
docker-compose up
```

**Wait for all services to start (takes ~30 seconds).**

You'll see output like:
```
db  | ... database system is ready to accept connections
api | 🚀 Kinh Doanh Shopee Backend running on port 5000
web | ▲ Next.js 14.0.0
web | - Local: http://localhost:3000
```

---

## Access Your Application

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Browse the store |
| **Backend API** | http://localhost:5000/api | API endpoints |
| **API Health** | http://localhost:5000/api/health | Check if backend is running |
| **Database** | localhost:5432 | PostgreSQL (from host machine) |

---

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f api

# Just frontend
docker-compose logs -f web

# Just database
docker-compose logs -f db
```

### Stop Services

```bash
docker-compose down
```

### Restart Everything

```bash
docker-compose restart
```

### Remove Everything (Including Data)

```bash
docker-compose down -v
```

---

## Database Management

### View Database (Via CLI)

```bash
# Connect to PostgreSQL inside the container
docker-compose exec db psql -U postgres -d kinh_doanh_shopee

# Then run SQL:
\dt                    # Show tables
SELECT * FROM products;  # Query products
\q                    # Exit
```

### Seed Sample Data

```bash
docker-compose exec api npm run db:seed
```

This loads 4 sample products into the database.

### View with Prisma Studio

```bash
docker-compose exec api npm run db:studio
```

Opens an interactive database browser at `http://localhost:5555`

---

## Testing the API

### Health Check

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2026-07-23T10:30:45.123Z",
  "environment": "development"
}
```

### Fetch Products

```bash
curl http://localhost:5000/api/products?limit=5
```

### Create Order

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "0901234567",
    "address": "123 Nguyen Hue",
    "ward": "Ben Nghe",
    "district": "District 1",
    "city": "Ho Chi Minh",
    "items": [
      {"productId": "cloa1b2c3d4e5f6", "quantity": 1}
    ],
    "shippingFee": 30000
  }'
```

---

## Frontend Development

### Hot Reload

The frontend watches for file changes automatically. Edit a page and refresh the browser to see changes:

```bash
# Edit:
nano frontend/pages/index.jsx

# Browser auto-refreshes when saved (Next.js HMR)
```

### View in Browser

Open: http://localhost:3000

Pages available:
- **Home**: `/` (landing page with featured products)
- **Products**: `/products` (product listing with filters)
- **Cart**: `/cart` (shopping cart/checkout)

---

## Backend Development

### API Routes

All available routes:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/products` | List all products |
| GET | `/api/products/featured` | Featured products |
| GET | `/api/products/:id` | Product details |
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | List orders |
| GET | `/api/orders/:id` | Order details |
| PATCH | `/api/orders/:id/status` | Update order status |
| POST | `/api/payments/qr` | Create payment QR |
| POST | `/api/payments/webhook` | SePay webhook |
| GET | `/api/admin/stats` | Admin statistics |

### View Backend Logs

```bash
docker-compose logs -f api
```

### Restart Backend (After Changes)

```bash
docker-compose restart api
```

---

## Database Troubleshooting

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps

# Should show:
# CONTAINER STATUS
# db running (healthy)
# api running
# web running
```

If database is not running:
```bash
docker-compose up db
```

### Cannot Connect from Host Machine

If you want to connect from tools like `pgAdmin` or `DBeaver`:

```bash
# Host: localhost
# Port: 5432
# User: postgres
# Password: postgres
# Database: kinh_doanh_shopee
```

### Reset Database

```bash
docker-compose down -v
docker-compose up
docker-compose exec api npm run db:seed
```

---

## Performance

### Check Container Resources

```bash
docker stats
```

Shows CPU, memory usage for each container.

### Typical Resource Usage

- PostgreSQL: 50-150 MB RAM
- Node.js API: 100-300 MB RAM
- Next.js Frontend: 150-400 MB RAM

**Total**: ~400-850 MB (very lightweight)

---

## Environment Variables Reference

### Available in `.env`

```env
# Node Environment
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/kinh_doanh_shopee
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=kinh_doanh_shopee

# APIs (Add your credentials)
SHOPEE_KEY=
SHOPEE_SECRET=
SHOPEE_PARTNER_ID=
SHOPEE_SHOP_ID=
SEPAY_API_KEY=
SEPAY_SECRET_KEY=
SEPAY_MERCHANT_ID=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Frontend
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Kinh Doanh Shopee

# Secrets
JWT_SECRET=dev-secret-key-change-in-production
```

---

## Next Steps

After setting up locally:

1. **Test the API**: Run curl commands above
2. **Browse the store**: Visit http://localhost:3000
3. **Seed data**: `docker-compose exec api npm run db:seed`
4. **Connect to database**: `docker-compose exec db psql -U postgres`
5. **Check logs**: `docker-compose logs -f`

---

## Production Deployment

When ready to deploy:

1. Update `.env.production` with real credentials
2. Push to GitHub
3. Deploy frontend to Vercel (see `docs/DEPLOYMENT.md`)
4. Deploy backend to Railway (see `docs/DEPLOYMENT.md`)

---

## Troubleshooting

### Port Already in Use

If you get "port 3000 already in use":

```bash
# Use different port
docker-compose -p kinh2 up

# Or kill existing process
lsof -i :3000
kill -9 <PID>
```

### Container Won't Start

```bash
# View detailed logs
docker-compose logs api

# Restart
docker-compose restart api

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Database Files Damaged

```bash
docker-compose down -v  # Remove volume
docker-compose up      # Fresh start
```

---

## Quick Reference

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Stop and remove data
docker-compose down -v

# Run database seed
docker-compose exec api npm run db:seed

# Access database CLI
docker-compose exec db psql -U postgres -d kinh_doanh_shopee

# View stats
docker stats

# Rebuild containers
docker-compose build --no-cache
```

---

**Ready?** Run `docker-compose up` and visit http://localhost:3000! 🚀
