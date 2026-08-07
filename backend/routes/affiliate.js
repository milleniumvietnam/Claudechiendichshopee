// Affiliate Routes — click tracking + redirect to Shopee/TikTok affiliate links
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

function hashIp(ip) {
  if (!ip) return null
  return crypto.createHash('sha256').update(String(ip)).digest('hex').slice(0, 16)
}

// GET /api/go/:productId — record click, then 302 redirect to the affiliate URL.
// This is the link the "Mua trên Shopee" button points to, so you get your own
// click analytics before handing the visitor to Shopee.
export async function goToAffiliate(req, res) {
  try {
    const { productId } = req.params

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, affiliateUrl: true, shopeeId: true, active: true }
    })

    if (!product || !product.active || !product.affiliateUrl) {
      // No affiliate link configured — send them to the storefront instead of a dead end
      const fallback = process.env.FRONTEND_URL || '/'
      return res.redirect(302, fallback)
    }

    // Build the final destination in two steps.
    //
    // Step 1 — device-aware Shopee URL. Most Vietnamese shoppers are logged into
    // the Shopee APP, not the mobile-web site, so a plain shopee.vn link lands
    // them on a logged-out browser page. Shopee's own /universal-link/ path
    // opens the app when installed; deep_and_web=1 falls back to mobile web
    // when it isn't. Desktop keeps the plain product URL.
    let destination = product.affiliateUrl
    const ua = req.get('user-agent') || ''
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua)
    const productMatch = product.affiliateUrl.match(
      /^https?:\/\/(?:www\.)?shopee\.vn\/product\/(\d+)\/(\d+)/
    )
    if (isMobile && productMatch) {
      const [, shopId, itemId] = productMatch
      destination = `https://shopee.vn/universal-link/product/${shopId}/${itemId}?deep_and_web=1`
    }

    // Step 2 — commission wrap. If AFFILIATE_DEEP_LINK_ID is set (AccessTrade
    // campaign approved), wrap whatever Shopee URL we chose in the affiliate
    // deep-link so the click earns commission. If NOT set, go straight to
    // Shopee — links must never 404 while approval is pending.
    const deepId = process.env.AFFILIATE_DEEP_LINK_ID
    const isDirectShopee = /^https?:\/\/(www\.)?shopee\.vn\//.test(destination)
    if (deepId && isDirectShopee) {
      destination = `https://go.isclix.com/deep_link/${deepId}/?url=${encodeURIComponent(destination)}&sub1=${product.shopeeId}&sub4=oneatweb`
    }

    // Fire-and-forget analytics (don't block the redirect on DB write)
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress
    prisma.$transaction([
      prisma.product.update({
        where: { id: product.id },
        data: { clickCount: { increment: 1 } }
      }),
      prisma.affiliateClick.create({
        data: {
          productId: product.id,
          source: req.query.src || req.get('referer') || null,
          userAgent: req.get('user-agent')?.slice(0, 255) || null,
          ipHash: hashIp(ip)
        }
      })
    ]).catch(err => console.error('Click tracking failed:', err.message))

    return res.redirect(302, destination)
  } catch (error) {
    console.error('Affiliate redirect error:', error)
    return res.redirect(302, process.env.FRONTEND_URL || '/')
  }
}

// PATCH /api/products/:id/affiliate — set/update a product's affiliate link (admin)
export async function setAffiliate(req, res) {
  try {
    const { id } = req.params
    const { affiliateUrl, affiliateSource, commissionPct } = req.body

    const product = await prisma.product.update({
      where: { id },
      data: {
        affiliateUrl: affiliateUrl ?? undefined,
        affiliateSource: affiliateSource ?? undefined,
        commissionPct: commissionPct ?? undefined
      }
    })

    res.json({ success: true, product })
  } catch (error) {
    console.error('Set affiliate error:', error)
    res.status(500).json({ error: 'Failed to set affiliate link' })
  }
}

// GET /api/admin/affiliate-stats — click leaderboard + totals
export async function affiliateStats(req, res) {
  try {
    const [products, totalClicks] = await Promise.all([
      prisma.product.findMany({
        where: { affiliateUrl: { not: null } },
        select: {
          id: true, name: true, category: true, affiliateSource: true,
          commissionPct: true, price: true, clickCount: true
        },
        orderBy: { clickCount: 'desc' },
        take: 50
      }),
      prisma.affiliateClick.count()
    ])

    // Rough estimated commission if a modest 2% of clicks convert
    const estimatedRevenue = products.reduce((sum, p) => {
      const conv = 0.02
      const commission = (p.commissionPct ?? 5) / 100
      return sum + Math.round(p.clickCount * conv * p.price * commission)
    }, 0)

    res.json({
      totalClicks,
      productsWithAffiliate: products.length,
      estimatedMonthlyCommission: estimatedRevenue,
      note: 'Estimate assumes ~2% click→purchase conversion. Real numbers come from the Shopee/AccessTrade dashboard.',
      leaderboard: products
    })
  } catch (error) {
    console.error('Affiliate stats error:', error)
    res.status(500).json({ error: 'Failed to fetch affiliate stats' })
  }
}
