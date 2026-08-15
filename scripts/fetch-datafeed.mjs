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

// Bước 2: quét datafeed qua nhiều trang để biết CÓ NHỮNG MERCHANT NÀO.
// Lần chạy đầu chỉ lấy 20 dòng và trúng toàn 30shine — không đủ để kết luận
// TikTok Shop có datafeed hay không.
console.log('\nĐang quét datafeed để liệt kê merchant...')

const all = []
const merchants = new Map()
for (let page = 1; page <= 25; page++) {
  const r = await get(`/datafeeds?limit=100&page=${page}`)
  const rows = r.json?.data || []
  if (!rows.length) break
  for (const p of rows) {
    all.push(p)
    const m = p.merchant || '?'
    merchants.set(m, (merchants.get(m) || 0) + 1)
  }
  process.stdout.write(`\r  trang ${page}: tổng ${all.length} sản phẩm, ${merchants.size} merchant`)
  if (rows.length < 100) break
  await new Promise((s) => setTimeout(s, 400))
}
console.log('\n')

console.log('Merchant có trong datafeed:')
for (const [m, n] of [...merchants].sort((a, b) => b[1] - a[1])) {
  const flag = /tiktok/i.test(m) ? '  <<< TIKTOK' : ''
  console.log(`  ${String(n).padStart(5)} sp   ${m}${flag}`)
}

const tikTokRows = all.filter((p) => /tiktok/i.test(p.merchant || '') || /tiktok/i.test(p.campaign || ''))
console.log(`\nSản phẩm TikTok Shop trong datafeed: ${tikTokRows.length}`)

if (!tikTokRows.length) {
  console.log(
    '\n⚠️  TikTok Shop KHÔNG có datafeed sản phẩm.\n' +
    '   Đúng như bản chất chiến dịch smartlink: mình tự chọn sản phẩm bất kỳ rồi\n' +
    '   tạo link, chứ sàn không phát hành danh mục sản phẩm cho publisher.\n' +
    '   => Muốn bán hàng TikTok phải tự chọn từng món (xem phần kết luận trong chat).'
  )
}

writeFileSync(
  new URL('./datafeed-raw.json', import.meta.url),
  JSON.stringify(tikTokRows.length ? tikTokRows : all, null, 1),
  'utf-8'
)
console.log(`\n✅ Đã ghi scripts/datafeed-raw.json (${(tikTokRows.length ? tikTokRows : all).length} dòng)`)

const p = (tikTokRows[0] || all[0])
if (p) {
  console.log(`   Trường có sẵn: ${Object.keys(p).join(', ')}`)
  console.log(`   Mẫu: ${String(p.name || '?').slice(0, 60)}`)
  console.log(`        giá=${p.price ?? '?'}  ảnh=${p.image ? 'có' : 'không'}  aff_link=${p.aff_link ? 'có' : 'không'}`)
}
