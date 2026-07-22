import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [search, category])

  async function fetchProducts() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category) params.append('category', category)
      params.append('limit', '24')

      const res = await axios.get(`${API_URL}/api/products?${params.toString()}`)
      setProducts(res.data.products || [])
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    'phụ kiện điện thoại',
    'smartwatch',
    'pin sạc dự phòng',
    'sạc nhanh',
    'thông minh'
  ]

  return (
    <>
      <Head>
        <title>Products - Kinh Doanh Shopee</title>
        <meta name="description" content="Browse our collection of premium tech accessories" />
      </Head>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-2xl text-luxury-800">
            Kinh Doanh Shopee
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/products" className="text-luxury-700 font-medium">
              Shop
            </Link>
            <Link href="/cart" className="text-gray-600 hover:text-luxury-700 font-medium">
              Cart
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="font-display text-4xl font-bold text-luxury-900 mb-8">
            Our Collection
          </h1>

          {/* Search Bar */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-luxury-500"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setCategory('')}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                category === ''
                  ? 'bg-luxury-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  category === cat
                    ? 'bg-luxury-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-80 animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group"
              >
                <div className="bg-gray-50 rounded-lg overflow-hidden mb-4 h-64 flex items-center justify-center">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-gray-400">No image</div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-luxury-700 transition-colors line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-luxury-700">
                      {(product.price / 1000).toFixed(0)}K
                    </p>
                    {product.originalPrice > product.price && (
                      <p className="text-sm text-gray-400 line-through">
                        {(product.originalPrice / 1000).toFixed(0)}K
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-gray-500">{product.soldCount} sold</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-gray-600 text-lg">No products found</p>
          </div>
        )}
      </div>
    </>
  )
}
