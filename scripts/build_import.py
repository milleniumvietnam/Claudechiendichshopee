"""Build backend/prisma/import-shopee.js from data verified against Shopee's own
product API (api/v4/pdp/get_pc), fetched in-page so it carries real titles,
prices, review counts and shop trust signals.

The previous import file was generated from an Apify keyword scrape whose `name`
column was shifted by one row, so every product carried its neighbour's title
and image. Nothing here is transcribed by hand without a byte-level checksum.
"""
import json

BASE = "/private/tmp/claude-501/"
OUT = "/Users/yakuzabinair/Desktop/Kinh Doanh Shopee/backend/prisma/import-shopee.js"
IMG_PREFIX = "https://down-vn.img.susercontent.com/file/"

# Two listings Shopee no longer serves (error 90309999) — dropped, not guessed at.
DEAD = {"24910953759", "29994060777"}

# Near-duplicates: same product, same or weaker listing. The storefront's whole
# claim is that the catalogue is filtered with care, so showing the same item
# twice would contradict the thesis. Keep the listing with more reviews.
DUPES = {
    "14109335337",  # T28 mouse, same shop as 15509326183 (767 vs 9473 reviews)
    "50206229167",  # identical cable title to 41078788493 (12 vs 427 reviews)
}

pairs = {r["itemId"]: r for r in json.load(open(BASE + "pairs.json", encoding="utf-8"))}

core = {}
for line in open(BASE + "core.tsv", encoding="utf-8"):
    f = line.rstrip("\n").split("\t")
    if f[2] == "DEAD":
        continue
    core[f[0]] = dict(
        itemId=f[0], category=f[1], featured=f[2] == "1",
        price=int(f[3]), orig=int(f[4]), discount=int(f[5]),
        rating=float(f[6]), reviews=int(f[7]), star5=int(f[8]),
        shopName=f[9], shopLoc=f[10], shopRating=float(f[11]),
        shopFollowers=int(f[12]), shopVerified=f[13] == "1",
        shopOfficial=f[14] == "1", shopResponse=int(f[15]), title=f[16],
    )

images = {}
for line in open(BASE + "images.tsv", encoding="utf-8"):
    f = line.rstrip("\n").split("\t")
    images[f[0]] = f[1] if len(f) > 1 else ""

# Multi-variant items: Shopee returns a range, not a single price.
for line in open(BASE + "ranges.tsv", encoding="utf-8"):
    f = line.rstrip("\n").split("\t")
    if f[0] not in core:
        continue
    c = core[f[0]]
    c["price"], c["priceMax"] = int(f[1]), int(f[2])
    c["orig"], c["discount"] = int(f[3]), int(f[5])

kept = [c for iid, c in core.items() if iid not in DEAD and iid not in DUPES]

# Category order preserved from the previous catalogue, featured first within it.
CAT_ORDER = ["phụ kiện điện thoại", "pin sạc dự phòng", "sạc nhanh", "đèn led", "chuột gaming"]
kept.sort(key=lambda c: (CAT_ORDER.index(c["category"]), not c["featured"], -c["reviews"]))


def js(s):
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"


rows = []
for c in kept:
    iid = c["itemId"]
    shop_id = pairs[iid]["shopId"]
    img = IMG_PREFIX + images[iid] if images.get(iid) else ""
    rows.append(
        "  { itemId: %s, shopId: %s, name: %s,\n"
        "    price: %d, priceMax: %s, orig: %d, discount: %d,\n"
        "    rating: %.2f, reviews: %d, star5: %d, image: %s,\n"
        "    shop: %s, shopLoc: %s, shopRating: %.2f, shopFollowers: %d,\n"
        "    shopVerified: %s, shopOfficial: %s, shopResponse: %d,\n"
        "    category: %s, featured: %s },"
        % (
            js(iid), js(shop_id), js(c["title"]),
            c["price"], (str(c["priceMax"]) if c.get("priceMax") else "null"),
            c["orig"], c["discount"],
            c["rating"], c["reviews"], c["star5"], js(img),
            js(c["shopName"]), js(c["shopLoc"]), c["shopRating"], c["shopFollowers"],
            "true" if c["shopVerified"] else "false",
            "true" if c["shopOfficial"] else "false", c["shopResponse"],
            js(c["category"]), "true" if c["featured"] else "false",
        )
    )

header = """// Import real Shopee products into the catalogue.
//
// SOURCE OF TRUTH: Shopee's own product API (api/v4/pdp/get_pc), read per item.
// The previous version of this file came from an Apify keyword scrape whose
// `name` column was shifted one row down, so every product showed its
// neighbour's title and photo. Every field below was re-read from Shopee and
// checked byte-for-byte against the source before being written here.
//
// soldCount stays 0 on purpose: Shopee stopped disclosing it (historical_sold
// is null for every item). ratingCount is the real review count and is the
// trust signal the storefront displays instead.
//
// affiliateUrl uses the canonical /product/{shopId}/{itemId} form. routes/affiliate.js
// wraps it in an AccessTrade deep-link at redirect time when AFFILIATE_DEEP_LINK_ID is set.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PRODUCTS = [
"""

body = "\n".join(rows)

footer = """
]

async function main() {
  let created = 0, updated = 0
  for (const p of PRODUCTS) {
    const data = {
      name: p.name,
      price: p.price,
      priceMax: p.priceMax,
      originalPrice: p.orig,
      discountPercent: p.discount,
      image: p.image,
      images: [],
      rating: p.rating,
      ratingCount: p.reviews,
      reviewStar5: p.star5,
      soldCount: 0,
      stock: 0,
      shopId: p.shopId,
      shopName: p.shop,
      sellerLocation: p.shopLoc,
      shopRating: p.shopRating,
      shopFollowers: p.shopFollowers,
      shopVerified: p.shopVerified,
      shopOfficial: p.shopOfficial,
      shopResponseRate: p.shopResponse,
      category: p.category,
      featured: p.featured,
      active: true,
      affiliateUrl: `https://shopee.vn/product/${p.shopId}/${p.itemId}`,
      affiliateSource: 'shopee',
    }
    const existing = await prisma.product.findUnique({ where: { shopeeId: p.itemId } })
    await prisma.product.upsert({
      where: { shopeeId: p.itemId },
      update: data,
      create: { shopeeId: p.itemId, ...data },
    })
    existing ? updated++ : created++
  }

  // Listings that no longer resolve on Shopee must not stay clickable.
  const keep = PRODUCTS.map((p) => p.itemId)
  const { count: retired } = await prisma.product.updateMany({
    where: { shopeeId: { notIn: keep }, active: true },
    data: { active: false },
  })

  console.log(`Products: ${created} created, ${updated} updated, ${retired} retired`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
"""

open(OUT, "w", encoding="utf-8").write(header + body + footer)

from collections import Counter
print("kept", len(kept), "products")
print(Counter(c["category"] for c in kept))
print("price 0:", [c["itemId"] for c in kept if not c["price"]])
print("no image:", [c["itemId"] for c in kept if not images.get(c["itemId"])])
