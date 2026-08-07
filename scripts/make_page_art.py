"""Generate Facebook Page profile picture + cover for 'Đáng Mua Trên Shopee'.
Brand palette matches the website (luxury browns + gold on cream)."""
from PIL import Image, ImageDraw, ImageFont

OUT = "/Users/yakuzabinair/Desktop/Kinh Doanh Shopee/assets"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"

CREAM = (248, 246, 243)
LUX_700 = (157, 125, 82)
LUX_800 = (125, 100, 65)
LUX_900 = (92, 73, 48)
GOLD = (232, 187, 92)
WHITE = (255, 255, 255)


def f(path, size):
    return ImageFont.truetype(path, size)


def center_text(d, cx, y, text, font, fill):
    x0, y0, x1, y1 = d.textbbox((0, 0), text, font=font)
    d.text((cx - (x1 - x0) / 2 - x0, y), text, font=font, fill=fill)
    return y1 - y0


def vgrad(size, top, bottom):
    """Vertical gradient image."""
    w, h = size
    img = Image.new("RGB", (1, h))
    px = img.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        px[0, y] = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
    return img.resize((w, h))


# ---------- Profile picture: 500x500, circular-safe (FB crops to circle) ----------
S = 500
prof = vgrad((S, S), LUX_800, LUX_900)
d = ImageDraw.Draw(prof)

# subtle gold ring inside the circle crop
d.ellipse([28, 28, S - 28, S - 28], outline=GOLD, width=4)

# "ĐM" monogram
center_text(d, S / 2, 118, "ĐM", f(FONT_BLACK, 132), WHITE)
# divider
d.line([(S / 2 - 62, 292), (S / 2 + 62, 292)], fill=GOLD, width=3)
center_text(d, S / 2, 318, "ĐÁNG MUA", f(FONT_BOLD, 42), GOLD)
center_text(d, S / 2, 372, "TRÊN SHOPEE", f(FONT_BOLD, 29), (232, 223, 212))

prof.save(f"{OUT}/fb-profile.png")
print("saved fb-profile.png", prof.size)

# ---------- Cover: 1640x856 (FB Page recommended) ----------
W, H = 1640, 856
cov = vgrad((W, H), CREAM, (240, 235, 228))
d = ImageDraw.Draw(cov)

# decorative gold blob (top-right) + soft band
d.ellipse([W - 420, -180, W + 120, 360], fill=(245, 227, 190))
d.rectangle([0, H - 90, W, H], fill=LUX_800)

# headline
left = 110
d.text((left, 250), "ĐÁNG MUA", font=f(FONT_BLACK, 108), fill=LUX_900)
d.text((left, 370), "TRÊN SHOPEE", font=f(FONT_BLACK, 108), fill=LUX_700)

# gold underline
d.rectangle([left, 505, left + 300, 513], fill=GOLD)

# subline
d.text((left, 552), "Tuyển chọn phụ kiện công nghệ · đồ decor · gaming",
       font=f(FONT_REG, 40), fill=(110, 100, 88))
d.text((left, 610), "Giá tốt · Đánh giá cao · Mua trực tiếp trên Shopee",
       font=f(FONT_REG, 34), fill=(140, 130, 118))

# website strip
center_text(d, W / 2, H - 68, "claudechiendichshopee.vercel.app",
            f(FONT_BOLD, 34), CREAM)

# right-side product-ish cards (abstract, no fake logos)
cx, cy = W - 330, 300
for i, (dx, dy, s) in enumerate([(-120, -60, 150), (60, 10, 190), (-60, 150, 130)]):
    box = [cx + dx, cy + dy, cx + dx + s, cy + dy + s]
    d.rounded_rectangle(box, radius=26, fill=WHITE, outline=(226, 216, 204), width=3)
    # tiny gold price tag
    d.rounded_rectangle([box[0] + 16, box[3] - 46, box[0] + 16 + 62, box[3] - 16],
                        radius=10, fill=GOLD)

cov.save(f"{OUT}/fb-cover.png")
print("saved fb-cover.png", cov.size)
