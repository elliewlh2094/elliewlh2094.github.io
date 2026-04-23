# 第二階段維護優先重整工作分解

## 概要

這份計畫依照維護優先重整 PRD 拆成可驗證的任務。執行順序以依賴關係為主，先整理資料層與站點設定，再整理頁面責任與樣式層，最後補齊文件與驗證。

## 架構決策

- 保留既有 Astro 路由與元件結構。
- 新增 `src/lib` 作為共用查詢與站點設定層。
- 保留 `src/styles/global.css` 作為樣式入口，底下拆成少數模組。
- 內容模型只做相容式新增欄位。

## 任務清單

### 階段一：資料層與站點設定

- [x] 任務 1：建立文章與專案共用查詢函式
  - Acceptance：首頁、列表頁與詳細頁共用發布、排序與精選規則。
  - Verify：`npm run build`
  - Files：`src/lib/content/*`、`src/pages/**/*`

- [x] 任務 2：集中站點設定與頁面中繼資料
  - Acceptance：站名、預設描述、導覽與頁尾資訊集中管理。
  - Verify：`npm run build`
  - Files：`src/lib/site/*`、`src/layouts/BaseLayout.astro`、`src/components/*`

- [x] 任務 3：整理顯示資料責任邊界
  - Acceptance：卡片元件只接收顯示資料，不直接處理集合邏輯。
  - Verify：`npm run build`
  - Files：`src/components/*`、`src/pages/**/*`

### 檢查點 A

- [ ] 建置通過
- [ ] 首頁、文章列表、專案列表內容數量與整理前一致

### 階段二：內容模型與樣式層

- [x] 任務 4：擴充最小內容模型
  - Acceptance：`blog` 與 `projects` 支援 `coverAlt`，`projects` 支援 `tags`。
  - Verify：`npm run build`
  - Files：`src/content.config.ts`、`README.md`、`AGENTS.md`

- [x] 任務 5：拆分樣式入口與樣式模組
  - Acceptance：保留單一入口，實際樣式拆成基礎、版型、元件、內容頁模組。
  - Verify：`npm run build`、`npm run verify`
  - Files：`src/styles/*`

### 檢查點 B

- [ ] 建置通過
- [ ] 驗證通過
- [ ] 主要頁面視覺維持一致

### 階段三：文件與後續方向

- [x] 任務 6：新增 PRD 與工作分解文件
  - Acceptance：文件包含目標、成功條件、邊界與驗證方式。
  - Verify：人工檢查 Markdown 內容與路徑
  - Files：`docs/specs/*`、`docs/plans/*`

- [x] 任務 7：新增未來優化方向文件
  - Acceptance：記錄頁面內容完整度、視覺呈現、作品說服力三條主線。
  - Verify：人工檢查文件內容與 PRD 一致
  - Files：`docs/site-future-optimization-directions.md`

- [x] 任務 8：同步維護文件
  - Acceptance：`README.md` 與 `AGENTS.md` 反映新的樣式與內容模型結構。
  - Verify：人工檢查文件內容與實作一致
  - Files：`README.md`、`AGENTS.md`

### 檢查點 C

- [ ] 建置通過
- [ ] 驗證通過
- [ ] 文件內容與實際結構一致

## 風險與對策

| 風險 | 影響 | 對策 |
|---|---|---|
| 共用層抽太多 | 中 | 每個共用函式都必須消除多個實際重複點 |
| 內容模型變更牽動既有內容 | 中 | 只新增可選欄位或有預設值的欄位 |
| 樣式拆分造成回歸 | 高 | 維持 class 名稱與入口不變，拆分後立即驗證 |
| OneDrive 或沙盒權限影響建置 | 中 | 必要時以提升權限重跑建置與驗證 |

## 最終驗收

- [ ] `npm run build`
- [ ] `npm run verify`
- [ ] 首頁、關於頁、文章列表、專案列表、文章詳細頁、專案詳細頁、`longform-demo` 人工檢查完成
- [ ] 文件與實作一致
