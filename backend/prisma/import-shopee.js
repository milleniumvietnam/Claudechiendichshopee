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

  // ===== Đèn LED trang trí (đèn led) =====
  ['43258316432','1326834591','Đèn dây LED ARGB 16 triệu màu 5M/10M, điều khiển điện thoại, nháy theo nhạc, decor phòng',75479,96128,4.9,'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-mc45awlgnvca55','đèn led',true],
  ['22457174137','1003521646','Đèn Galaxy Cực Quang USB LED chiếu bầu trời, decor phòng ngủ, điều khiển từ xa',199999,249999,4.5,'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lmlnaub8n9b355','đèn led',true],
  ['25473508880','1053563596','Đèn Cực Quang chiếu bầu trời Galaxy UStyle Q6S, decor phòng ngủ, điều khiển từ xa',59000,100000,4.7,'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lza8wcu330p9f4','đèn led',true],
  ['28179965010','1155427994','Goldstar đèn ngủ để bàn LED 3D chiếu sóng nước, 16 màu RGB',43500,50000,4.7,'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m7hbqpg9uzmg7b','đèn led',false],
  ['25944454662','1133531707','Dây LED RGB dải USB 16 triệu màu, điều khiển remote, trang trí decor phòng',99000,139000,4.8,'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mjdt5nj5xpfl4e','đèn led',false],
  ['40559417524','1297127080','Đèn Galaxy cực quang chiếu trần 3D dải ngân hà, cảm biến nhạc, decor phòng',106820,196000,4.7,'https://down-vn.img.susercontent.com/file/cn-11134207-820l4-mi9nfzfg3eh268','đèn led',false],
  ['41203188085','50626807','Đèn NEON FLEX 10M 5V ARGB, dây neon chạy đuổi, decor tường phòng ngủ/làm việc',67520,120000,4.8,'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-mal0flsd3z4cc7','đèn led',false],
  ['40608279896','1326834591','Dây đèn LED sợi tóc Neon 220V có phích cắm, chống nước, dẻo, viền trang trí',75479,96128,4.8,'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-mc3j3ctyj2xaac','đèn led',false],

  // ===== Chuột gaming không dây (chuột gaming) =====
  ['15509326183','390877573','Chuột Silent Gaming Atas F30 không dây Bluetooth 3 MODE, pin 500mAh 50h, có app Macro',64000,90000,4.9,'https://down-vn.img.susercontent.com/file/0c5201ea2a48a683de34f71e0191121b','chuột gaming',true],
  ['26609027692','131085332','Chuột Gaming LEAVEN X3 Chip Pro không dây, có dock sạc, 3 mức DPI, LED RGB',165170,300000,4.9,'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lzponjmp4kel18','chuột gaming',true],
  ['44375866256','1588249983','Chuột Gaming không dây Attack Shark X11 dock sạc, 3 chế độ kết nối, tặng griptape',288000,400000,4.5,'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mq7aw6ta5blt78','chuột gaming',true],
  ['22010951491','392454501','Chuột không dây gaming TEKKIN INPHIC A9 PRO Bluetooth silent, pin sạc, 6 nút, LED RGB',184000,239000,4.9,'https://down-vn.img.susercontent.com/file/sg-11134201-22120-lysspcsim3kv7c','chuột gaming',false],
  ['29994060777','184461269','Chuột Gaming không dây T28 có đèn LED, click không tiếng ồn, bảo hành 12 tháng',369000,458000,4.9,'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m59qc579etsn9b','chuột gaming',false],
  ['14109335337','390877573','Chuột không dây Bluetooth 2-in-1 chế độ kép 2.4GHz, im lặng, chỉnh DPI 3 cấp',64000,90000,4.9,'https://down-vn.img.susercontent.com/file/4a709cda034249658832c498d210042f','chuột gaming',false],
  ['53303675114','889908151','Chuột Bluetooth 5.0 không dây gaming sạc pin TEKKIN Inphic M6P cho game thủ',151250,362500,4.9,'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mjgjf7fhn6yo8b','chuột gaming',false],
  ['27421845442','178808689','Chuột Gaming không dây YINOIAO A7 LED tự động đổi màu, DPI 3600, cho máy tính',450000,null,4.9,'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m48rhdmf67ow42','chuột gaming',false],
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
