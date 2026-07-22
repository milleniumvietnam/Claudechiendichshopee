import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeatured()
  }, [])

  async function fetchFeatured() {
    try {
      const res = await axios.get(`${API_URL}/api/products/featured`)
      setFeatured(res.data.products || [])
    } catch (err) {
      console.error('Error fetching featured products:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Kinh Doanh Shopee - Curated Premium Accessories</title>
        <meta name="description" content="Discover handpicked premium tech accessories and lifestyle products" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-2xl text-luxury-800">
            Kinh Doanh Shopee
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/products" className="text-gray-600 hover:text-luxury-700 font-medium">
              Shop
            </Link>
            <Link href="/cart" className="text-gray-600 hover:text-luxury-700 font-medium">
              Cart (0)
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-luxury-50 via-white to-gold-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="font-display text-5xl lg:text-6xl font-bold text-luxury-900 mb-6">
              Curated Premium Accessories
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Handpicked collection of verified tech accessories and lifestyle products from Vietnam's trusted marketplace. Authentic quality, guaranteed satisfaction.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-3 bg-luxury-700 text-white font-semibold rounded-lg hover:bg-luxury-800 transition-colors shadow-luxury"
              >
                Explore Collection
              </Link>
              <button className="inline-flex items-center justify-center px-8 py-3 border border-luxury-300 text-luxury-700 font-semibold rounded-lg hover:bg-luxury-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10" />
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-luxury-900 mb-4">
              This Week's Selection
            </h2>
            <p className="text-lg text-gray-600">
              Handpicked bestsellers from Shopee's trending categories
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-80 animate-pulse" />
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featured.map((product) => (
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
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-luxury-700 transition-colors">
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
            <div className="text-center py-12">
              <p className="text-gray-600">No products available</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-luxury-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: '✓',
                title: 'Verified Authentic',
                description: 'Every product is verified from Shopee\'s top-rated sellers'
              },
              {
                icon: '⚡',
                title: 'Fast Delivery',
                description: 'Quick shipping with real-time tracking to your doorstep'
              },
              {
                icon: '🛡️',
                title: '30-Day Guarantee',
                description: 'Full refund if not satisfied, no questions asked'
              }
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-luxury-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-luxury-800 to-luxury-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-6">
            Ready to upgrade your tech?
          </h2>
          <p className="text-lg text-luxury-100 mb-8">
            Explore our curated collection of premium accessories hand-picked just for you
          </p>
          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-gold-500 text-luxury-900 font-semibold rounded-lg hover:bg-gold-600 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Kinh Doanh Shopee</h3>
              <p className="text-sm">Curated premium accessories from Vietnam's trusted marketplace.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/products" className="hover:text-white">Products</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Shipping Info</a></li>
                <li><a href="#" className="hover:text-white">Returns</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Telegram</a></li>
                <li><a href="#" className="hover:text-white">Facebook</a></li>
                <li><a href="#" className="hover:text-white">TikTok</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Kinh Doanh Shopee. All rights reserved. | Millenium Việt Nam</p>
          </div>
        </div>
      </footer>
    </>
  )
}
