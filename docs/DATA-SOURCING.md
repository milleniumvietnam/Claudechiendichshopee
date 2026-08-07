# Lấy dữ liệu sản phẩm — cách làm và cách làm lại

Cập nhật: 07/08/2026 · Kho hiện tại: 36 sản phẩm

---

## 1. Nguồn nào dùng được, nguồn nào không

| Nguồn | Kết quả | Kết luận |
|---|---|---|
| **API của chính Shopee, gọi từ trong trang shopee.vn** | Đúng 100%, đủ trường, miễn phí | ✅ **Dùng cái này** |
| Apify `xtracto/shopee-scraper` chế độ `keyword` | Cột `name` **lệch xuống một dòng** — mỗi món mang tên món kế tiếp | ❌ Đã gây ra toàn bộ sự cố |
| Apify `xtracto/shopee-scraper` chế độ `detail` | Vẫn trả tên sai ở một số món khi đối chiếu với Shopee | ❌ Không tin được |
| Apify `keyword` + `fetchDetail: true` | Chạy 7 phút, 0 kết quả, tốn 0,46 CU | ❌ Đắt hơn mà không xong |
| Apify `gio21/shopee-scraper` | Trả `_mock: true` — dữ liệu bịa | ❌ Tuyệt đối không |
| `curl` thẳng vào API Shopee | HTTP 403 | ❌ Bị chặn bot |
| Mở trang sản phẩm Shopee bằng trình duyệt rồi đọc HTML | Bị đẩy sang trang đăng nhập | ❌ |

**Điểm mấu chốt:** API bị chặn khi gọi từ ngoài, nhưng gọi bằng `fetch()` **từ bên trong** một tab đang mở shopee.vn thì được — vì request mang sẵn cookie và đúng origin.

---

## 2. Cách làm lại (khoảng 10 phút, 0 đồng)

1. Mở một tab Chrome vào `https://shopee.vn/product/{shopId}/{itemId}` bất kỳ.
2. Chạy trong console của tab đó:

```js
const r = await fetch(`/api/v4/pdp/get_pc?item_id=${itemId}&shop_id=${shopId}&detail_level=0`,
  { headers: { 'X-Requested-With': 'XMLHttpRequest' }, credentials: 'include' });
const d = (await r.json()).data;
```

3. Lặp qua danh sách sản phẩm, **giãn 700–900 ms giữa các lần gọi**. Nhanh hơn sẽ bị đá sang `/verify/traffic/error` (API vẫn chạy tiếp, nhưng đừng ép).
4. Tổng hợp rồi chạy `python3 build_import.py` để sinh lại `backend/prisma/import-shopee.js`.

---

## 3. Trường nào nằm ở đâu

| Cần | Đường dẫn trong JSON |
|---|---|
| Tên thật | `data.item.title` |
| Giá hiện tại | `data.product_price.price.single_value` **÷ 100000** |
| Giá gốc | `data.product_price.price_before_discount.single_value` ÷ 100000 |
| % giảm | `data.product_price.discount` |
| Điểm đánh giá | `data.product_review.rating_star` |
| **Số đánh giá** | `data.product_review.total_rating_count` |
| Phân bố sao | `data.product_review.rating_count` → `[tổng, 1★, 2★, 3★, 4★, 5★]` |
| Thư viện ảnh | `data.product_images.images` (mảng mã băm) |
| Tên shop | `data.shop_detailed.name` |
| Chính hãng / Đã xác minh | `data.shop_detailed.is_official_shop` / `.is_shopee_verified` |
| Đánh giá shop, theo dõi, phản hồi | `.rating_star`, `.follower_count`, `.response_rate` |
| Nơi giao | `data.item.shop_location` |

URL ảnh đầy đủ: `https://down-vn.img.susercontent.com/file/{mã băm}`

---

## 3b. Hạn mức — đọc trước khi chạy

Shopee cho khoảng **40–50 lần gọi mỗi IP** rồi chặn. Khi bị chặn:

- Mọi lần gọi trả `error: 90309999` với HTTP **200** (không phải 429)
- Điều hướng trang cũng bị đá sang `/verify/traffic/error`
- **Xoá sạch cookie không gỡ được** — đã thử xoá cả 26 cookie, vẫn chặn ⇒ chặn theo **IP**, không theo phiên
- Chờ 12 phút chưa đủ. Nên tính bằng giờ, hoặc đổi mạng (4G điện thoại)

> ⚠️ `90309999` **không** có nghĩa "sản phẩm đã bị gỡ". Nó chỉ có nghĩa "bạn đang bị chặn".
> Lần đầu đã hiểu nhầm mã này và loại oan 2 sản phẩm khỏi kho.
> **Khi gặp mã này, dừng lại và chờ — đừng kết luận gì về sản phẩm.**

**Cách chạy an toàn:** mỗi lượt tối đa ~30 sản phẩm, giãn 900–1100 ms, và ghi kết quả vào `localStorage` ngay sau mỗi lần gọi (`localStorage.setItem('__gallery__', ...)`). Trang bị chuyển hướng giữa chừng sẽ xoá sạch biến `window`, nhưng `localStorage` thì còn — nhờ vậy chạy tiếp được từ chỗ dở.

---

## 4. Hai cái bẫy đã sập một lần

**Bẫy 1 — giá bằng 0.** Hàng nhiều phiên bản không có `single_value`; nó trả `-1` và giá nằm ở `range_min` / `range_max`. Chia cho 100000 rồi làm tròn sẽ ra `0`. **9 trong 40 món** dính lỗi này.
→ Luôn kiểm `single_value > 0`, không thì lấy `range_min`, và lưu `priceMax` để hiển thị “từ X₫”.

**Bẫy 2 — `historical_sold` luôn null.** Shopee đã ngừng công bố lượt bán. Đừng đi tìm nữa; dùng `total_rating_count` làm tín hiệu phổ biến.

---

## 5. Quy tắc tự đặt ra sau sự cố này

- **Không tin dữ liệu bên thứ ba về chính con số mình đem đi bán.** Tên và giá phải lấy từ nguồn gốc.
- **Đối chiếu byte trước khi ghi.** Mỗi lần chép dữ liệu qua một chặng, so lại độ dài chuỗi + giá với nguồn.
- **Món nào tra không ra thì bỏ, không đoán.** 2 listing lỗi `90309999` đã bị loại thẳng.
