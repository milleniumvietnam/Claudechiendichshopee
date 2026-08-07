// Import real Shopee products (scraped via Apify, sorted by sales).
// affiliateUrl uses the canonical /product/{shopId}/{itemId} form so the
// "Mua trên Shopee" button always resolves to the exact item.
// Replace affiliateUrl with your own affiliate-tracked link (Shopee Affiliate /
// AccessTrade) via the /admin page to start earning commission.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const IMG = '' // image_url values below are already absolute

// [itemId, shopId, name, price, originalPrice, rating, imageUrl, category, featured]
const RAW = [
  // ===== Tai nghe Bluetooth (phụ kiện điện thoại) =====
  ['41869171810','1625115902','Tai nghe chơi game X55 Bluetooth 5.4 chống nước, màn hình LED, pin trâu, độ trễ thấp',61000,90000,4.5,'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mepjmu0aocnb4f','phụ kiện điện thoại',true],
  ['54208152799','1698873565','Tai nghe Bluetooth không dây Pro 4 TWS 5.3 chống ồn, thể thao & chơi game',15000,110000,4.8,'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mpiuk5zu66fi2b','phụ kiện điện thoại',true],
  ['28991133742','1618525064','Tai nghe không dây Bluetooth X15 TWS, chơi game Bluetooth 5.3 tích hợp micrô',60760,90000,4.4,'https://down-vn.img.susercontent.com/file/sg-11134201-82635-ml27jbwucykm0c','phụ kiện điện thoại',true],
  ['43317549734','1613586614','Tai nghe Bluetooth Mini Pro chống nước, kháng ồn, bảo hành lỗi 1 đổi 1',84000,100000,4.8,'https://down-vn.img.susercontent.com/file/sg-11134201-82583-mr8ekm8g229zbc','phụ kiện điện thoại',false],
  ['19076200751','73624532','Tai nghe Gaming X15 / G11 PRO TWS Bluetooth 5.0, có mic độ trễ cực thấp',59000,80000,4.5,'https://down-vn.img.susercontent.com/file/sg-11134253-822yv-mib4tro6nsw16a','phụ kiện điện thoại',false],
  ['14609320217','53118009','Tai nghe Bluetooth không dây X15 TWS, màn hình LED Bluetooth 5.3 tích hợp mic',64200,100000,5.0,'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m226l1bthfvf73','phụ kiện điện thoại',false],
  ['45257587010','1642156085','Tai nghe Bluetooth Pro 4 không dây TWS cảm ứng chạm, khử tiếng ồn',37566,76980,4.6,'https://down-vn.img.susercontent.com/file/sg-11134253-820ol-mneiffr1af44e1','phụ kiện điện thoại',false],
  ['40124510623','1365811412','Tai nghe Bluetooth Pro kết nối không dây, pin khoẻ, bass ấm',58000,90000,4.3,'https://down-vn.img.susercontent.com/file/sg-11134201-8262r-mllgybgpjhfnb6','phụ kiện điện thoại',false],

  // ===== Sạc dự phòng (pin sạc dự phòng) =====
  ['24156139007','1125155158','Dosen Pro sạc dự phòng PD22.5W 10000-50000mAh, màn hình LED',228626,369076,4.8,'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m6c1zfx6og8mca','pin sạc dự phòng',true],
  ['26458860279','1125606514','Dosen Pro sạc dự phòng PD22.5W 30000-80000mAh, màn hình LED',352350,584700,4.9,'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lza94jfvj9e518','pin sạc dự phòng',true],
  ['28420521474','1125606514','Dosen sạc dự phòng PD22.5W 10000-25000mAh, hiển thị mức pin LED',228626,369076,4.8,'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-medseo7n2xaf84','pin sạc dự phòng',true],
  ['40251537408','1125155158','Dosen Pro sạc dự phòng 10000-42000mAh PD22.5W, sạc nhanh hai cổng',352350,556857,4.8,'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m9znfzsb5z0i00','pin sạc dự phòng',false],
  ['57706144554','1125155158','Dosen Mini từ tính không dây 10000-12000mAh 22.5W, có nam châm',333004,772273,4.9,'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mkn7surjb40752','pin sạc dự phòng',false],
  ['40028763819','1125155158','Dosen Pro Mini từ tính không dây 22.5W 10000-12000mAh, có nam châm',381099,441660,4.8,'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mknb51qg5m9t95','pin sạc dự phòng',false],
  ['43050973866','1125155158','Sạc dự phòng PD22.5W Dosen Pro K7 10000-50000mAh, màn hình LED',228626,369076,4.9,'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m9si5xo9m1j854','pin sạc dự phòng',false],
  ['24910953759','1125158313','Dosen sạc dự phòng PD22.5W 10000-20000mAh, dây đôi tự mang theo',217325,384307,4.9,'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lr2xydzupuis02','pin sạc dự phòng',false],

  // ===== Sạc nhanh & cáp (sạc nhanh) =====
  ['41078788493','1125606514','Dosen Pro cáp sạc nhanh PD 60W Type-C sang Type-C 1-2M (Macbook/iPad/Samsung)',61800,139960,4.8,'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mma4m0d7w0zz78','sạc nhanh',true],
  ['50206229167','1125158313','Dosen Pro cáp sạc nhanh PD 100W Type-C sang Type-C (iPhone 15/Macbook Pro)',61800,139960,5.0,'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mma4peliwg78d5','sạc nhanh',true],
  ['40231311373','1125155158','Bộ sạc 65W Samsung siêu nhanh 2.0 Type-C kèm cáp 5A (Galaxy S20/S21/S22)',57700,131960,4.8,'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mouxedh4shkx36','sạc nhanh',true],
  ['28244234061','1125155158','Bộ sạc USB-C UGREEN 30W Nexode GaN PPS (iPhone 16/15/Galaxy S25)',69980,159960,4.8,'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mma4g9rm7hu00b','sạc nhanh',false],
  ['28625261821','325696535','Bộ sạc Samsung 25/45W củ + cáp Type-C (Note 10/20, S21/S22 Ultra)',162000,269000,4.9,'https://down-vn.img.susercontent.com/file/cn-11134207-820l4-meth6q15e68650','sạc nhanh',false],
  ['48200823921','1655698552','Bộ sạc siêu nhanh Xiaomi MI 120W Turbo + cáp USB-C 6A (MI 11-15/Redmi)',41782,107951,4.6,'https://down-vn.img.susercontent.com/file/sg-11134253-821f3-mh1ou6ic03yh8a','sạc nhanh',false],
  ['41450755372','1454455021','Củ sạc nhanh GaN 200W, 4 cổng PD Type-C, sạc đa thiết bị',35000,88718,5.0,'https://down-vn.img.susercontent.com/file/sg-11134201-7rfib-m9pu3gndmyf445','sạc nhanh',false],
  ['28512157284','1324308924','Sạc nhanh OPPO 65W SUPER VOOC, củ + dây USB to Type-C chính hãng',73000,120000,4.8,'https://down-vn.img.susercontent.com/file/sg-11134253-823ra-moic575vx62zcc','sạc nhanh',false],
]

