// SePay VietQR Payment Integration
// Handle QR code generation, payment verification, webhook processing

const axios = require('axios');
const crypto = require('crypto');

class SePayAPI {
  constructor(apiKey, secretKey, merchantId) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.merchantId = merchantId;
    this.baseURL = 'https://api.sepay.vn/v3';
  }

  // Generate request signature
  generateSignature(data) {
    const payload = JSON.stringify(data);
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex');
  }

  // Create payment QR code request
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
      };

      const config = {
        method: 'post',
        url: `${this.baseURL}/qr/create`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        data: payload,
      };

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('SePay API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Verify payment with signature
  verifyPaymentSignature(webhookData) {
    const { signature, ...data } = webhookData;
    const calculatedSignature = this.generateSignature(data);
    return signature === calculatedSignature;
  }

  // Get transaction history
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
      };

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('SePay API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Generate VietQR static code (reusable)
  async generateVietQRStatic(accountNumber, bankCode, amount) {
    try {
      const payload = {
        accountNo: accountNumber,
        bankCode: bankCode, // e.g., 'MB' for Techcombank
        amount: amount,
        description: 'Thanh toan hang Kinh Doanh Shopee',
      };

      const config = {
        method: 'post',
        url: `${this.baseURL}/qr/generateStatic`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        data: payload,
      };

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('SePay API Error:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = SePayAPI;
