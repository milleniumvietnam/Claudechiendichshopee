import Link from 'next/link'
import { TIKTOK_DEAL_URL } from '../lib/format'

export default function Footer() {
  return (
    <footer className="bg-ink text-white/70 mt-24">
      <div className="max-w-[1180px] mx-auto px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-3">
          <div className="sm:col-span-2 max-w-md">
            <p className="font-display font-bold text-white text-[17px] mb-2.5">Đáng Mua</p>
            <p className="text-[14px] leading-relaxed">
              Chúng tôi lọc sản phẩm bán chạy trên Shopee và chỉ giữ lại những món
              đạt tiêu chí về đánh giá và giá. Bạn mua trực tiếp trên Shopee — giá
              không đổi vì có chúng tôi ở giữa.
            </p>
          </div>
          <div>
            <p className="spec text-white/50 mb-3">Liên hệ</p>
            <ul className="space-y-2 text-[14px]">
              <li><a href="tel:+84355554250" className="hover:text-white transition-colors">035 555 4250</a></li>
              <li><a href="mailto:milleniumvietnam@gmail.com" className="hover:text-white transition-colors break-all">milleniumvietnam@gmail.com</a></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Tất cả sản phẩm</Link></li>
              <li>
                <a
                  href={TIKTOK_DEAL_URL}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="hover:text-white transition-colors"
                >
                  Săn deal TikTok Shop ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="spec text-white/40">© 2026 MILLENIUM VIỆT NAM</p>
          {/* Disclosure sits in the footer where regulators and readers expect it. */}
          <p className="text-[12px] text-white/40 max-w-md sm:text-right">
            Trang có sử dụng liên kết tiếp thị. Khi bạn mua qua liên kết, chúng tôi
            nhận hoa hồng từ Shopee hoặc TikTok Shop — bạn không trả thêm đồng nào.
          </p>
        </div>
      </div>
    </footer>
  )
}
