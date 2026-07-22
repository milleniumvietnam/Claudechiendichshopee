import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function Cart() {
  const router = useRouter()
  const [step, setStep] = useState('cart') // cart, checkout, payment
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    city: 'Ho Chi Minh',
    notes: ''
  })

  const [order, setOrder] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckout = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await axios.post(`${API_URL}/api/orders`, {
        ...formData,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        shippingFee: 30000
      })

      if (res.data.success) {
        setOrder(res.data.order)
        setStep('payment')
      }
    } catch (err) {
      alert('Failed to create order: ' + err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Checkout - Kinh Doanh Shopee</title>
      </Head>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-2xl text-luxury-800">
            Kinh Doanh Shopee
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === 'cart' && (
          <div className="text-center py-24">
            <h1 className="font-display text-4xl font-bold text-luxury-900 mb-4">
              Shopping Cart
            </h1>
            <p className="text-gray-600 mb-8">
              Demo: Cart functionality will be implemented with full state management
            </p>
            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-luxury-700 text-white font-semibold rounded-lg hover:bg-luxury-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        )}

        {step === 'checkout' && (
          <form onSubmit={handleCheckout} className="max-w-2xl mx-auto">
            <h1 className="font-display text-3xl font-bold text-luxury-900 mb-8">
              Checkout
            </h1>

            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-2 gap-6">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-luxury-500"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email (optional)"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-luxury-500"
                />
              </div>

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-luxury-500"
              />

              <input
                type="text"
                name="address"
                placeholder="Street Address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-luxury-500"
              />

              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  name="ward"
                  placeholder="Ward"
                  value={formData.ward}
                  onChange={handleInputChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-luxury-500"
                />
                <input
                  type="text"
                  name="district"
                  placeholder="District"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-luxury-500"
                />
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-luxury-500"
                >
                  <option>Ho Chi Minh</option>
                  <option>Hanoi</option>
                  <option>Da Nang</option>
                  <option>Other</option>
                </select>
              </div>

              <textarea
                name="notes"
                placeholder="Order notes (optional)"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-luxury-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-3 bg-luxury-700 text-white font-semibold rounded-lg hover:bg-luxury-800 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processing...' : 'Continue to Payment'}
            </button>
          </form>
        )}

        {step === 'payment' && order && (
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-display text-3xl font-bold text-luxury-900 mb-8">
              Payment
            </h1>

            <div className="bg-luxury-50 rounded-lg p-8 mb-8">
              <p className="text-gray-600 mb-4">Order ID: {order.orderNumber}</p>
              <p className="text-4xl font-bold text-luxury-700 mb-2">
                {(order.total / 1000).toFixed(0)}K VND
              </p>
              <p className="text-gray-600">Please scan the QR code below to complete payment</p>
            </div>

            <div className="bg-white border-2 border-luxury-200 rounded-lg p-8 mb-8 inline-block">
              <div className="w-64 h-64 bg-gray-100 rounded flex items-center justify-center">
                {/* QR code will be displayed here */}
                <div className="text-center">
                  <p className="text-gray-600">QR Code</p>
                  <p className="text-sm text-gray-500 mt-2">Ready to display</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-8">
              You'll receive a confirmation via Telegram when payment is received
            </p>

            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-luxury-700 text-white font-semibold rounded-lg hover:bg-luxury-800 transition-colors"
            >
              Back to Shopping
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
