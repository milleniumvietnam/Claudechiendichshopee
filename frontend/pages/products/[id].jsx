import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const SITE_URL = 'https://deal.milleniumvietnam.com'

export async function getServerSideProps({ params }) {
  try {
    const res = await fetch(`${API_URL}/api/products/${params.id}`)
    if (!res.ok) return { notFound: true }
    const product = await res.json()
    return { props: { product } }
  } catch (e) {
    return { notFound: true }
  }
}

export default function ProductDetail({ product }) {
  const [copied, setCopied] = useState(false)
  const pageUrl = `${SITE_URL}/products/${product.id}`
  const buyUrl = `${API_URL}/api/go/${product.id}`
  const priceK = (n) => `${Math.round(n / 1000)}K`
  const shareText = `${product.name} chỉ ${priceK(product.price)} — xem ngay!`

  const fbShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`
  const zaloShare = `https://zalo.me/share?url=${encodeURIComponent(pageUrl)}`

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(pageUrl); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch {}
  }

  return (
    <>
      <Head>
        <title>{product.name} — {priceK(product.price)} | Kinh Doanh Shopee</title>
        <meta name="description" content={(product.description || product.name).slice(0, 155)} />
        {/* Open Graph — so FB/Zalo shares show the image + title */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={`Chỉ ${priceK(product.price)}${product.originalPrice > product.price ? ` (giảm từ ${priceK(product.originalPrice)})` : ''} · ⭐ ${product.rating}`} />
        <meta property="og:image" content={product.image} />
        <meta property="og:url" content={pageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.name} />
        <meta name="twitter:image" content={product.image} />
      </Head>

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl text-luxury-800">Kinh Doanh Shopee</Link>
          <Link href="/products" className="text-sm text-gray-600 hover:text-luxury-700">← Tất cả sản phẩm</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Image */}
          <div className="bg-gray-50 rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
            {product.image
              ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              : <span className="text-gray-400">No image</span>}
          </div>

          {/* Info */}
          <div>
            <p className="text-sm text-luxury-600 font-medium mb-2 uppercase tracking-wide">{product.category}</p>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-luxury-900 mb-4 leading-snug">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-yellow-500">★ {product.rating?.toFixed(1)}</span>
              {product.clickCount > 0 && <span className="text-sm text-gray-500">· {product.clickCount} lượt quan tâm</span>}
            </div>

            <div className="flex items-end gap-3 mb-6">
              <span className="text-4xl font-bold text-luxury-700">{priceK(product.price)}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through mb-1">{priceK(product.originalPrice)}</span>
                  {product.discountPercent > 0 && (
                    <span className="mb-1.5 px-2 py-0.5 bg-red-100 text-red-600 text-sm font-semibold rounded">-{product.discountPercent}%</span>
                  )}
                </>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
            )}

            {/* Primary CTA */}
            {product.affiliateUrl && (
              <a
                href={buyUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block text-center px-8 py-4 bg-luxury-700 text-white text-lg font-semibold rounded-xl hover:bg-luxury-800 transition-colors shadow-luxury mb-4"
              >
                Mua trên Shopee →
              </a>
            )}

            {/* Trust */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600 mb-8">
              <div className="bg-luxury-50 rounded-lg py-3"><div className="text-lg">✓</div>Hàng chính hãng</div>
              <div className="bg-luxury-50 rounded-lg py-3"><div className="text-lg">🚚</div>Giao toàn quốc</div>
              <div className="bg-luxury-50 rounded-lg py-3"><div className="text-lg">🛡️</div>Đổi trả Shopee</div>
            </div>

            {/* Share */}
            <div className="border-t border-gray-100 pt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Chia sẻ cho bạn bè:</p>
              <div className="flex flex-wrap gap-3">
                <a href={fbShare} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#1877F2] text-white text-sm font-medium rounded-lg hover:opacity-90">Facebook</a>
                <a href={zaloShare} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#0068FF] text-white text-sm font-medium rounded-lg hover:opacity-90">Zalo</a>
                <button onClick={copyLink}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
                  {copied ? '✓ Đã copy' : 'Copy link'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/products" className="text-luxury-700 font-medium hover:underline">← Xem thêm sản phẩm khác</Link>
        </div>
      </div>
    </>
  )
}
