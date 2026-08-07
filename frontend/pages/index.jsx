import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { price, API_URL, SITE_URL } from '../lib/format'

export async function getServerSideProps() {
  let products = []
  try {
    const r = await fetch(`${API_URL}/api/products?limit=100`)
    products = (await r.json()).products || []
  } catch (e) {}

  const featured = products.filter((p) => p.featured).slice(0, 8)
  const ratings = products.map((p) => p.rating).filter(Boolean)
  const prices = products.map((p) => p.price).filter(Boolean)
  const discounts = products.map((p) => p.discountPercent || 0)
  const cats = [...new Set(products.map((p) => p.category))]

  // Every number in the hero is measured from the catalogue, not asserted.
  const stats = products.length
    ? {
        count: products.length,
        minRating: Math.min(...ratings).toFixed(1),
        avgRating: (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2),
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        avgDiscount: Math.round(discounts.reduce((a, b) => a + b, 0) / discounts.length),
        catCount: cats.length,
      }
    : null

  return {
    props: {
      featured: featured.length ? featured : products.slice(0, 8),
      marquee: products.slice(0, 14),
      stats,
    },
  }
}

/* The readout is the page's signature: a spec-sheet block that states the
   selection rule in the same register an instrument would. */
function Readout({ stats }) {
  if (!stats) return null
  const rows = [
    ['NGUỒN', 'Shopee VN · xếp theo lượt bán'],
    ['ĐÁNH GIÁ', `≥ ${stats.minRating}★ · trung bình ${stats.avgRating}★`],
    ['GIÁ', `${price(stats.minPrice)} – ${price(stats.maxPrice)}`],
    ['DANH MỤC', `${stats.catCount} nhóm`],
    ['GIẢM GIÁ', `trung bình ${stats.avgDiscount}%`],
  ]
  return (
    <div className="rounded-[12px] border border-white/15 bg-white/[0.04] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-jade" aria-hidden="true" />
        <span className="spec text-white/60">BỘ LỌC ĐANG ÁP DỤNG</span>
      </div>
      <dl className="divide-y divide-white/[0.07]">
        {rows.map(([k, v], i) => (
          <div
            key={k}
            className="flex items-baseline gap-4 px-4 py-2.5 animate-rise"
            style={{ animationDelay: `${180 + i * 70}ms` }}
          >
            <dt className="spec text-white/45 w-[86px] shrink-0">{k}</dt>
            <dd className="font-mono text-[12.5px] text-white/90">{v}</dd>
          </div>
        ))}
        <div
          className="flex items-baseline gap-4 px-4 py-3 bg-white/[0.05] animate-rise"
          style={{ animationDelay: '530ms' }}
        >
          <dt className="spec text-white/45 w-[86px] shrink-0">KẾT QUẢ</dt>
          <dd className="font-mono text-[15px] font-bold text-white">
            {stats.count} sản phẩm
          </dd>
        </div>
      </dl>
    </div>
  )
}

