// Dán nguyên file này vào console của một tab đang mở shopee.vn (trang sản phẩm
// bất kỳ), rồi gọi `await grab(30)`. Chạy lại nhiều lượt cho tới khi `conLai: 0`.
//
// Kết quả ghi vào localStorage sau MỖI lần gọi, nên nếu Shopee đá sang trang xác
// minh giữa chừng thì chỉ cần quay lại trang sản phẩm và gọi `grab` tiếp — không
// mất dữ liệu đã lấy.
//
// Lấy xong thì `dump()` để in ra dạng TSV, dán vào scripts/galleries.tsv, rồi
// chạy `python3 scripts/build_import.py`.
//
// Hạn mức: ~40-50 lần gọi mỗi IP. Gặp error 90309999 nghĩa là ĐANG BỊ CHẶN,
// không phải sản phẩm bị gỡ. Chờ (tính bằng giờ) hoặc đổi sang mạng khác.

const KEY = '__gallery__'

// [itemId, shopId] — lấy từ https://kdshopee-backend.onrender.com/api/products?limit=60
const PAIRS = [
  ['25473508880', '1053563596'], ['15509326183', '390877573'], ['28179965010', '1155427994'],
  ['14609320217', '53118009'], ['28625261821', '325696535'], ['27421845442', '178808689'],
  ['24156139007', '1125155158'], ['48200823921', '1655698552'], ['22457174137', '1003521646'],
  ['40124510623', '1365811412'], ['28991133742', '1618525064'], ['41869171810', '1625115902'],
  ['41450755372', '1454455021'], ['19076200751', '73624532'], ['26458860279', '1125606514'],
  ['43050973866', '1125155158'], ['28512157284', '1324308924'], ['26609027692', '131085332'],
  ['28244234061', '1125155158'], ['25944454662', '1133531707'], ['41203188085', '50626807'],
  ['45257587010', '1642156085'], ['28420521474', '1125606514'], ['40251537408', '1125155158'],
  ['40559417524', '1297127080'], ['41078788493', '1125606514'], ['43317549734', '1613586614'],
  ['43258316432', '1326834591'], ['44375866256', '1588249983'], ['53303675114', '889908151'],
  ['40028763819', '1125155158'], ['54208152799', '1698873565'], ['22010951491', '392454501'],
  ['40608279896', '1326834591'], ['40231311373', '1125155158'], ['57706144554', '1125155158'],
  // Hai món từng bị loại oan vì hiểu nhầm mã 90309999 — tra lại xem còn sống không.
  ['24910953759', '1125158313'], ['29994060777', '184461269'],
]

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch (e) { return {} }
}

async function grab(n = 30) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  let ok = 0, chan = 0
  for (const [id, shop] of PAIRS.filter(([i]) => !load()[i]).slice(0, n)) {
    try {
      const res = await fetch(
        `/api/v4/pdp/get_pc?item_id=${id}&shop_id=${shop}&detail_level=0`,
        { headers: { 'X-Requested-With': 'XMLHttpRequest' }, credentials: 'include' }
      )
      const j = await res.json()
      if (j.error === 90309999) { chan++; break } // bị chặn — dừng ngay, đừng đào sâu thêm
      const imgs = (j?.data?.product_images?.images || []).slice(0, 6)
      if (imgs.length) {
        const store = load()
        store[id] = imgs
        localStorage.setItem(KEY, JSON.stringify(store))
        ok++
      }
    } catch (e) { /* bỏ qua, lượt sau lấy lại */ }
    await sleep(1000)
  }
  const store = load()
  return {
    lanNayLayDuoc: ok,
    biChan: chan > 0 ? 'CÓ — dừng lại và chờ, đừng chạy tiếp ngay' : 'không',
    daLuu: Object.keys(store).length,
    conLai: PAIRS.filter(([i]) => !store[i]).length,
  }
}

function dump() {
  const store = load()
  return Object.entries(store).map(([k, v]) => `${k}\t${v.join('|')}`).join('\n')
}

console.log('Sẵn sàng. Chạy:  await grab(30)   rồi:  dump()')
