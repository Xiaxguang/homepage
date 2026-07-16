# PayPal Live Deployment

這份清單用於把 Xiaxguang Beat 商店從 PayPal Sandbox 安全切換到 PayPal Live。不要把 Client Secret、Webhook ID、Supabase service role key 或任何 `.env` 檔提交到 GitHub。

## 目前架構

- 前端頁面：`beats.html`
- 前端商店邏輯：`beats-store.js`
- 公開設定：`config.js`
- Supabase Edge Functions：
  - `paypal-create-order`
  - `paypal-capture-order`
  - `paypal-webhook`
  - `order-downloads`
- Webhook URL：
  - `https://vvxozxwdblhiprhvtkic.supabase.co/functions/v1/paypal-webhook`

## 前端公開設定

`config.js` 只能放公開資料：

- PayPal Sandbox Client ID
- PayPal Live Client ID
- Supabase Project URL
- Supabase publishable key
- Edge Function base URL
- 授權商品 UUID 或公開商品識別

不得放入：

- PayPal Client Secret
- PayPal Webhook ID
- Supabase service role key
- Supabase Secret Key
- access token
- download token

## Sandbox 設定

Supabase Secrets：

```text
PAYPAL_MODE=sandbox
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
STORE_ALLOWED_ORIGIN=https://xiaxguang.github.io
SUPABASE_SERVICE_ROLE_KEY=
```

前端 `config.js`：

```js
store: {
  mode: "sandbox",
  paypalClientIds: {
    sandbox: "Sandbox Client ID",
    live: ""
  }
}
```

## Live 切換步驟

1. 在 PayPal Developer 建立 Live App。
2. 取得 Live Client ID。
3. 取得 Live Client Secret。
4. 建立 Live Webhook。
5. Webhook URL 設為 `https://vvxozxwdblhiprhvtkic.supabase.co/functions/v1/paypal-webhook`。
6. 勾選以下 Webhook events：
   - `CHECKOUT.ORDER.APPROVED`
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.PENDING`
   - `PAYMENT.CAPTURE.DECLINED`
   - `PAYMENT.CAPTURE.REFUNDED`
   - `PAYMENT.CAPTURE.REVERSED`
   - `CUSTOMER.DISPUTE.CREATED`
   - `CUSTOMER.DISPUTE.UPDATED`
   - `CUSTOMER.DISPUTE.RESOLVED`
7. 取得 Live Webhook ID。
8. 在 Supabase Secrets 設定正式環境：

```text
PAYPAL_MODE=live
PAYPAL_API_BASE=https://api-m.paypal.com
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
STORE_ALLOWED_ORIGIN=https://xiaxguang.github.io
SUPABASE_SERVICE_ROLE_KEY=
```

9. 重新部署 Edge Functions。
10. 將 `config.js` 改成：

```js
store: {
  mode: "live",
  paypalClientIds: {
    sandbox: "Sandbox Client ID",
    live: "Live Client ID"
  }
}
```

11. 部署 GitHub Pages。
12. 開啟 `https://xiaxguang.github.io/homepage/beats.html`，確認頁面顯示正式收款模式。
13. 使用低金額商品完成一筆真實付款測試。
14. 確認 `orders.status` 變成 `COMPLETED`。
15. 確認 `order-downloads` 只在有效訂單回傳 signed URL。
16. 確認 signed URL 約 5 分鐘後失效。
17. 測試退款或撤銷後，下載資格會被停用並回傳 403。

## Edge Functions 檢查

`paypal-create-order`：

- 只接受有效 `license_id`。
- 從 Supabase 讀取商品價格與幣別，不信任前端傳來的金額。
- 只允許 `is_active=true` 的商品與授權方案。
- PayPal order 金額必須與資料庫一致。

`paypal-capture-order`：

- 只能用 PayPal Order ID 完成 capture。
- capture 金額、幣別、狀態必須與本地訂單一致。
- 只有 PayPal Capture `COMPLETED` 才能建立或啟用 `download_token`。
- 不要因為前端送出請求就直接把訂單標示為 `COMPLETED`。

`paypal-webhook`：

- 必須驗證 PayPal webhook signature。
- 必須使用 `PAYPAL_WEBHOOK_ID`。
- 已處理過的 event id 要回傳 `IGNORED` 或保持冪等，不可重複入帳。
- `REFUNDED`、`REVERSED`、dispute 事件需停用下載資格。

`order-downloads`：

- 只允許 `orders.status === COMPLETED`。
- 檢查 `download_revoked_at` 是否為空。
- 檢查下載憑證仍有效。
- 只回傳 private storage signed URL。
- 不回傳 storage path、bucket 管理資訊或永久下載連結。

## Rollback

若 Live 付款異常：

1. 將 Supabase Secrets 改回 Sandbox：

```text
PAYPAL_MODE=sandbox
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
```

2. 重新部署 Edge Functions。
3. 將 `config.js` 的 `store.mode` 改回 `sandbox`。
4. 重新部署 GitHub Pages。
5. 檢查 `beats.html` 顯示 Sandbox 測試模式。

## 上線前安全掃描

部署前確認：

- GitHub 沒有 `.env`。
- 前端沒有 `PAYPAL_CLIENT_SECRET`。
- 前端沒有 `SUPABASE_SERVICE_ROLE_KEY`。
- 前端沒有 `service_role` 或 `sb_secret`。
- 前端沒有 `download_token` 出現在 URL、DOM 顯示文字或 console。
- `paypal-test.html` 不存在。
- `paid-downloads` bucket 不是 public。
- RLS 與 Edge Function 權限已檢查。
- Webhook 可以成功驗證 Live event。
