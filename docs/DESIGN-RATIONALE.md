# Lý giải thiết kế — deal.milleniumvietnam.com

Ngày: 07/08/2026 · Trang: storefront affiliate (chủ, danh mục, chi tiết)

---

## 1. Chủ thể và việc duy nhất của trang

**Chủ thể:** Trang tuyển chọn affiliate cho phụ kiện công nghệ trên Shopee Việt Nam. 40 sản phẩm thật, giá 15.000₫ – 450.000₫.

**Khách:** Người Việt 18–35, phần lớn vào bằng điện thoại.

**Việc duy nhất:** Trong khoảng 8 giây, tạo đủ tin tưởng để khách bấm **“Mua trên Shopee”**.

---

## 2. Vì sao bỏ thiết kế cũ

Bản cũ dùng **Playfair Display + nền kem + vàng gold**. Ba vấn đề thật:

| Vấn đề | Hệ quả |
|---|---|
| Ngôn ngữ hàng xa xỉ đặt lên tai nghe 15.000₫ | Lệch pha → đọc ra “giả”, mất tin tưởng |
| Playfair dựng dấu tiếng Việt kém (ế, ữ, ậ chồng lệch) | Chữ Việt trông vụng ở cỡ lớn |
| Kem + serif + terracotta là **mặc định** của AI, không phải **lựa chọn** | Không có bản sắc riêng |

Đây không phải chuyện thẩm mỹ. Với hàng giá thấp, sang trọng giả tạo **làm giảm** tỷ lệ chuyển đổi.

---

## 3. Hướng đã chọn: “Technical Editorial”

Điều đặc trưng nhất của dự án này không phải sản phẩm — Shopee có sẵn hàng triệu món. Điều đặc trưng là **sự chặt chẽ khi lọc**. Vậy nên toàn trang được dựng theo ngữ điệu của một **tờ thông số kỹ thuật**: tin tưởng đến từ độ chính xác, không phải trang trí.

Ngôn ngữ này bám vào thế giới thật của sản phẩm: mAh, W, Bluetooth 5.3, DPI, IPX.

---

## 4. Bảng màu — mỗi màu một nhiệm vụ

| Token | Hex | Vì sao |
|---|---|---|
| `ink` | `#0A0F1C` | Đen ngả xanh — màu màn hình thiết bị khi tắt |
| `paper` | `#FAFAFB` | Trắng lạnh, **cố tình không dùng kem `#F4F1EA`** (mặc định AI) |
| `volt` | `#2B4BFF` | Xanh đèn báo sạc — link, tin cậy, focus |
| `volt-300` | `#7C93FF` | Cùng tín hiệu, làm sáng để dùng trên nền tối |
| `ember` | `#C24405` | Tín hiệu giảm giá |
| `jade` | `#0C7E5B` | Đã xác thực / tiết kiệm được |

**Tương phản được đo, không đoán.** Ba cặp ban đầu trượt chuẩn và đã sửa:

| Cặp | Trước | Sau | Chuẩn |
|---|---|---|---|
| Eyebrow xanh trên nền ink | 3,24:1 ❌ | **6,81:1** ✅ | 4,5 |
| Dòng tiết kiệm jade trên trắng | 4,34:1 ❌ | **5,06:1** ✅ | 4,5 |
| Chữ trắng trên chip giảm giá | 2,87:1 ❌ | **5,09:1** ✅ | 4,5 |

---

## 5. Chữ — ba vai trò, mỗi vai một lý do

| Vai trò | Font | Lý do |
|---|---|---|
| Display | **Space Grotesk** | Grotesque kỹ thuật, chất catalogue phần cứng. Không phải Inter/Playfair mặc định |
| Body | **Be Vietnam Pro** | **Được vẽ riêng cho dấu tiếng Việt.** Lựa chọn bám chủ thể: khách là người Việt |
| Dữ liệu | **JetBrains Mono** | Dải thông số, giá, chuỗi kỹ thuật |

---

## 6. Signature: dải thông số (spec ribbon)

Thứ để nhớ về trang này là **dải thông số monospace** trên mọi sản phẩm, và bản mở rộng của nó ở hero:

```
● BỘ LỌC ĐANG ÁP DỤNG
  NGUỒN      Shopee VN · xếp theo lượt bán
  ĐÁNH GIÁ   ≥ 4.3★ · trung bình 4.78★
  GIÁ        15.000₫ – 450.000₫
  DANH MỤC   5 nhóm
  GIẢM GIÁ   trung bình 38%
  KẾT QUẢ    40 sản phẩm
```

**Mọi con số trong khối này được tính từ chính danh mục lúc tải trang**, không phải chữ viết cứng. Danh mục đổi thì khối này đổi theo. Đó là lý do nó tạo được tin tưởng: nó là **số đo**, không phải khẩu hiệu.

Hero cũng vì thế mà không mở bằng “số to + nhãn nhỏ + gradient” (đáp án mặc định), mà mở bằng chính **quy tắc lọc**.

---

## 7. Sửa những lỗi trung thực (quan trọng nhất)

**Vòng 1 — bỏ con số không có.** Kiểm tra dữ liệu thật phát hiện `soldCount`, `ratingCount`, `stock` **đều bằng 0** cho cả 40 sản phẩm, mà bản cũ vẫn in **“0 sold”** lên mọi thẻ.

