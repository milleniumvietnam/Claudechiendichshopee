// Main Express Server - Kinh Doanh Shopee Backend API
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import ShopeeAPI from './api/shopee.js';
import SePayAPI from './api/payments.js';
import TelegramBot from './bot/telegram.js';
import { createOrder, getOrders, getOrderById, updateOrderStatus } from './routes/orders.js';
import { getProducts, getFeaturedProducts, getProductById } from './routes/products.js';
import { createPaymentQR, handlePaymentWebhook } from './routes/payments.js';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize APIs
const shopee = new ShopeeAPI(
  process.env.SHOPEE_KEY,
  process.env.SHOPEE_SECRET,
  process.env.SHOPEE_PARTNER_ID,
  process.env.SHOPEE_SHOP_ID
);

const sepay = new SePayAPI(
  process.env.SEPAY_API_KEY,
  process.env.SEPAY_SECRET_KEY,
  process.env.SEPAY_MERCHANT_ID
);

const telegram = new TelegramBot(
  process.env.TELEGRAM_BOT_TOKEN,
  process.env.TELEGRAM_CHAT_ID
);

// Share instances via app locals
app.locals.prisma = prisma;
app.locals.shopee = shopee;
app.locals.sepay = sepay;
app.locals.telegram = telegram;

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Products Routes
app.get('/api/products', getProducts);
app.get('/api/products/featured', getFeaturedProducts);
app.get('/api/products/:id', getProductById);

// Orders Routes
app.post('/api/orders', createOrder);
app.get('/api/orders', getOrders);
app.get('/api/orders/:id', getOrderById);
app.patch('/api/orders/:id/status', updateOrderStatus);

// Payments Routes
app.post('/api/payments/qr', createPaymentQR);
app.post('/api/payments/webhook', handlePaymentWebhook);

// Admin Stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [totalOrders, paidOrders, shippedOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { paymentStatus: 'PAID' } }),
      prisma.order.count({ where: { status: 'SHIPPED' } }),
    ]);

    const orders = await prisma.order.findMany({
      select: { total: true },
      where: { paymentStatus: 'PAID' }
    });
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    res.json({
      totalOrders,
      totalRevenue,
      paidOrders,
      pendingOrders: totalOrders - paidOrders,
      shippedOrders,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Stats error:', error.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Kinh Doanh Shopee Backend running on port ${PORT}`);
  console.log(`📍 API: ${process.env.API_URL || `http://localhost:${PORT}`}/api`);
  console.log(`💾 Database: Connected`);
  console.log(`🔗 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`📱 Node: ${process.version}`);
});

export default app;