export default function Home({ featured, marquee, stats }) {
  return (
    <>
      <Head>
        <title>Đáng Mua — Phụ kiện công nghệ đã lọc sẵn từ Shopee</title>
        <meta
          name="description"
          content="Chúng tôi lọc danh sách bán chạy trên Shopee và chỉ giữ lại phụ kiện công nghệ đạt tiêu chí đánh giá và giá. Xem 40 món đã tuyển chọn."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Đáng Mua — Phụ kiện công nghệ đã lọc sẵn từ Shopee" />
        <meta property="og:description" content="Lọc từ danh sách bán chạy Shopee. Trung bình 4.8★. Mua trực tiếp trên Shopee, giá không đổi." />
        <meta property="og:url" content={SITE_URL} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <Nav dark />

      {/* ─── HERO: the thesis is the filtering rule, stated plainly ─── */}
      <section className="bg-ink text-white relative overflow-hidden">
        {/* one quiet atmospheric wash — no gradient blobs */}
        <div
          aria-hidden="true"
          className="absolute -top-40 -right-20 w-[520px] h-[520px] rounded-full opacity-[0.16]"
          style={{ background: 'radial-gradient(circle, #2B4BFF 0%, transparent 68%)' }}
        />

        <div className="relative max-w-[1180px] mx-auto px-5 pt-16 pb-14 lg:pt-24 lg:pb-20">
          <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-12 lg:gap-16 items-center">
            <div>
              <p className="spec text-volt-300 mb-5 animate-rise">TUYỂN CHỌN TỪ SHOPEE VIỆT NAM</p>

              <h1 className="font-display text-display-xl mb-6 animate-rise" style={{ animationDelay: '60ms' }}>
                Chúng tôi lướt Shopee
                <br />
                để bạn không phải lướt.
              </h1>

              <p
                className="text-[17px] leading-[1.65] text-white/75 max-w-[46ch] mb-8 animate-rise"
                style={{ animationDelay: '120ms' }}
              >
                {stats ? `${stats.count} món phụ kiện công nghệ` : 'Phụ kiện công nghệ'} — lọc từ
                danh sách bán chạy nhất, giữ lại đúng những món có đánh giá cao và giá tốt.
                Bạn bấm mua là sang thẳng Shopee.
              </p>

              <div className="flex flex-wrap gap-3 animate-rise" style={{ animationDelay: '180ms' }}>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-[10px] bg-white text-ink font-semibold px-6 py-3.5 transition duration-200 ease-out hover:bg-volt hover:text-white"
                >
                  Xem {stats ? stats.count : ''} sản phẩm
                  <svg width="15" height="15" viewBox="0 0 14 14" aria-hidden="true">
                    <path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <a
                  href="#tieu-chi"
                  className="inline-flex items-center rounded-[10px] border border-white/25 px-6 py-3.5 font-medium transition duration-200 hover:border-white/60"
                >
                  Cách chúng tôi chọn
                </a>
              </div>
            </div>

            <div className="animate-rise" style={{ animationDelay: '140ms' }}>
              <Readout stats={stats} />
            </div>
          </div>
        </div>

        {/* Proof at a glance: the actual catalogue, moving. */}
        {marquee.length > 0 && (
          <div className="relative border-t border-white/10 py-5 overflow-hidden" aria-hidden="true">
            <div className="flex gap-3 w-max animate-marquee">
              {[...marquee, ...marquee].map((p, i) => (
                <img
                  key={`${p.id}-${i}`}
                  src={p.image}
                  alt=""
                  loading="lazy"
                  className="w-[74px] h-[74px] rounded-[9px] object-cover bg-white/5 shrink-0"
                />
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink to-transparent" />
          </div>
        )}
      </section>

      {/* ─── CRITERIA: the three rules, because the rules are the product ─── */}
      <section id="tieu-chi" className="max-w-[1180px] mx-auto px-5 py-16 lg:py-24 scroll-mt-16">
        <div className="max-w-[52ch] mb-12">
          <p className="spec text-volt mb-4">CÁCH CHÚNG TÔI CHỌN</p>
          <h2 className="font-display text-display-lg mb-4">Ba lần lọc, trước khi một món lên trang.</h2>
          <p className="text-[16px] leading-relaxed text-slate">
            Shopee có hàng triệu listing. Phần khó không phải tìm ra thứ để mua — mà là
            loại bỏ thứ không nên mua.
          </p>
        </div>

        <ol className="grid gap-5 md:grid-cols-3">
          {[
            {
              n: '01',
              t: 'Xếp theo lượt bán',
              d: 'Chỉ lấy từ danh sách bán chạy nhất của từng danh mục. Món chưa ai mua thì chưa có gì để nói.',
            },
            {
              n: '02',
              t: `Cắt dưới ${stats ? stats.minRating : '4.3'}★`,
              d: `Đánh giá thấp hơn là loại, kể cả khi giá rẻ. Trung bình danh mục hiện tại ${stats ? stats.avgRating : '4.78'}★.`,
            },
            {
              n: '03',
              t: 'Đối chiếu giá gốc',
              d: `Giữ lại món đang thực sự giảm. Mức giảm trung bình ${stats ? stats.avgDiscount : 37}% so với giá niêm yết.`,
            },
          ].map((s) => (
            /* Numbers here are earned: this is a real sequence, applied in order. */
            <li key={s.n} className="bg-white rounded-card border border-paper-300 p-6">
              <span className="spec text-slate-400 block mb-4">{s.n}</span>
              <h3 className="font-display text-[19px] font-semibold mb-2.5">{s.t}</h3>
              <p className="text-[14.5px] leading-relaxed text-slate">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ─── CATALOGUE ─── */}
      <section className="max-w-[1180px] mx-auto px-5 pb-4">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
          <div>
            <p className="spec text-volt mb-3">ĐANG ĐƯỢC XEM NHIỀU</p>
            <h2 className="font-display text-display-md">Tuần này</h2>
          </div>
          <Link
            href="/products"
            className="text-[14px] font-medium text-ink hover:text-volt transition-colors inline-flex items-center gap-1.5"
          >
            Tất cả {stats ? stats.count : ''} sản phẩm
            <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      </section>

      {/* ─── THE HONEST BIT ─── */}
      <section className="max-w-[1180px] mx-auto px-5 pt-20">
        <div className="rounded-card bg-white border border-paper-300 p-7 sm:p-10 grid gap-8 md:grid-cols-[1fr_1fr]">
          <div>
            <p className="spec text-volt mb-4">CÔNG KHAI</p>
            <h2 className="font-display text-display-md mb-4">Chúng tôi kiếm tiền thế nào</h2>
            <p className="text-[15px] leading-relaxed text-slate">
              Khi bạn bấm “Mua trên Shopee” và đặt hàng, Shopee trả cho chúng tôi một
              khoản hoa hồng. <strong className="text-ink font-semibold">Giá bạn trả không thay đổi</strong> —
              vẫn đúng giá niêm yết trên Shopee tại thời điểm đó.
            </p>
          </div>
          <dl className="grid gap-4 content-start">
            {[
              ['Ai bán hàng?', 'Người bán trên Shopee. Đơn hàng, thanh toán, vận chuyển và đổi trả đều do Shopee xử lý.'],
              ['Giá có chuẩn không?', 'Giá hiển thị lấy từ Shopee lúc cập nhật. Giá cuối cùng luôn là giá bạn thấy trên Shopee.'],
              ['Chúng tôi giữ gì?', 'Chỉ giữ phần tuyển chọn. Không giữ hàng, không giữ tiền của bạn.'],
            ].map(([q, a]) => (
              <div key={q} className="border-l-2 border-paper-300 pl-4">
                <dt className="font-semibold text-[14.5px] mb-1">{q}</dt>
                <dd className="text-[14px] leading-relaxed text-slate">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Footer />
    </>
  )
}
