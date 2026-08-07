import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function Admin() {
  const [adminKey, setAdminKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('kd_admin_key') : ''
    if (saved) { setAdminKey(saved); setAuthed(true) }
  }, [])

  const headers = useCallback(() => ({ 'x-admin-key': adminKey }), [adminKey])

  const loadData = useCallback(async () => {
    setLoading(true)
    setMsg('')
    try {
      const [pRes, sRes] = await Promise.all([
        axios.get(`${API_URL}/api/products?limit=100`),
        axios.get(`${API_URL}/api/admin/affiliate-stats`, { headers: headers() })
      ])
      setProducts(pRes.data.products || [])
      setStats(sRes.data)
    } catch (err) {
      if (err.response?.status === 401) {
        setMsg('❌ Sai admin key. Lấy key ở Render → Environment → ADMIN_KEY.')
        setAuthed(false)
        localStorage.removeItem('kd_admin_key')
      } else {
        setMsg('Lỗi tải dữ liệu: ' + (err.response?.data?.error || err.message))
      }
    } finally {
      setLoading(false)
    }
  }, [headers])

  useEffect(() => { if (authed) loadData() }, [authed, loadData])

  const handleLogin = (e) => {
    e.preventDefault()
    localStorage.setItem('kd_admin_key', adminKey)
    setAuthed(true)
  }

  const saveAffiliate = async (id, affiliateUrl, affiliateSource, commissionPct) => {
    try {
      await axios.patch(
        `${API_URL}/api/products/${id}/affiliate`,
        { affiliateUrl, affiliateSource, commissionPct: commissionPct ? Number(commissionPct) : undefined },
        { headers: headers() }
      )
      setMsg('✅ Đã lưu link affiliate.')
      loadData()
    } catch (err) {
      setMsg('Lỗi lưu: ' + (err.response?.data?.error || err.message))
    }
  }

  if (!authed) {
    return (
      <>
        <Head><title>Admin — Kinh Doanh Shopee</title></Head>
        <div className="min-h-screen flex items-center justify-center bg-luxury-50 px-4">
          <form onSubmit={handleLogin} className="bg-white rounded-xl shadow-luxury p-8 w-full max-w-md">
            <h1 className="font-display text-2xl font-bold text-luxury-900 mb-2">Admin Login</h1>
            <p className="text-sm text-gray-600 mb-6">
              Nhập <b>ADMIN_KEY</b> (lấy ở Render → service kdshopee-backend → Environment → ADMIN_KEY → Reveal).
            </p>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="ADMIN_KEY"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-luxury-500"
              required
            />
            <button type="submit" className="w-full px-4 py-3 bg-luxury-700 text-white font-semibold rounded-lg hover:bg-luxury-800">
              Đăng nhập
            </button>
            {msg && <p className="text-sm text-red-600 mt-4">{msg}</p>}
          </form>
        </div>
      </>
    )
  }

  return (
    <>
      <Head><title>Admin — Kinh Doanh Shopee</title></Head>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <span className="font-display font-bold text-xl text-luxury-800">Admin · Kinh Doanh Shopee</span>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-gray-600 hover:text-luxury-700">Xem web</Link>
              <button
                onClick={() => { localStorage.removeItem('kd_admin_key'); setAuthed(false) }}
                className="text-gray-500 hover:text-red-600"
              >Đăng xuất</button>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatCard label="Tổng lượt click" value={stats.totalClicks} />
              <StatCard label="SP có affiliate" value={stats.productsWithAffiliate} />
              <StatCard label="Hoa hồng ước tính/tháng" value={`${(stats.estimatedMonthlyCommission || 0).toLocaleString('vi-VN')}₫`} />
            </div>
          )}

          {msg && <p className="mb-4 text-sm font-medium text-luxury-800">{msg}</p>}

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-luxury-900">Sản phẩm & link affiliate</h2>
            <button onClick={loadData} className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100">
              {loading ? 'Đang tải…' : 'Làm mới'}
            </button>
          </div>

          <div className="space-y-3">
            {products.map((p) => (
              <ProductRow key={p.id} product={p} onSave={saveAffiliate} />
            ))}
            {products.length === 0 && !loading && (
              <p className="text-gray-500 text-center py-12">Chưa có sản phẩm.</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-luxury-sm p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-luxury-700">{value}</p>
    </div>
  )
}

function ProductRow({ product, onSave }) {
  const [url, setUrl] = useState(product.affiliateUrl || '')
  const [source, setSource] = useState(product.affiliateSource || 'shopee')
  const [pct, setPct] = useState(product.commissionPct ?? '')

  return (
    <div className="bg-white rounded-xl shadow-luxury-sm p-4 flex flex-col md:flex-row md:items-center gap-3">
      <div className="md:w-64 shrink-0">
        <p className="font-semibold text-gray-900 line-clamp-1">{product.name}</p>
        <p className="text-xs text-gray-500">
          {(product.price / 1000).toFixed(0)}K · {product.clickCount || 0} click · {product.category}
        </p>
      </div>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Dán link affiliate (Shopee/AccessTrade/TikTok)…"
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-luxury-500"
      />
      <select value={source} onChange={(e) => setSource(e.target.value)}
        className="px-2 py-2 border border-gray-300 rounded-lg text-sm">
        <option value="shopee">Shopee</option>
        <option value="tiktok">TikTok</option>
        <option value="lazada">Lazada</option>
        <option value="tiki">Tiki</option>
      </select>
      <input
        value={pct}
        onChange={(e) => setPct(e.target.value)}
        placeholder="%"
        className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm"
      />
      <button
        onClick={() => onSave(product.id, url, source, pct)}
        className="px-4 py-2 bg-luxury-700 text-white text-sm font-semibold rounded-lg hover:bg-luxury-800 shrink-0"
      >Lưu</button>
    </div>
  )
}
