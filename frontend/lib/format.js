// Vietnamese money formatting. 352350 -> "352.350₫"
const vnd = new Intl.NumberFormat('vi-VN')

export const price = (n) => `${vnd.format(Math.round(n || 0))}₫`

// Plain grouped number: follower counts, review counts.
export const num = (n) => vnd.format(Math.round(n || 0))

// Multi-variant items carry a range: the cheapest variant is what we lead with,
// but calling it a flat price would misstate what the buyer will pay.
export const priceLabel = (p) =>
  p?.priceMax && p.priceMax > p.price ? `từ ${price(p.price)}` : price(p.price)

// Category shown as a spec code, uppercase, on the ribbon.
export const catLabel = (c) => (c || 'khác').toUpperCase()

// Review counts are the one popularity signal Shopee still discloses.
export const reviews = (n) => `${vnd.format(n || 0)} đánh giá`

/**
 * The shop's standing, said plainly. Shopee's own flags, in descending strength:
 * an official store outranks a verified seller. Returns null when the shop
 * carries neither, because an empty badge slot is more honest than a filler one.
 */
export const shopBadge = (p) => {
  if (p?.shopOfficial) return { text: 'CHÍNH HÃNG', tone: 'official' }
  if (p?.shopVerified) return { text: 'ĐÃ XÁC MINH', tone: 'verified' }
  return null
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL
export const SITE_URL = 'https://deal.milleniumvietnam.com'
