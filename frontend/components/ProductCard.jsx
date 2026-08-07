import Link from 'next/link'
import { price, priceLabel, catLabel, reviews, shopBadge, API_URL } from '../lib/format'

/**
 * SIGNATURE: the spec ribbon.
 * A monospace strip under every product that reads like an instrument spec
 * line. It prints only values we actually hold.
 *
 * The ribbon now leads with rating AND review count, because a star average
 * with no sample size behind it is the weakest claim on a sales page. Sold
 * counts stay off the card: Shopee stopped disclosing them, so we have none.
 */
export default function ProductCard({ product: p, priority = false }) {
  const off = p.discountPercent > 0 && p.originalPrice > p.price
  const badge = shopBadge(p)

  return (
    <article className="group flex flex-col bg-white rounded-card border border-paper-300 shadow-card hover:shadow-lift hover:border-slate-200 transition-[box-shadow,border-color,transform] duration-300 ease-out hover:-translate-y-[3px]">
      <Link
        href={`/products/${p.id}`}
        className="block relative rounded-t-card overflow-hidden bg-paper-200 aspect-square"
      >
        {p.image ? (
          <img
            src={p.image}
            alt={p.name}
            loading={priority ? 'eager' : 'lazy'}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center spec">KHÔNG CÓ ẢNH</span>
        )}

        {off && (
          <span className="absolute top-2.5 left-2.5 spec-chip bg-ember text-white font-bold">
            −{p.discountPercent}%
          </span>
        )}
      </Link>

      <div className="flex flex-col flex-1 p-3.5 pt-3">
        {/* spec ribbon — rating and its sample size never break across lines */}
        <div className="flex items-center gap-2 mb-2 min-w-0">
          <span className="spec text-ink font-medium whitespace-nowrap shrink-0">
            ★ {p.rating?.toFixed(1)}
          </span>
          <span aria-hidden="true" className="text-slate-200 shrink-0">·</span>
          <span className="spec truncate min-w-0">
            {p.ratingCount > 0 ? reviews(p.ratingCount) : catLabel(p.category)}
          </span>
        </div>

        <h3 className="text-[14px] leading-[1.4] font-medium mb-2.5 line-clamp-2 min-h-[2.8em]">
          <Link href={`/products/${p.id}`} className="hover:text-volt transition-colors duration-200">
            {p.name}
          </Link>
        </h3>

        {/* who is actually shipping this — the question a cautious buyer asks next */}
        {p.shopName && (
          <div className="flex items-center gap-1.5 mb-3 min-w-0">
            {badge && (
              <span
                className={`spec-chip shrink-0 font-semibold ${
                  badge.tone === 'official' ? 'bg-jade-100 text-jade' : 'bg-paper-200 text-slate'
                }`}
              >
                {badge.text}
              </span>
            )}
            <span className="spec truncate min-w-0 normal-case">{p.shopName}</span>
          </div>
        )}

        <div className="mt-auto">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-3">
            <span className="font-mono font-bold text-[18px] sm:text-[19px] tracking-[-0.02em]">
              {priceLabel(p)}
            </span>
            {off && (
              <span className="font-mono text-[12px] text-slate-400 line-through">
                {price(p.originalPrice)}
              </span>
            )}
          </div>

          {p.affiliateUrl && (
            <a
              href={`${API_URL}/api/go/${p.id}`}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="btn-buy text-[13.5px] sm:text-[14px] py-3 px-3 whitespace-nowrap"
            >
              Mua trên Shopee
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M3 11L11 3M11 3H5M11 3v6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
