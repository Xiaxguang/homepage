# Xiaxguang Music Portfolio

## 已更新內容

- 名稱：Xiaxguang／阿光
- Instagram：xiaxguang
- LINE：bikabikahikari
- 公開頁已移除「可上傳音檔、影片、作品連結」等管理用途的說明文字
- 作品、服務、混音前後對比與聯絡方式可從 `admin.html` 管理

## GitHub Pages 發布

1. 將所有檔案放到 GitHub repository 根目錄。
2. GitHub → Settings → Pages。
3. Source 選擇 `Deploy from a branch`。
4. Branch 選 `main`，Folder 選 `/(root)`。
5. 公開頁：`/index.html`
6. 管理頁：`/admin.html`

## 角色圖片

將角色透明背景圖片放入：

- `assets/characters/mascot-wave.png`
- `assets/characters/mascot-crossed.png`
- `assets/characters/mascot-peace.png`
- `assets/characters/mascot-walk.png`
- `assets/characters/mascot-seated.png`

網站目前會使用 `mascot-wave.png` 與 `mascot-seated.png`。若圖片尚未放入，版面仍會正常顯示。

## Supabase

未設定 Supabase 時，後台資料只會存在目前瀏覽器的 localStorage。

要讓所有訪客看到後台修改內容：

1. 建立 Supabase 專案。
2. 執行 `supabase-schema.sql`。
3. 建立公開 Storage bucket：`portfolio-media`。
4. 在 `config.js` 填入 Supabase URL 與 anon key。
5. 正式使用前，建議替 `admin.html` 加上 Supabase Auth，並限制資料庫與 Storage 寫入權限。
