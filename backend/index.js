// Main Express Server
// Kinh Doanh Shopee - Backend API

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const ShopeeAPI = require('./api/shopee');
const SePayAPI = require('./api/payments');
const TelegramBot = require('./bot/telegram');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
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

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Shopee Products
app.get('/api/products/trending', async (req, res) => {
  try {
    const { keyword = 'phụ kiện điện thoại', limit = 20 } = req.query;
    const products = await shopee.searchProducts(keyword, limit);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:productId', async (req, res) => {
  try {
    const product = await shopee.getProductDetail(req.params.productId);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await shopee.getTrendingCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Orders
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, phone, address, productName, quantity, amount } = req.body;

    // Validate
    if (!customerName || !phone || !address || !productName || !quantity || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const orderId = `ORD-${Date.now()}`;
    const orderData = {
      orderId,
      customerName,
      phone,
      address,
      productName,
      quantity,
      amount,
      status: 'pending_payment',
      createdAt: new Date(),
    };

    // Send notification
    await telegram.notifyOrderPlaced(orderData);

    res.status(201).json({ orderId, status: 'created' });
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Payments
app.post('/api/payments/create-qr', async (req, res) => {
  try {
    const { orderId, amount, description } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ error: 'Missing orderId or amount' });
    }

    const qrCode = await sepay.createQRCode({
      orderId,
      amount,
      description,
    });

    res.json(qrCode);
  } catch (error) {
    console.error('Error creating payment QR:', error.message);
    res.status(500).json({ error: 'Failed to create payment QR' });
  }
});

// Payment Webhook (SePay callback)
app.post('/api/payments/webhook', async (req, res) => {
  try {
    const webhookData = req.body;

    // Verify signature
    if (!sepay.verifyPaymentSignature(webhookData)) {
      console.warn('Invalid payment signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { orderId, amount, status, transactionId } = webhookData;

    if (status === 'success') {
      // Update order status in database
      console.log(`Payment received for order ${orderId}: ₫${amount}`);

      // Send notification
      await telegram.notifyPaymentReceived({
        orderId,
        customerName: 'Customer',
        amount,
      });

      // TODO: Update DB, trigger fulfillment
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Admin Dashboard
app.get('/api/admin/stats', async (req, res) => {
  try {
    // TODO: Query database for stats
    const stats = {
      totalOrders: 0,
      totalRevenue: 0,
      paidOrders: 0,
      pendingOrders: 0,
      shippedOrders: 0,
      topProduct: 'N/A',
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Kinh Doanh Shopee Backend running on port ${PORT}`);
  console.log(`📍 API: ${process.env.API_URL}/api`);
  console.log(`💾 Database: ${process.env.DATABASE_URL?.split('@')[1] || 'Not configured'}`);
});

module.exports = app;
