// Admin Routes — protected by ADMIN_KEY (x-admin-key header).
// If ADMIN_KEY is not set in the environment, the guard is open (dev/bootstrap).
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_KEY
  if (!expected) return next() // not configured yet → allow (bootstrap)
  const provided = req.get('x-admin-key') || req.query.key
  if (provided === expected) return next()
  return res.status(401).json({ error: 'Unauthorized — invalid admin key' })
}

// POST /api/admin/import-products — bulk upsert products (by shopeeId)
export async function importProducts(req, res) {
  try {
    const items = Array.isArray(req.body) ? req.body : req.body?.products
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Body must be an array of products (or {products:[...]})' })
    }

    let created = 0, updated = 0
    for (const it of items) {
      if (!it.shopeeId || !it.name) continue
      const data = {
        shopeeId: Number(it.shopeeId),
        name: String(it.name).slice(0, 300),
        description: it.description ? String(it.description).slice(0, 2000) : null,
        price: Math.round(it.price || 0),
        originalPrice: it.originalPrice ? Math.round(it.originalPrice) : null,
        discountPercent: it.discountPercent ? Math.round(it.discountPercent) : null,
        image: it.image || '',
        images: it.images && it.images.length ? it.images : (it.image ? [it.image] : []),
        rating: Number(it.rating || 0),
        ratingCount: Math.round(it.ratingCount || 0),
        soldCount: Math.round(it.soldCount || 0),
        stock: Math.round(it.stock || 0),
        shopId: Math.round(it.shopId || 0),
        shopName: it.shopName || 'Shopee',
        sellerLocation: it.sellerLocation || null,
        category: it.category || 'khác',
        featured: !!it.featured,
        active: it.active !== false,
        affiliateUrl: it.affiliateUrl || null,
        affiliateSource: it.affiliateSource || 'shopee',
        commissionPct: it.commissionPct != null ? Number(it.commissionPct) : 5
      }
      const existing = await prisma.product.findUnique({ where: { shopeeId: data.shopeeId }, select: { id: true } })
      await prisma.product.upsert({
        where: { shopeeId: data.shopeeId },
        create: data,
        update: {
          price: data.price, originalPrice: data.originalPrice, discountPercent: data.discountPercent,
          rating: data.rating, ratingCount: data.ratingCount, soldCount: data.soldCount,
          stock: data.stock, image: data.image, images: data.images,
          affiliateUrl: data.affiliateUrl, affiliateSource: data.affiliateSource, commissionPct: data.commissionPct
        }
      })
      existing ? updated++ : created++
    }

    res.json({ success: true, created, updated, total: created + updated })
  } catch (error) {
    console.error('Import error:', error)
    res.status(500).json({ error: error.message || 'Import failed' })
  }
}
