const API_URL = process.env.NEXT_PUBLIC_API_URL
const SITE = 'https://deal.milleniumvietnam.com'

// Stays server-rendered: only crawlers fetch it, so a cold backend costs a
// customer nothing here. The timeout and cache header keep it from hanging.
export async function getServerSideProps({ res }) {
  let products = []
  try {
    const r = await fetch(`${API_URL}/api/products?limit=500`, {
      signal: AbortSignal.timeout(45000),
    })
    products = (await r.json()).products || []
  } catch (e) { /* keep static urls if backend down */ }

  const staticUrls = [`${SITE}/`, `${SITE}/products`]
  const productUrls = products.map((p) => `${SITE}/products/${p.id}`)
  const urls = [...staticUrls, ...productUrls]

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u}</loc><changefreq>daily</changefreq></url>`).join('\n') +
    `\n</urlset>`

  res.setHeader('Content-Type', 'text/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.write(xml)
  res.end()
  return { props: {} }
}

export default function Sitemap() { return null }
