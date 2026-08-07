import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProductCard from '../../components/ProductCard'
import { price, catLabel, API_URL, SITE_URL } from '../../lib/format'

export async function getServerSideProps({ params }) {
  try {
    const [pRes, allRes] = await Promise.all([
      fetch(`${API_URL}/api/products/${params.id}`),
      fetch(`${API_URL}/api/products?limit=100`),
    ])
    if (!pRes.ok) return { notFound: true }
    const product = await pRes.json()
    const all = (await allRes.json()).products || []
    const related = all
      .filter((x) => x.category === product.category && x.id !== product.id)
      .slice(0, 4)
    return { props: { product, related } }
  } catch (e) {
    return { notFound: true }
  }
}

export default function ProductDetail({ product: p, related }) {
  const [copied, setCopied] = useState(false)
  const pageUrl = `${SITE_URL}/products/${p.id}`
  const buyUrl = `${API_URL}/api/go/${p.id}`
  const off = p.discountPercent > 0 && p.originalPrice > p.price
  const saved = off ? p.originalPrice - p.price : 0

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch (e) {}
  }

  return (
    <>
      <Head>
        <title>{`${p.name} — ${price(p.price)} | Đáng Mua`}</title>
        <meta name="description" content={`${p.name} — ${price(p.price)}${off ? `, giảm ${p.discountPercent}% từ ${price(p.originalPrice)}` : ''}. Đánh giá ${p.rating}★ trên Shopee.`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={p.name} />
        <meta property="og:description" content={`${price(p.price)}${off ? ` · giảm ${p.discountPercent}%` : ''} · ${p.rating}★`} />
        <meta property="og:image" content={p.image} />
        <meta property="og:url" content={pageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <Nav />

      <div className="max-w-[1180px] mx-auto px-5 pt-5">
        <Link href="/products" className="spec text-slate hover:text-ink transition-colors inline-flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M12 7H2M6 3L2 7l4 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          TẤT CẢ SẢN PHẨM
        </Link>
      </div>

      <article className="max-w-[1180px] mx-auto px-5 pt-6 pb-4 grid lg:grid-cols-2 gap-8 lg:gap-14">
        <div className="relative rounded-card overflow-hidden bg-paper-200 border border-paper-300 aspect-square">
          {p.image ? (
            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
          ) : (
            <span className="absolute inset-0 grid place-items-center spec">KHÔNG CÓ ẢNH</span>
          )}
          {off && (
            <span className="absolute top-3.5 left-3.5 spec-chip bg-ember text-white font-bold text-[12px] px-2.5 py-1.5">
              −{p.discountPercent}%
            </span>
          )}
        </div>

        <div className="lg:py-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="spec text-ink font-medium">★ {p.rating?.toFixed(1)}</span>
            <span aria-hidden="true" className="text-slate-200">·</span>
            <span className="spec">{catLabel(p.category)}</span>
          </div>

          <h1 className="font-display text-display-md leading-[1.15] mb-6">{p.name}</h1>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
            <span className="font-mono font-bold text-[34px] tracking-[-0.03em]">{price(p.price)}</span>
            {off && (
              <span className="font-mono text-[16px] text-slate-400 line-through">{price(p.originalPrice)}</span>
            )}
          </div>
          {off && (
            <p className="text-[14px] text-jade font-medium mb-7">Rẻ hơn {price(saved)} so với giá niêm yết</p>
          )}
          {!off && <div className="mb-7" />}

          <a
            href={buyUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="btn-buy text-[16px] py-4 mb-3"
          >
            Mua trên Shopee
            <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M3 11L11 3M11 3H5M11 3v6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <p className="text-[13px] text-slate text-center mb-8">
            Mở Shopee ở tab mới · giá không đổi
          </p>

          {/* What actually happens next — removes the last hesitation. */}
          <dl className="rounded-[12px] border border-paper-300 bg-white divide-y divide-paper-300 mb-6">
            {[
              ['Người bán', 'Shop trên Shopee'],
              ['Thanh toán & vận chuyển', 'Shopee xử lý'],
              ['Đổi trả', 'Theo chính sách Shopee'],
              ['Giá cuối cùng', 'Giá hiển thị trên Shopee'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="spec">{k.toUpperCase()}</dt>
                <dd className="text-[13.5px] font-medium text-right">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="flex items-center gap-2.5">
            <span className="spec shrink-0">CHIA SẺ</span>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="h-9 px-3.5 rounded-lg border border-paper-300 bg-white text-[13px] font-medium hover:border-slate-200 transition-colors inline-flex items-center"
            >Facebook</a>
            <a
              href={`https://zalo.me/share?url=${encodeURIComponent(pageUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="h-9 px-3.5 rounded-lg border border-paper-300 bg-white text-[13px] font-medium hover:border-slate-200 transition-colors inline-flex items-center"
            >Zalo</a>
            <button
              onClick={copy}
              className="h-9 px-3.5 rounded-lg border border-paper-300 bg-white text-[13px] font-medium hover:border-slate-200 transition-colors cursor-pointer"
            >
              {copied ? 'Đã chép link' : 'Chép link'}
            </button>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="max-w-[1180px] mx-auto px-5 pt-14">
          <h2 className="font-display text-display-md mb-6">Cùng nhóm {p.category}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {related.map((r) => <ProductCard key={r.id} product={r} />)}
          </div>
        </section>
      )}

      {/* On a phone the buy action follows you down the page. */}
      <div className="lg:hidden sticky bottom-0 z-40 mt-14 bg-paper/95 backdrop-blur-md border-t border-paper-300 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="font-mono font-bold text-[17px] leading-none">{price(p.price)}</p>
            {off && <p className="spec text-jade mt-1">−{p.discountPercent}%</p>}
          </div>
          <a
            href={buyUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="btn-buy flex-1 py-3.5 text-[15px]"
          >
            Mua trên Shopee
          </a>
        </div>
      </div>

      <Footer />
    </>
  )
}
