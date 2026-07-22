// Product Routes
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getProducts(req, res) {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query;

    const where = {
      active: true,
      ...(category && { category }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: parseInt(offset),
        take: parseInt(limit),
        orderBy: { soldCount: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

export async function getFeaturedProducts(req, res) {
  try {
    const featured = await prisma.product.findMany({
      where: { featured: true, active: true },
      take: 12,
      orderBy: { updatedAt: 'desc' }
    });

    res.json({ products: featured });
  } catch (error) {
    console.error('Get featured error:', error);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
}

export async function getProductById(req, res) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: {
          select: {
            quantity: true,
            order: {
              select: {
                createdAt: true,
                paymentStatus: true
              }
            }
          },
          take: 10
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Calculate recent sales
    const recentSales = product.orderItems.filter(item =>
      new Date(item.order.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    res.json({
      ...product,
      recentSales
    });
  } catch (error) {
    console.error('Get product detail error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}

export async function syncShopeeProducts(req, res) {
  try {
    const shopee = req.app.locals.shopee;
    if (!shopee) {
      return res.status(500).json({ error: 'Shopee API not configured' });
    }

    // Sync categories
    const categories = ['phụ kiện điện thoại', 'smartwatch', 'pin sạc dự phòng'];
    let syncedCount = 0;

    for (const category of categories) {
      try {
        const shopeeProducts = await shopee.searchProducts(category, 30);

        if (shopeeProducts?.items) {
          for (const item of shopeeProducts.items) {
            await prisma.product.upsert({
              where: { shopeeId: item.product_id },
              create: {
                shopeeId: item.product_id,
                name: item.product_name,
                price: Math.floor(item.price),
                originalPrice: item.price_before_discount ? Math.floor(item.price_before_discount) : null,
                discountPercent: item.discount || 0,
                image: item.product_image || '',
                images: [item.product_image || ''],
                rating: item.rating || 0,
                ratingCount: item.rating_count || 0,
                soldCount: item.sold || 0,
                stock: item.stock || 0,
                shopId: item.shop_id || 0,
                shopName: item.shop_name || 'Unknown',
                category,
                active: true
              },
              update: {
                price: Math.floor(item.price),
                rating: item.rating || 0,
                ratingCount: item.rating_count || 0,
                soldCount: item.sold || 0,
                stock: item.stock || 0,
                updatedAt: new Date()
              }
            });
            syncedCount++;
          }
        }
      } catch (categoryError) {
        console.error(`Error syncing category ${category}:`, categoryError.message);
      }
    }

    res.json({
      success: true,
      syncedCount,
      message: `Synced ${syncedCount} products from Shopee`
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
}
