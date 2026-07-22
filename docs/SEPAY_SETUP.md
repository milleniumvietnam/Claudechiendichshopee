# 💳 SePay VietQR Payment Setup

Complete guide to integrate SePay VietQR instant payment gateway for Kinh Doanh Shopee.

---

## What is SePay?

**SePay** is a VietQR payment processor that:
- Generates QR codes for bank transfers
- Supports all Vietnamese banks
- Instant payment verification via webhook
- No transaction limits
- 0% commission for most accounts

---

## Step 1: Create SePay Merchant Account

### 1. Sign Up

1. Go to **[sepay.vn](https://sepay.vn)**
2. Click **Register** or **Đăng ký**
3. Fill in:
   - **Business Name**: "Kinh Doanh Shopee"
   - **Email**: your-email@gmail.com
   - **Phone**: Your number
   - **Bank Account**: Your business/personal account

### 2. Verify Account

1. Upload ID card photos (front/back)
2. Verify email
3. Wait for approval (usually 24 hours)

### 3. Access Merchant Dashboard

Once approved:
- Login to [merchant.sepay.vn](https://merchant.sepay.vn)
- Go to **Settings** → **API Keys**

---

## Step 2: Generate API Credentials

### Get Your Keys

In merchant dashboard:

1. **Settings** → **API Configuration**
2. You'll see:
   ```
   API Key:        Your_API_Key_123abc
   Secret Key:     Your_Secret_Key_xyz789
   Merchant ID:    123456
   ```

3. Copy these into `.env`:

```env
SEPAY_API_KEY=Your_API_Key_123abc
SEPAY_SECRET_KEY=Your_Secret_Key_xyz789
SEPAY_MERCHANT_ID=123456
```

---

## Step 3: Configure Webhook

The webhook is how SePay notifies your backend when payment is received.

### 1. Set Webhook URL

In SePay merchant dashboard:
- **Settings** → **Webhook**
- Set webhook URL:
  ```
  https://your-domain.com/api/payments/webhook
  ```

**During development (localhost):**
- Use a tunnel: `ngrok http 5000`
- Or deploy to Railway first, then test

### 2. Test Webhook

In SePay dashboard → **Settings** → **Test Webhook**
- Click **Send Test**
- Backend should log webhook receipt
- Status: ✅ Success

---

## Step 4: Bank Account Setup

### Link Your Bank Account

1. In SePay dashboard → **Bank Accounts**
2. Add your receiving bank account:
   - **Bank Name**: (select from dropdown)
   - **Account Number**: Your bank account
   - **Account Holder**: Your name
   - **Account Type**: Checking/Savings

3. Verify via OTP sent to your registered phone

---

## Step 5: Test Payment Flow

### Local Testing (without real money)

```bash
# 1. Start backend
cd backend
npm run dev

# 2. In another terminal, create test order
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Nguyen Test",
    "phone": "0901234567",
    "address": "123 Test Street",
    "productName": "Test Product",
    "quantity": 1,
    "amount": 100000
  }'

# 3. Create payment QR
curl -X POST http://localhost:5000/api/payments/create-qr \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-123456",
    "amount": 100000,
    "description": "Test payment"
  }'

# Expected response:
{
  "qrCode": "00020126360...",
  "orderId": "ORD-123456",
  "amount": 100000,
  "status": "pending"
}
```

### Scan & Pay (Test Mode)

1. Open generated QR in SePay merchant dashboard
2. In test mode: Payment is simulated
3. Check Telegram notification (should receive order alert)
4. Check backend logs for webhook receipt

---

## Payment QR Formats

### Dynamic QR (Per Transaction)

**Best for:** E-commerce orders

```javascript
const qrData = {
  orderId: "ORD-2026-001",
  amount: 250000,
  description: "Order #1"
};

// Backend generates unique QR for each order
const qr = await sepay.createQRCode(qrData);
// Response: QR code image
```

### Static QR (One Code, Multiple Payments)

**Best for:** Business cards, posters

```javascript
const staticQR = await sepay.generateVietQRStatic(
  accountNumber: "1234567890",
  bankCode: "MB", // Techcombank
  amount: 0  // No fixed amount
);
// Customers can transfer any amount
```

---

## Supported Banks (VietQR)

All 30+ Vietnamese banks support QR transfer:

| Bank | Code | Note |
|------|------|------|
| Techcombank | MB | Fast, reliable |
| Vietcombank | VCB | Largest bank |
| BIDV | BIDV | Government bank |
| ACB | ACB | Tech-friendly |
| TPB | TPB | Popular |
| VPB | VPB | Popular |
| Agribank | AGR | Rural areas |
| MBB | MBB | Mobile |
| SHB | SHB | SME friendly |

---

## Webhook Integration

### What is Webhook?

Webhook = Automated notification from SePay to your backend when payment is received.

### Sample Webhook Payload

```json
{
  "transactionId": "TXN-123456",
  "orderId": "ORD-2026-001",
  "amount": 250000,
  "status": "success",
  "bankTransactionId": "B123456789",
  "paymentMethod": "vietqr_transfer",
  "timestamp": 1687234567,
  "signature": "abc123def456..."
}
```

### Verify Webhook Signature

```javascript
// In backend/api/payments.js
const isValid = sepay.verifyPaymentSignature(webhookData);

if (!isValid) {
  console.warn('Invalid webhook signature - possible fraud');
  return res.status(401).json({ error: 'Invalid signature' });
}

// Process payment
console.log(`Payment received: ₫${webhookData.amount}`);
```

---

## Order Status Flow

```
1. Customer creates order
   └─ Status: pending_payment

2. Customer scans QR → Transfers money
   └─ (waiting for confirmation)

3. SePay processes transfer
   └─ Sends webhook to your backend

4. Backend receives webhook
   └─ Update order status: paid
   └─ Send Telegram notification
   └─ Trigger fulfillment

5. Admin confirms shipment
   └─ Status: shipped
```

---

## Troubleshooting

### Problem: QR Code Not Generating

**Solution:**
```bash
# Check API credentials in .env
echo $SEPAY_API_KEY  # Should not be empty

# Verify webhook URL is accessible
curl https://your-domain.com/api/payments/webhook
# Should return 200 OK
```

### Problem: Webhook Not Received

**Cause**: Webhook URL incorrect or not publicly accessible

**Solution**:
1. Verify webhook URL in SePay dashboard
2. For localhost: Use ngrok tunnel
   ```bash
   ngrok http 5000
   # Use the ngrok URL as webhook
   ```
3. Check backend logs: `DEBUG=* npm run dev`

### Problem: Invalid Signature Error

**Cause**: Secret key incorrect or webhook payload corrupted

**Solution**:
1. Verify SEPAY_SECRET_KEY in `.env`
2. Log incoming webhook: `console.log(req.body)`
3. Contact SePay support if persists

### Problem: Payment Shows as Pending

**Cause**: Bank didn't process transfer yet, or webhook delayed

**Solution**:
1. Wait 5-10 minutes for bank processing
2. Check "Transactions" in SePay dashboard
3. If still pending: Check bank account for incoming transfer

---

## Production Checklist

- [ ] Use LIVE API keys (not test keys)
- [ ] HTTPS enabled (not HTTP)
- [ ] Webhook URL publicly accessible
- [ ] Webhook signature verification enabled
- [ ] Order status updated automatically
- [ ] Telegram notifications sent
- [ ] Fulfillment process tested
- [ ] Error handling in place
- [ ] Monitoring/logging set up
- [ ] SePay support contact saved

---

## Live Payment Flow Example

### Customer Perspective

1. Customer adds product to cart
2. Clicks "Thanh Toán" (Pay)
3. Sees QR code + payment instructions
4. Opens their bank app
5. Scans QR code
6. Reviews amount (₫250,000)
7. Enters PIN
8. Confirms transfer
9. Receives confirmation from bank
10. Website auto-refreshes → Order confirmed!

### Backend Perspective

```
1. POST /api/payments/create-qr
   ├─ Validate order
   ├─ Call SePay API
   └─ Return QR code image

2. Customer transfers money
   └─ Bank processes transfer

3. SePay receives payment confirmation
   └─ Sends webhook to /api/payments/webhook

4. Backend receives webhook
   ├─ Verify signature
   ├─ Update order status → paid
   ├─ Send Telegram notification
   └─ Trigger fulfillment (print label, pack)
```

---

## Fees & Rates

**Good news:** Most SePay accounts have **0% commission** on VietQR transfers!

**SePay only charges:**
- Merchant registration: Free
- API calls: Free
- Transactions: 0% (unless negotiated)

---

## Support

- **SePay Help**: [support.sepay.vn](https://support.sepay.vn)
- **Email**: support@sepay.vn
- **Chat**: Available in merchant dashboard

---

**Payment setup complete!** 🎉 Your store is now ready to accept orders.

Next: Go to [DEPLOYMENT.md](DEPLOYMENT.md) to launch live.
