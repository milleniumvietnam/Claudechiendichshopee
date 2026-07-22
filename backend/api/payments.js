// SePay VietQR Payment Integration
// Handle QR code generation, payment verification, webhook processing

import axios from 'axios'
import crypto from 'crypto'

export default class SePayAPI {
  constructor(apiKey, secretKey, merchantId) {
    this.apiKey = apiKey
    this.secretKey = secretKey
    this.merchantId = merchantId
    this.baseURL = 'https://api.sepay.vn/v3'
  }

  generateSignature(data) {
    const payload = JSON.stringify(data)
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex')
  }

  async createQRCode(orderData) {
    try {
      const payload = {
        merchantId: this.merchantId,
        orderId: orderData.orderId,
        amount: orderData.amount,
        description: orderData.description || `Order #${orderData.orderId}`,
        reference: orderData.reference || orderData.orderId,
        signature: this.generateSignature({
          merchantId: this.merchantId,
          orderId: orderData.orderId,
          amount: orderData.amount,
        }),
      }

      const config = {
        method: 'post',
        url: `${this.baseURL}/qr/create`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        data: payload,
      }

      const response = await axios(config)
      return response.data
    } catch (error) {
      console.error('SePay API Error:', error.response?.data || error.message)
      throw error
    }
  }

  verifyPaymentSignature(webhookData) {
    const { signature, ...data } = webhookData
    const calculatedSignature = this.generateSignature(data)
    return signature === calculatedSignature
  }

  async getTransactions(filters = {}) {
    try {
      const config = {
        method: 'get',
        url: `${this.baseURL}/transactions`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        params: {
          merchantId: this.merchantId,
          ...filters,
        },
      }

      const response = await axios(config)
      return response.data
    } catch (error) {
      console.error('SePay API Error:', error.response?.data || error.message)
      throw error
    }
  }

  async generateVietQRStatic(accountNumber, bankCode, amount) {
    try {
      const payload = {
        accountNo: accountNumber,
        bankCode: bankCode,
        amount: amount,
        description: 'Thanh toan hang Kinh Doanh Shopee',
      }

      const config = {
        method: 'post',
        url: `${this.baseURL}/qr/generateStatic`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        data: payload,
      }

      const response = await axios(config)
      return response.data
    } catch (error) {
      console.error('SePay API Error:', error.response?.data || error.message)
      throw error
    }
  }
}
