import { useState, useMemo } from 'react'
import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { API_URL, SITE_URL } from '../lib/format'

export async function getServerSideProps() {
  let products = []
  try {
    const r = await fetch(`${API_URL}/api/products?limit=200`)
    products = (await r.json()).products || []
  } catch (e) {}
  return { props: { products } }
}

const SORTS = [
  { id: 'discount', label: 'Giảm nhiều nhất' },
  { id: 'rating', label: 'Đánh giá cao' },
  { id: 'low', label: 'Giá thấp → cao' },
  { id: 'high', label: 'Giá cao → thấp' },
]

export default function Products({ products }) {
  const [cat, setCat] = useState('')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('discount')

  const cats = useMemo(
    () => [...new Set(products.map((p) => p.category))].filter(Boolean),
    [products]
  )

  // 40 items fit in memory, so filtering happens in the browser: no spinner,
  // no round-trip, results change on the same frame as the click.
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let out = products.filter(
      (p) =>
        (!cat || p.category === cat) &&
        (!needle || p.name.toLowerCase().includes(needle))
    )
    const by = {
      discount: (a, b) => (b.discountPercent || 0) - (a.discountPercent || 0),
      rating: (a, b) => b.rating - a.rating,
      low: (a, b) => a.price - b.price,
      high: (a, b) => b.price - a.price,
    }
    return [...out].sort(by[sort])
  }, [products, cat, q, sort])

  return (
    <>
      <Head>
        <title>Tất cả sản phẩm — Đáng Mua</title>
        <meta
          name="description"
          content="Toàn bộ phụ kiện công nghệ đã tuyển chọn: tai nghe, sạc dự phòng, sạc nhanh, đèn LED, chuột gaming. Lọc từ danh sách bán chạy Shopee."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Tất cả sản phẩm — Đáng Mua" />
        <meta property="og:url" content={`${SITE_URL}/products`} />
      </Head>

      <Nav />

      <div className="max-w-[1180px] mx-auto px-5 pt-10 pb-6">
        <p className="spec text-volt mb-3">DANH MỤC ĐẦY ĐỦ</p>
        <h1 className="font-display text-display-lg mb-3">
          {products.length} món đã qua bộ lọc
        </h1>
        <p className="text-[15.5px] text-slate max-w-[54ch]">
          Mọi món ở đây đều lấy từ danh sách bán chạy của Shopee và đạt ngưỡng đánh giá.
          Bấm vào tên để xem chi tiết, hoặc mua thẳng.
        </p>
      </div>

      {/* Controls stay sticky: on a phone the filter shouldn't scroll away. */}
      <div className="sticky top-[60px] z-40 bg-paper/92 backdrop-blur-md border-y border-paper-300">
        <div className="max-w-[1180px] mx-auto px-5 py-3 flex flex-col gap-3">
          <div className="flex gap-2.5">
            <div className="relative flex-1">
              <svg
                width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <label htmlFor="q" className="sr-only">Tìm sản phẩm</label>
              <input
                id="q"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm tai nghe, sạc dự phòng…"
                className="w-full h-11 pl-10 pr-3 rounded-[10px] bg-white border border-paper-300 text-[14.5px] placeholder:text-slate-400 focus:border-volt outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="sort" className="sr-only">Sắp xếp</label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-11 px-3 pr-8 rounded-[10px] bg-white border border-paper-300 text-[14px] font-medium outline-none focus:border-volt cursor-pointer"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterChip active={cat === ''} onClick={() => setCat('')}>
              Tất cả ({products.length})
            </FilterChip>
            {cats.map((c) => (
              <FilterChip key={c} active={cat === c} onClick={() => setCat(c)}>
                {c} ({products.filter((p) => p.category === c).length})
              </FilterChip>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto px-5 py-7">
        <p className="spec mb-5" role="status" aria-live="polite">
          {shown.length} KẾT QUẢ
        </p>

        {shown.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {shown.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        ) : (
          /* An empty screen is an invitation to act, not an apology. */
          <div className="py-20 text-center">
            <p className="font-display text-[20px] font-semibold mb-2">
              Không có món nào khớp “{q}”.
            </p>
            <p className="text-[14.5px] text-slate mb-6">Thử từ khoá ngắn hơn, hoặc xem toàn bộ danh mục.</p>
            <button
              onClick={() => { setQ(''); setCat('') }}
              className="inline-flex items-center rounded-[10px] bg-ink text-white font-semibold px-5 py-3 hover:bg-volt transition-colors duration-200 cursor-pointer"
            >
              Xoá bộ lọc
            </button>
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 h-9 px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap capitalize transition-colors duration-200 cursor-pointer border ${
        active
          ? 'bg-ink text-white border-ink'
          : 'bg-white text-slate border-paper-300 hover:border-slate-200 hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}
