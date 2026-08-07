import Link from 'next/link'
import { useRouter } from 'next/router'

const links = [
  { href: '/products', label: 'Sản phẩm' },
  { href: '/#tieu-chi', label: 'Cách chọn' },
]

export default function Nav({ dark = false }) {
  const { pathname } = useRouter()
  const base = dark
    ? 'bg-ink/85 text-white border-white/10'
    : 'bg-paper/85 text-ink border-paper-300'

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${base}`}>
      <nav
        aria-label="Điều hướng chính"
        className="max-w-[1180px] mx-auto px-5 h-[60px] flex items-center justify-between gap-6"
      >
        <Link href="/" className="group flex items-center gap-2.5 shrink-0">
          {/* Mark: a filter funnel — the site's actual job is filtering. */}
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" className="shrink-0">
            <path
              d="M2.5 3.5h15L12 10.2v5.1l-4 2.2v-7.3L2.5 3.5Z"
              fill="none"
              stroke={dark ? '#fff' : '#0A0F1C'}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-display font-bold text-[15px] tracking-[-0.02em]">
            Đáng Mua
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-5">
          {links.map((l) => {
            const active = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`text-[14px] px-2.5 py-1.5 rounded-md transition-colors duration-200 ${
                  active
                    ? dark ? 'text-white' : 'text-ink font-semibold'
                    : dark ? 'text-white/70 hover:text-white' : 'text-slate hover:text-ink'
                }`}
              >
                {l.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
