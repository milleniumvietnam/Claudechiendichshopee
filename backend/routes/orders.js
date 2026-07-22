// Order Routes
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createOrder(req, res) {
  try {
    const {
      name,
      email,
      phone,
      address,
      ward,
      district,
      city,
      items,
      shippingFee = 30000,
      notes
    } = req.body;

    // Validate
    if (!name || !phone || !address || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get or create customer
    const customer = await prisma.customer.upsert({
      where: { phone },
      create: { name, phone, email, address, ward, district, city },
      update: { name, email, address, ward, district, city }
    });

    // Calculate total
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    const productMap = new Map(products.map(p => [p.id, p]));
    let subtotal = 0;

    const orderItems = items.map(item => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        total: itemTotal
      };
    });

    const total = subtotal + shippingFee;
    const orderNumber = `ORD-${Date.now()}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        subtotal,
        shippingFee,
        total,
        status: 'PENDING_PAYMENT',
        paymentStatus: 'PENDING',
        notes,
        items: {
          create: orderItems
        }
      },
      include: {
        customer: true,
        items: {
          include: { product: true }
        }
      }
    });

    // Send Telegram notification
    const telegram = req.app.locals.telegram;
    if (telegram) {
      try {
        await telegram.notifyOrderPlaced({
          orderId: order.orderNumber,
          customerName: customer.name,
          phone: customer.phone,
          address: `${address}, ${ward}, ${district}, ${city}`,
          productName: items.map(i => productMap.get(i.productId)?.name).join(', '),
          quantity: items.reduce((sum, i) => sum + i.quantity, 0),
          amount: total
        });
      } catch (err) {
        console.error('Telegram notification failed:', err.message);
      }
    }

    res.status(201).json({
      success: true,
      order,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
}

export async function getOrders(req, res) {
  try {
    const { phone, limit = 10, offset = 0, status } = req.query;

    const where = {
      ...(phone && { customer: { phone } }),
      ...(status && { status })
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: true,
          items: { include: { product: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(offset),
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

export async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: true } },
        payments: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, trackingNumber, trackingUrl, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }

    const validStatuses = ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        trackingNumber,
        trackingUrl,
        adminNotes,
        ...(status === 'SHIPPED' && { shippedAt: new Date() }),
        ...(status === 'DELIVERED' && { deliveredAt: new Date() })
      },
      include: {
        customer: true,
        items: { include: { product: true } }
      }
    });

    // Send Telegram notification
    const telegram = req.app.locals.telegram;
    if (telegram && status === 'SHIPPED') {
      try {
        await telegram.notifyShipment({
          orderId: order.orderNumber,
          customerName: order.customer.name,
          trackingNumber: trackingNumber || 'N/A',
          trackingUrl: trackingUrl || '#',
          address: order.customer.address
        });
      } catch (err) {
        console.error('Telegram notification failed:', err.message);
      }
    }

    res.json({
      success: true,
      order,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
}
