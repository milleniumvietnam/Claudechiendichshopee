import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample featured products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { shopeeId: 1001 },
      create: {
        shopeeId: 1001,
        name: 'Premium Wireless Earbuds Pro',
        description: 'High-quality wireless earbuds with noise cancellation',
        price: 450000,
        originalPrice: 650000,
        discountPercent: 30,
        image: 'https://via.placeholder.com/300x300?text=Wireless+Earbuds',
        images: ['https://via.placeholder.com/300x300?text=Wireless+Earbuds'],
        rating: 4.8,
        ratingCount: 1250,
        soldCount: 5000,
        stock: 100,
        shopId: 12345,
        shopName: 'Premium Tech Store',
        sellerLocation: 'Ho Chi Minh',
        category: 'phụ kiện điện thoại',
        featured: true,
        active: true
      },
      update: { featured: true }
    }),
    prisma.product.upsert({
      where: { shopeeId: 1002 },
      create: {
        shopeeId: 1002,
        name: '30000mAh Fast Charging Power Bank',
        description: 'Large capacity power bank with 65W fast charging',
        price: 350000,
        originalPrice: 500000,
        discountPercent: 30,
        image: 'https://via.placeholder.com/300x300?text=Power+Bank',
        images: ['https://via.placeholder.com/300x300?text=Power+Bank'],
        rating: 4.7,
        ratingCount: 800,
        soldCount: 3200,
        stock: 150,
        shopId: 12346,
        shopName: 'Tech Accessories Plus',
        sellerLocation: 'Ho Chi Minh',
        category: 'pin sạc dự phòng',
        featured: true,
        active: true
      },
      update: { featured: true }
    }),
    prisma.product.upsert({
      where: { shopeeId: 1003 },
      create: {
        shopeeId: 1003,
        name: 'Smartwatch Band Set (5 Colors)',
        description: 'Premium silicone bands compatible with all smartwatches',
        price: 150000,
        originalPrice: 250000,
        discountPercent: 40,
        image: 'https://via.placeholder.com/300x300?text=Smartwatch+Band',
        images: ['https://via.placeholder.com/300x300?text=Smartwatch+Band'],
        rating: 4.9,
        ratingCount: 450,
        soldCount: 2100,
        stock: 200,
        shopId: 12347,
        shopName: 'Wearables Store',
        sellerLocation: 'Da Nang',
        category: 'smartwatch',
        featured: true,
        active: true
      },
      update: { featured: true }
    }),
    prisma.product.upsert({
      where: { shopeeId: 1004 },
      create: {
        shopeeId: 1004,
        name: '120W USB-C Fast Charger',
        description: 'Ultra-fast charging for laptops, phones, and tablets',
        price: 299000,
        originalPrice: 450000,
        discountPercent: 33,
        image: 'https://via.placeholder.com/300x300?text=USB+C+Charger',
        images: ['https://via.placeholder.com/300x300?text=USB+C+Charger'],
        rating: 4.6,
        ratingCount: 920,
        soldCount: 4500,
        stock: 120,
        shopId: 12348,
        shopName: 'Charging Experts',
        sellerLocation: 'Hanoi',
        category: 'sạc nhanh',
        featured: true,
        active: true
      },
      update: { featured: true }
    })
  ])

  console.log(`✅ Seeded ${products.length} products`)

  // Create sample customer
  const customer = await prisma.customer.upsert({
    where: { phone: '0901234567' },
    create: {
      name: 'John Doe',
      phone: '0901234567',
      email: 'john@example.com',
      address: '123 Nguyen Hue',
      ward: 'Ben Nghe',
      district: 'District 1',
      city: 'Ho Chi Minh'
    },
    update: {}
  })

  console.log(`✅ Seeded 1 customer`)

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
