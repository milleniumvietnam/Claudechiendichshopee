const API_URL = process.env.NEXT_PUBLIC_API_URL
const SITE = 'https://claudechiendichshopee.vercel.app'

export async function getServerSideProps({ res }) {
  let products = []
  try {
    const r = await fetch(`${API_URL}/api/products?limit=500`)
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
  res.write(xml)
  res.end()
  return { props: {} }
}

export default function Sitemap() { return null }
