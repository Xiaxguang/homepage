# XIAXGUANG Music Producer Portfolio

純前端作品集網站，可直接部署到 GitHub Pages。公開頁使用 `index.html`，後台使用 `admin.html`，內容可存在 localStorage 或 Supabase `site_content.content` JSON。

## 主要內容

- 品牌固定：`XIAXGUANG`
- 副標固定：`MUSIC PRODUCER`
- 中文稱呼：`阿光`
- 公開頁包含 Hero、最新作品播放器、服務摘要、精選作品、Beats 商店、完整作品集、混音前後對比、關於我、製作流程與聯絡區
- 後台可管理基本資料、視覺設定、區塊顯示排序、服務、作品、Beats、製作流程與混音對比

## 素材

角色圖片放在：

- `assets/characters/mascot-seated.png`
- `assets/characters/mascot-wave.png`
- `assets/characters/mascot-crossed.png`
- `assets/characters/mascot-peace.png`
- `assets/characters/mascot-walk.png`

網站圖片素材放在：

- `assets/media/studio-hero.webp`
- `assets/media/cover-echo.webp`
- `assets/media/cover-moon-gate.webp`
- `assets/media/cover-crystal.webp`
- `assets/media/beat-night-drive.webp`
- `assets/media/cover-spectrum.webp`
- `assets/media/studio-notes.webp`

所有網站路徑皆使用相對路徑，適合專案型 GitHub Pages。

## 資料欄位

`default-content.js` 保留原本欄位：

- `profile`
- `services`
- `works`
- `comparisons`

並新增：

- `appearance`：主色、Hero 背景、Hero 角色、About 角色
- `sections`：區塊顯示與排序
- `process`：製作流程
- `beats`：Beat 商店資料

舊 JSON 缺少新欄位時，前台與後台會自動補預設值。

## GitHub Pages 發布

1. 將檔案放在 repository 根目錄。
2. GitHub → Settings → Pages。
3. Source 選 `Deploy from a branch`。
4. Branch 選 `main`，Folder 選 `/(root)`。
5. 公開頁：`/index.html`
6. 管理頁：`/admin.html`

## Supabase

未設定 Supabase 時，後台資料只會存在目前瀏覽器的 localStorage。

要讓訪客看到後台修改內容：

1. 建立 Supabase 專案。
2. 執行 `supabase-schema.sql`。
3. 建立公開 Storage bucket：`portfolio-media`。
4. 在 `config.js` 填入 Supabase URL 與 anon key。
5. 正式使用前，建議替 `admin.html` 加上 Supabase Auth，並限制資料庫與 Storage 寫入權限。
