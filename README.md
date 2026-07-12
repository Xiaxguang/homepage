# 阿光音樂作品集＋管理員後台

這個版本可直接放在 GitHub Pages，並新增：

- `admin.html` 管理後台
- 編輯網站名稱、首頁文字、配色與角色圖片
- 控制作品、服務、流程、Beat 商店、關於我、聯絡區塊的顯示與順序
- 新增／刪除／排序作品與 Beat
- 上傳圖片、音檔、影片，或填入 YouTube、SoundCloud、Google Drive 等外部連結
- Supabase Email＋密碼登入
- Supabase Database 儲存網站內容
- Supabase Storage 儲存圖片、音訊與影片
- JSON 匯出／匯入備份
- 本機測試模式

網站視覺已改成深綠、炭黑、藍紫與暖棕，並放入目前產出的 3D 角色圖。

## 一、先測試網站

直接開啟 `index.html` 可以查看新版作品集。

開啟 `admin.html` 時，如果 `config.js` 尚未設定，會出現「本機測試模式」。這個模式可測試所有編輯功能，但修改只會存在同一台電腦、同一個瀏覽器，其他訪客看不到。

## 二、建立真正的線上後台

GitHub Pages 只能發布 HTML、CSS、JavaScript 等靜態檔案，本身不會替你保存後台資料或接收檔案，因此這個版本使用 Supabase 作為後端。

### 1. 建立 Supabase 專案

登入 Supabase，建立新專案。

### 2. 執行資料庫設定

進入：

`SQL Editor → New query`

貼上 `supabase-schema.sql` 全部內容並執行。

SQL 已將管理員限制為：

`a26926291@gmail.com`

若管理員不是這個 Email，必須同時修改：

- `supabase-schema.sql` 裡的 Email
- `config.js` 裡的 `adminEmail`

### 3. 建立管理員帳號

進入：

`Authentication → Users → Add user`

建立：

- Email：`a26926291@gmail.com`
- 密碼：自行設定一組強密碼
- 建議勾選自動確認 Email

### 4. 填入 Supabase 設定

在 Supabase 進入：

`Project Settings → Data API`

找到：

- Project URL
- anon / publishable key

打開 `config.js`，填入：

```js
window.PORTFOLIO_CONFIG = {
  supabaseUrl: "你的 Project URL",
  supabaseAnonKey: "你的 anon 或 publishable key",
  adminEmail: "a26926291@gmail.com",
  storageBucket: "portfolio-media"
};
```

不要把 `service_role` key 放進網站。前端只使用 anon／publishable key，實際權限由 SQL 裡的 RLS 保護。

### 5. 首次登入與發布內容

重新開啟 `admin.html`，使用剛建立的管理員帳號登入。

第一次按下「儲存並發布」後，Supabase 會建立 `site_content` 的 `main` 資料，公開網站便會自動讀取線上內容。

## 三、上傳到 GitHub Pages

將這個資料夾內的所有檔案直接放到 Repository 根目錄，確保 Repository 首頁可直接看到：

```text
index.html
admin.html
styles.css
admin.css
app.js
admin.js
default-content.js
config.js
supabase-schema.sql
assets/
```

接著在 GitHub Repository：

`Settings → Pages → Deploy from a branch → main → /(root) → Save`

公開網站：

`https://你的帳號.github.io/Repository名稱/`

管理後台：

`https://你的帳號.github.io/Repository名稱/admin.html`

## 四、媒體使用建議

- 封面／角色圖片：直接上傳到後台。
- MP3 試聽：可直接上傳 Supabase Storage。
- WAV 檔通常很大，公開試聽建議另外輸出 MP3。
- 長影片建議上傳 YouTube 後貼連結，可減少 Storage 用量與網站流量。
- 後台目前限制單檔 100 MB。
- Beat 正式販售、付款後自動下載與授權書，仍需要再串接金流與訂單系統。

## 五、安全提醒

`admin.html` 的網址並不是安全機制；真正的保護來自 Supabase Auth 與 RLS。即使其他人知道後台網址，沒有指定管理員帳號也不能修改資料或上傳檔案。
