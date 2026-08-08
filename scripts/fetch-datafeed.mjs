// Kéo datafeed sản phẩm từ API chính thức của AccessTrade.
//
// Cách chạy (key đọc từ biến môi trường, KHÔNG viết vào file, KHÔNG commit):
//
//   ACCESSTRADE_API_KEY='...' node scripts/fetch-datafeed.mjs
//
// Lấy key ở: pub2.accesstrade.vn -> Tool -> API key
//
// Kết quả ghi ra scripts/datafeed-raw.json để bước sau lọc và đưa vào kho.
// Script chỉ ĐỌC, không thay đổi gì trên tài khoản AccessTrade.

import { writeFileSync } from 'node:fs'

const KEY = process.env.ACCESSTRADE_API_KEY
if (!KEY) {
  console.error('❌ Thiếu ACCESSTRADE_API_KEY.\n')
  console.error("   Chạy:  ACCESSTRADE_API_KEY='dán_key_vào_đây' node scripts/fetch-datafeed.mjs")
  process.exit(1)
}

const BASE = 'https://api.accesstrade.vn/v1'
const H = { Authorization: `Token ${KEY}`, 'Content-Type': 'application/json' }

// Không bao giờ in key ra, kể cả khi API trả lỗi có kèm key trong thông báo.
const scrub = (s) => String(s).split(KEY).join('***')

async function get(path) {
  try {
    const res = await fetch(`${BASE}${path}`, { headers: H })
    const text = await res.text()
    let json = null
    try { json = JSON.parse(text) } catch {}
    return { ok: res.ok, status: res.status, json, text: scrub(text).slice(0, 300) }
  } catch (e) {
    return { ok: false, status: 0, json: null, text: scrub(e.message) }
  }
}

console.log('Đang dò các endpoint AccessTrade...\n')

// Bước 1: xác nhận key dùng được và xem có những chiến dịch nào
const camp = await get('/campaigns?limit=50')
console.log(`  /campaigns          → HTTP ${camp.status}`)
if (!camp.ok) {
  console.error('\n❌ Key không dùng được hoặc endpoint đổi. Phản hồi:\n  ' + camp.text)
  process.exit(1)
}

const campaigns = camp.json?.data || []
console.log(`     ${campaigns.length} chiến dịch khả dụng`)
for (const c of campaigns.slice(0, 40)) {
  const name = c.name || c.campaign_name || '?'
  const id = c.campaign_id || c.id || '?'
  const status = c.approval ?? c.status ?? '?'
  console.log(`     - ${String(name).slice(0, 46).padEnd(46)} id=${id} trạng thái=${status}`)
}

// Bước 2: datafeed sản phẩm. Thử vài dạng tham số vì tài liệu từng đổi.
const tikTok = campaigns.find((c) => /tiktok/i.test(c.name || c.campaign_name || ''))
const attempts = [
  '/datafeeds?limit=20',
  tikTok ? `/datafeeds?campaign_id=${tikTok.campaign_id || tikTok.id}&limit=20` : null,
  '/datafeeds?merchant=tiktokshop&limit=20',
  '/product_link?limit=20',
  '/top_products?limit=20',
].filter(Boolean)

let feed = null
for (const path of attempts) {
  const r = await get(path)
  const n = (r.json?.data || []).length
  console.log(`  ${path.split('?')[0].padEnd(20)} → HTTP ${r.status}, ${n} sản phẩm`)
  if (r.ok && n > 0) { feed = { path, data: r.json.data }; break }
  await new Promise((s) => setTimeout(s, 600))
}

if (!feed) {
  console.error('\n❌ Không endpoint nào trả về sản phẩm. Có thể datafeed chỉ mở sau khi chiến dịch được duyệt.')
  process.exit(2)
}

writeFileSync(
  new URL('./datafeed-raw.json', import.meta.url),
  JSON.stringify(feed.data, null, 1),
  'utf-8'
)

const p = feed.data[0]
console.log(`\n✅ Lấy được ${feed.data.length} sản phẩm từ ${feed.path.split('?')[0]}`)
console.log(`   Đã ghi: scripts/datafeed-raw.json`)
console.log(`   Các trường có sẵn: ${Object.keys(p).join(', ')}`)
console.log(`   Mẫu: ${String(p.name || p.product_name || '?').slice(0, 60)}`)
console.log(`        giá=${p.price ?? '?'}  ảnh=${p.image ? 'có' : 'không'}  link=${p.aff_link || p.url_link ? 'có' : 'không'}`)
