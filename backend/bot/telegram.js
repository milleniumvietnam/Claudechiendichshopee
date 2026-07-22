// Telegram Bot Integration
// Send order notifications, delivery updates, admin alerts

const axios = require('axios');

class TelegramBot {
  constructor(botToken, adminChatId) {
    this.botToken = botToken;
    this.adminChatId = adminChatId;
    this.baseURL = `https://api.telegram.org/bot${botToken}`;
  }

  // Send text message
  async sendMessage(chatId, text, options = {}) {
    try {
      const payload = {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        ...options,
      };

      const response = await axios.post(`${this.baseURL}/sendMessage`, payload);
      return response.data;
    } catch (error) {
      console.error('Telegram Error:', error.message);
      throw error;
    }
  }

  // Send order confirmation to admin
  async notifyOrderPlaced(orderData) {
    const message = `
🎉 <b>Đơn Hàng Mới!</b>

<b>Order ID:</b> ${orderData.orderId}
<b>Khách:</b> ${orderData.customerName}
<b>SĐT:</b> ${orderData.phone}
<b>Sản phẩm:</b> ${orderData.productName}
<b>Số lượng:</b> ${orderData.quantity}
<b>Giá:</b> ₫${orderData.amount.toLocaleString('vi-VN')}
<b>Trạng thái:</b> Chờ thanh toán

📍 <b>Địa chỉ:</b>
${orderData.address}
${orderData.ward} - ${orderData.district} - ${orderData.city}
    `;

    return this.sendMessage(this.adminChatId, message);
  }

  // Send payment confirmation
  async notifyPaymentReceived(orderData) {
    const message = `
✅ <b>Thanh Toán Thành Công!</b>

<b>Order ID:</b> ${orderData.orderId}
<b>Khách:</b> ${orderData.customerName}
<b>Số tiền:</b> ₫${orderData.amount.toLocaleString('vi-VN')}
<b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}

📦 Chuẩn bị đóng gói...
    `;

    return this.sendMessage(this.adminChatId, message);
  }

  // Send shipment notification
  async notifyShipment(orderData) {
    const message = `
📦 <b>Đơn Hàng Đã Gửi!</b>

<b>Order ID:</b> ${orderData.orderId}
<b>Khách:</b> ${orderData.customerName}
<b>Mã vận đơn:</b> ${orderData.trackingNumber}
<b>Địa chỉ:</b> ${orderData.address}

Khách vui lòng theo dõi: ${orderData.trackingUrl}
    `;

    return this.sendMessage(this.adminChatId, message);
  }

  // Send to customer (if they have Telegram)
  async notifyCustomer(customerChatId, message) {
    return this.sendMessage(customerChatId, message);
  }

  // Send daily sales report
  async sendDailyReport(stats) {
    const message = `
📊 <b>Báo Cáo Hôm Nay</b>

📈 Tổng đơn: ${stats.totalOrders}
💰 Doanh thu: ₫${stats.totalRevenue.toLocaleString('vi-VN')}
✅ Đã thanh toán: ${stats.paidOrders}
⏳ Chờ thanh toán: ${stats.pendingOrders}
📦 Đã gửi: ${stats.shippedOrders}

🔝 Sản phẩm hot nhất: ${stats.topProduct}
    `;

    return this.sendMessage(this.adminChatId, message);
  }

  // Send error alert
  async sendErrorAlert(errorMessage) {
    const message = `
⚠️ <b>Lỗi Hệ Thống!</b>

${errorMessage}

Vui lòng kiểm tra ngay!
    `;

    return this.sendMessage(this.adminChatId, message);
  }

  // Set webhook for Telegram updates
  async setWebhook(webhookUrl) {
    try {
      const response = await axios.post(`${this.baseURL}/setWebhook`, {
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
      });
      return response.data;
    } catch (error) {
      console.error('Telegram Webhook Error:', error.message);
      throw error;
    }
  }
}

module.exports = TelegramBot;