function discountPct(price, orig) {
  if (!orig || orig <= price) return null
  return Math.round((1 - price / orig) * 100)
}

async function main() {
  console.log('🌱 Importing real Shopee products…')
  let n = 0
  // AccessTrade deep-link (publisher AT2247335). Wrapping each Shopee product URL
  // in this makes every "Mua trên Shopee" click an affiliate-tracked link that
  // earns commission once the Shopee Smartlink campaign is approved.
  const AT_DEEP_LINK_ID = '7041276717188154130'
  const affiliate = (shopId, itemId) => {
    const shopeeUrl = `https://shopee.vn/product/${shopId}/${itemId}`
    return `https://go.isclix.com/deep_link/${AT_DEEP_LINK_ID}/?url=${encodeURIComponent(shopeeUrl)}&sub1=${itemId}&sub4=oneatweb`
  }
  for (const [itemId, shopId, name, price, orig, rating, image, category, featured] of RAW) {
    const affiliateUrl = affiliate(shopId, itemId)
    const data = {
      shopeeId: itemId,
      name,
      price,
      originalPrice: orig,
      discountPercent: discountPct(price, orig),
      image,
      images: [image],
      rating,
      ratingCount: 0,
      soldCount: 0,
      stock: 0,
      shopId,
      shopName: 'Shopee',
      sellerLocation: null,
      category,
      featured,
      active: true,
      affiliateUrl,
      affiliateSource: 'shopee',
      commissionPct: 5
    }
    await prisma.product.upsert({
      where: { shopeeId: itemId },
      create: data,
      update: {
        name: data.name, price: data.price, originalPrice: data.originalPrice,
        discountPercent: data.discountPercent, image: data.image, images: data.images,
        rating: data.rating, category: data.category, featured: data.featured,
        affiliateUrl: data.affiliateUrl, affiliateSource: 'shopee', commissionPct: 5
      }
    })
    n++
  }
  console.log(`✅ Imported ${n} real Shopee products.`)
}

main()
  .catch((e) => { console.error('❌ Import error:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
