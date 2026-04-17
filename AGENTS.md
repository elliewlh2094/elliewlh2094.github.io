# 專案代理指引

## 專案定位

這是使用 Astro（Astro）建立的靜態個人品牌網站，內容以 Markdown（Markdown）維護，並部署到 GitHub Pages（GitHub Pages）。

網站包含首頁、關於頁、專案列表、文章列表、專案內容頁與文章內容頁。主要目標是用專案、文章與工作紀錄呈現個人專業能力。

## 技術棧

- 使用 Astro 5。
- 網站輸出模式為靜態輸出，設定在 `astro.config.mjs`。
- 內容使用 Astro 內容集合（content collections）管理。
- 部落格文章與專案資料使用 Markdown 檔案維護。
- 全站樣式集中在 `src/styles/global.css`。
- 推送到 `main` 分支後，GitHub Actions（GitHub Actions）會建置並發布到 GitHub Pages。

## 主要目錄

- `src/content/blog`：部落格文章。
- `src/content/projects`：專案資料。
- `src/components`：共用介面元件。
- `src/layouts`：頁面版型。
- `src/pages`：網站頁面與路由。
- `src/styles/global.css`：全站樣式。
- `public/images`：公開圖片資源。
- `scripts/verify-site.mjs`：建置輸出與預覽頁面檢查腳本。

## 開發指令

- `npm install`：安裝相依套件。
- `npm run dev`：啟動本機開發伺服器。
- `npm run build`：建置靜態網站。
- `npm run preview`：預覽建置結果。
- `npm run verify`：檢查建置輸出與預覽頁面。

## 內容維護規則

- 新增文章時，在 `src/content/blog` 新增 `.md` 檔案。
- 新增專案時，在 `src/content/projects` 新增 `.md` 檔案。
- 前置資料（frontmatter）欄位必須符合 `src/content.config.ts` 的內容集合定義。
- 文章欄位包含 `title`、`description`、`pubDate`、`tags`、`draft`。
- 專案欄位包含 `title`、`description`、`cover`、`tech`、`repo`、`demo`、`featured`、`order`、`draft`。
- `draft: true` 代表草稿，正式頁面與建置輸出應排除草稿內容。
- 專案封面圖片放在 `public/images`，路徑以 `/images/...` 開頭。
- 內容文字以繁體中文為主，保持清楚、具體、專業的技術文件語氣。

## 程式修改規則

- 優先沿用既有 Astro 元件、版型與全站樣式。
- 調整頁面結構時，先確認 `src/pages`、`src/layouts` 與 `src/components` 的既有分工。
- 調整介面樣式時，先使用 `src/styles/global.css` 既有階層式樣式表（CSS）變數與樣式規則。
- 新增元件時，保持元件職責單一，並沿用目前 `.astro` 元件寫法。
- 避免加入未使用的套件、過度抽象或與現有架構不一致的工具。
- 修改文案時，保持網站定位一致：個人品牌、專案展示、文章整理與工作紀錄。

## 驗證規則

- 修改內容、頁面、元件或樣式後，執行 `npm run build`。
- 涉及路由、草稿排除、圖片輸出或部署結果時，執行 `npm run verify`。
- 只修改文件時，確認 Markdown 格式與專案事實一致即可。
- 發布前確認 `.github/workflows/deploy.yml` 仍以 `npm ci` 與 `npm run build` 建置網站。

## 維護注意事項

- 不要把 `dist` 當成主要編輯來源；正式內容應從 `src` 與 `public` 維護。
- 不要手動修改 `node_modules`。
- 圖片路徑與內容集合欄位變更會影響建置結果，修改後要重新驗證。
- 新增長篇文章、專案頁或設計方向時，可同步更新 `README.md` 或 `design-references.md`，讓維護資訊保持一致。
