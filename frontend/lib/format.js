// Vietnamese money formatting. 352350 -> "352.350₫"
const vnd = new Intl.NumberFormat('vi-VN')

export const price = (n) => `${vnd.format(Math.round(n || 0))}₫`

// Category shown as a spec code, uppercase, on the ribbon.
export const catLabel = (c) => (c || 'khác').toUpperCase()

export const API_URL = process.env.NEXT_PUBLIC_API_URL
export const SITE_URL = 'https://deal.milleniumvietnam.com'