> Một trang bán hàng nói “0 đã bán” thì phá hủy tin tưởng nhanh hơn bất kỳ lỗi thẩm mỹ nào.

**Vòng 2 — kho hàng nói sai tên.** Bản quét Apify ban đầu bị **lệch cột `name` xuống một dòng**: mỗi sản phẩm mang tên và ảnh của sản phẩm kế tiếp. Khách bấm vào một cái tên rồi sang Shopee thấy món khác — lỗi tin cậy nặng nhất có thể có với trang affiliate.

Đã dựng lại toàn bộ kho từ **API sản phẩm của chính Shopee** (`api/v4/pdp/get_pc`), đọc từng mã hàng một, đối chiếu từng byte. Kho 40 → **36**: bỏ 2 listing Shopee đã gỡ và 2 listing trùng lặp (trang tự nhận là “lọc kỹ” thì không thể bày trùng).

Ba câu khác cũng đang nói sai, đã sửa:

| Chỗ | Nói sai | Sự thật |
|---|---|---|
| Khối thông số hero | “xếp theo lượt bán” | Shopee không còn công bố lượt bán → xếp theo **lượt đánh giá** |
| API danh sách | sắp theo `soldCount` | Trường này luôn = 0 nên thứ tự **ngẫu nhiên** → chuyển sang `ratingCount` |
| Trang chi tiết | “Người bán: Shop trên Shopee” | Nay hiện **tên shop thật** |

**Vòng 3 — thay con số đã mất bằng con số có thật.** Lượt bán không lấy được, nhưng **số đánh giá** thì có: **65.673 đánh giá** trên toàn kho, kèm đánh giá shop, người theo dõi, tỷ lệ phản hồi, và cờ *Chính hãng / Đã xác minh* của chính Shopee.

Đây là tín hiệu **mạnh hơn** lượt bán, vì nó kèm sẵn nguồn kiểm chứng: khách bấm sang Shopee là thấy đúng con số đó.

---

## 8. Quyết định phục vụ chuyển đổi

| Quyết định | Lý do |
|---|---|
| **Thanh mua cố định trên mobile** | 70% khách VN dùng điện thoại; hành động mua đi theo suốt trang |
| **Dòng “Rẻ hơn 140.450₫ so với giá niêm yết”** | Số tiền tiết kiệm cụ thể mạnh hơn “−38%” trừu tượng |
| **Lọc phía trình duyệt** | 40 món nằm gọn trong bộ nhớ → đổi bộ lọc không có spinner, không chờ mạng |
| **Khối “Chúng tôi kiếm tiền thế nào”** | Nói thẳng về hoa hồng. Minh bạch mua được tin tưởng mà huy hiệu giả không mua được |
| **Bảng “Shopee xử lý gì”** ở trang chi tiết | Gỡ do dự cuối: ai bán, ai giao, đổi trả thế nào |
| **Xoá trang giỏ hàng** | Mô hình affiliate không có giỏ hàng. Bỏ thứ không phục vụ mục đích |

---

## 9. Chuyển động — một khoảnh khắc, không rải rác

- Hero: các dòng readout hiện lần lượt (stagger 70ms) — **một** khoảnh khắc được dàn dựng
- Marquee sản phẩm chạy ngang: bằng chứng liếc qua là thấy
- Hover thẻ: nâng 3px + ảnh phóng nhẹ 4%
- `prefers-reduced-motion: reduce` được tôn trọng toàn cục

---

## 10. Kiểm chứng đã chạy

| Hạng mục | Kết quả |
|---|---|
| Tương phản WCAG AA | ✅ 11/11 cặp đạt (3 cặp đã sửa) |
| Font đúng vai trò | ✅ Space Grotesk / Be Vietnam Pro / JetBrains Mono |
| Ảnh thiếu alt | ✅ 0 |
| Vùng chạm < 40px | ✅ 0 |
| Responsive 375px | ✅ Đã sửa 3 lỗi vỡ chữ phát hiện khi test |
| Link mua | ✅ `rel="noopener noreferrer sponsored"`, qua endpoint đếm click |
| Trạng thái trang live | ✅ 200 ở cả 5 đường dẫn |

---

## 11. Còn có thể làm tốt hơn

Trung thực về giới hạn hiện tại:

1. ~~Chưa có ảnh chi tiết~~ — **XONG 08/08/2026**: cả 38 sản phẩm có thư viện 6 ảnh thật từ Shopee, trang chi tiết có dải thumbnail đổi ảnh (component `Gallery.jsx`).
2. **Chưa có mô tả** — trường `description` trống, nên trang chi tiết dựa vào tên sản phẩm.
3. **Chưa có nội dung đánh giá** — mới có *số lượng* đánh giá, chưa có *lời* đánh giá. API có trả nội dung review.
4. **Số lượt bán: không lấy được** — Shopee đã ngừng công bố (`historical_sold = null` ở cả 40 món kiểm thử). Không phải thiếu sót của bản quét; đừng tốn công tìm lại.
5. **Giá và tồn kho sẽ cũ dần** — kho hàng là ảnh chụp tại 07/08/2026. Nên chạy lại định kỳ; cách lấy dữ liệu đã ghi ở `docs/DATA-SOURCING.md`.
