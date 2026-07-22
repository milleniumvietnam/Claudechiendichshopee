// Shopee API Integration
// Fetch trending products, manage inventory, track orders

import axios from 'axios'
import crypto from 'crypto'

export default class ShopeeAPI {
  constructor(key, secret, partnerId, shopId) {
    this.key = key
    this.secret = secret
    this.partnerId = partnerId
    this.shopId = shopId
    this.baseURL = 'https://partner.shopeemobile.com/api/v2'
  }

  generateSignature(path, timestamp) {
    const baseString = `${path}${this.partnerId}${timestamp}`
    return crypto
      .createHmac('sha256', this.secret)
      .update(baseString)
      .digest('hex')
  }

  getHeaders(path, timestamp) {
    return {
      'Content-Type': 'application/json',
      'Authorization': this.generateSignature(path, timestamp),
      'X-Partner-Id': this.partnerId,
      'X-Timestamp': timestamp,
    }
  }

  async searchProducts(keyword, limit = 20) {
    try {
      const timestamp = Math.floor(Date.now() / 1000)
      const path = '/product/get_list'

      const config = {
        method: 'get',
        url: `${this.baseURL}${path}?shop_id=${this.shopId}&keyword=${keyword}&limit=${limit}`,
        headers: this.getHeaders(path, timestamp),
      }

      const response = await axios(config)
      return response.data
    } catch (error) {
      console.error('Shopee API Error:', error.response?.data || error.message)
      throw error
    }
  }

  async getProductDetail(productId) {
    try {
      const timestamp = Math.floor(Date.now() / 1000)
      const path = '/product/get_detail'

      const config = {
        method: 'get',
        url: `${this.baseURL}${path}?shop_id=${this.shopId}&product_id=${productId}`,
        headers: this.getHeaders(path, timestamp),
      }

      const response = await axios(config)
      return response.data
    } catch (error) {
      console.error('Shopee API Error:', error.response?.data || error.message)
      throw error
    }
  }

  async getOrders(status = 'all', pageSize = 20) {
    try {
      const timestamp = Math.floor(Date.now() / 1000)
      const path = '/order/list'

      const config = {
        method: 'get',
        url: `${this.baseURL}${path}?shop_id=${this.shopId}&order_status=${status}&page_size=${pageSize}`,
        headers: this.getHeaders(path, timestamp),
      }

      const response = await axios(config)
      return response.data
    } catch (error) {
      console.error('Shopee API Error:', error.response?.data || error.message)
      throw error
    }
  }

  async getTrendingCategories() {
    try {
      const timestamp = Math.floor(Date.now() / 1000)
      const path = '/shop/get_category'

      const config = {
        method: 'get',
        url: `${this.baseURL}${path}?shop_id=${this.shopId}`,
        headers: this.getHeaders(path, timestamp),
      }

      const response = await axios(config)
      return response.data
    } catch (error) {
      console.error('Shopee API Error:', error.response?.data || error.message)
      throw error
    }
  }
}
