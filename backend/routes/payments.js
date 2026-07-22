// Payment Routes
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createPaymentQR(req, res) {
  try {
    const { orderId, amount, description } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ error: 'orderId and amount required' });
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({ error: 'Order already paid' });
    }

    const sepay = req.app.locals.sepay;
    if (!sepay) {
      return res.status(500).json({ error: 'Payment gateway not configured' });
    }

    // Generate QR (mock if no SePay credentials)
    let qrCode;
    try {
      const qrData = await sepay.createQRCode({
        orderId: order.orderNumber,
        amount: amount || order.total,
        description: description || `Order ${order.orderNumber}`
      });
      qrCode = qrData.qrCode || qrData;
    } catch (error) {
      console.error('SePay error:', error.message);
      // Return mock QR for development
      qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MOCK_QR_${order.orderNumber}`;
    }

    // Save payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: amount || order.total,
        status: 'PENDING',
        qrCode
      }
    });

    res.json({
      success: true,
      orderId: order.orderNumber,
      amount: payment.amount,
      qrCode: payment.qrCode,
      expiresIn: 15 * 60, // 15 minutes
      instructions: 'Scan QR code with your banking app to complete payment'
    });
  } catch (error) {
    console.error('Create QR error:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment QR' });
  }
}

export async function handlePaymentWebhook(req, res) {
  try {
    const webhookData = req.body;
    const sepay = req.app.locals.sepay;
    const telegram = req.app.locals.telegram;

    // Verify signature
    if (sepay && !sepay.verifyPaymentSignature(webhookData)) {
      console.warn('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { orderId, amount, status, transactionId } = webhookData;

    // Find order
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderId },
      include: { customer: true, items: { include: { product: true } } }
    });

    if (!order) {
      console.warn(`Order not found: ${orderId}`);
      return res.json({ success: true }); // Still return 200 to SePay
    }

    if (status === 'success' || status === 'PAID') {
      // Update order
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          status: 'PROCESSING',
          paidAt: new Date()
        }
      });

      // Update payment record
      await prisma.payment.updateMany({
        where: { orderId: order.id },
        data: {
          status: 'PAID',
          sePayTransId: transactionId,
          paidAt: new Date()
        }
      });

      // Send telegram notification
      if (telegram) {
        try {
          await telegram.notifyPaymentReceived({
            orderId: order.orderNumber,
            customerName: order.customer.name,
            amount: amount || order.total
          });
        } catch (err) {
          console.error('Telegram notification failed:', err.message);
        }
      }

      console.log(`✅ Payment received for order ${orderId}: ₫${amount}`);
    } else if (status === 'failed' || status === 'FAILED') {
      await prisma.payment.updateMany({
        where: { orderId: order.id },
        data: { status: 'FAILED' }
      });

      console.log(`❌ Payment failed for order ${orderId}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message || 'Webhook processing failed' });
  }
}

export async function getPaymentStatus(req, res) {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      orderId: order.orderNumber,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      payments: order.payments.map(p => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        paidAt: p.paidAt,
        transactionId: p.sePayTransId
      }))
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
}
