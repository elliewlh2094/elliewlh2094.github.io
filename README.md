# Ellie's Robot Notebook

這是使用 Astro 建立的機器人探索筆記網站。網站內容以 Markdown 維護，適合逐步累積機器人研究、Side project、AI 工具實作、遊戲心得與手作紀錄。

## 本機開發

```bash
npm install
npm run dev
```

建置正式網站：

```bash
npm run build
```

預覽建置結果：

```bash
npm run preview
```

驗證正式輸出：

```bash
npm run verify
```

`npm run verify` 會依目前 `draft: false` 的內容動態檢查公開頁面、草稿排除、封面資源與主要預覽頁面。

## 維護文件

- `AGENTS.md`：維護規則、內容模型、驗證原則與修改慣例。
- `docs/project-execution-plan.md`：第一版目前狀態、優先順序與範圍控制。
- `docs/technical-troubleshooting-guide.md`：建置、驗證、內容集合與版面異常的處理方式。
- `docs/specs/site-maintainability-prd.md`：第二階段維護優先重整的產品需求文件。
- `docs/plans/site-maintainability-task-plan.md`：對應 PRD 的實作計畫與任務拆解。
- `docs/site-future-optimization-directions.md`：頁面內容完整度、視覺呈現與作品說服力的後續方向。

## 新增文章

在 `src/content/blog` 新增 Markdown 檔案，例如：

```text
src/content/blog/my-note.md
```

文章模板：

```md
---
title: "文章標題"
description: "文章摘要，會顯示在列表與社群預覽中。"
pubDate: 2026-04-16
updatedDate: 2026-04-20
category: "AI 工具實作"
tags: ["標籤一", "標籤二"]
cover: "/images/blogs/my-note.png"
coverAlt: "文章封面替代文字"
featured: true
draft: false
---

這裡撰寫文章內容。
```

設定 `draft: true` 時，文章不會出現在正式網站，也不會產生文章頁。

文章的 `cover` 可省略。省略時，文章卡片與文章頁會顯示格線占位圖面；使用圖片時，建議放在 `public/images/blogs`，路徑以 `/images/blogs/...` 開頭。若有封面，建議一併提供 `coverAlt`，讓封面圖片有明確替代文字。

## 新增專案

在 `src/content/projects` 新增 Markdown 檔案，例如：

```text
src/content/projects/my-project.md
```

專案模板：

```md
---
title: "專案名稱"
description: "專案摘要，會顯示在專案列表。"
cover: "/images/projects/my-project.png"
coverAlt: "專案封面替代文字"
category: "機器人研究"
summary:
  - "讀者看完這個專案後會理解的重點一。"
  - "讀者看完這個專案後會記得的重點二。"
tech: ["Astro", "Markdown"]
tags: ["視覺化", "工具開發"]
repo: "https://github.com/elliewlh2094/example"
demo: "https://example.com"
featured: true
order: 1
draft: false
---

這裡撰寫專案背景、你負責的部分、技術選擇與成果。
```

欄位說明：

- `cover`：專案封面圖，可省略；建議放在 `public/images/projects`。
- `category`：專案分類，例如機器人研究或開源工具。
- `summary`：專案重點摘要，必須 1 到 3 句，用來說明讀者看完後會了解、學到或記得什麼。
- `tech`：技術標籤。
- `tags`：顯示用主題標籤，可省略，預設為空陣列。
- `coverAlt`：封面圖片替代文字，可省略；有封面時建議提供。
- `repo`：程式碼連結，可省略。
- `demo`：展示連結，可省略。
- `featured`：是否出現在首頁精選專案。
- `order`：專案排序，數字越小越前面。
- `draft`：設定為 `true` 時不發布。

新增或調整正式內容後，先執行 `npm run build`；若涉及公開內容、草稿狀態、圖片輸出或路由，再執行 `npm run verify`。

## 放置圖片

公開圖片放在 `public/images`。例如：

```text
public/images/blogs/my-note.png
public/images/profile.png
public/images/projects/my-project.png
```

在 Markdown 或元件中使用時，路徑從網站根目錄開始：

```md
![專案截圖](/images/projects/my-project.png)
```

## 專案結構

```text
src/content/blog/        部落格
src/content/projects/    專案內容
src/components/          共用 UI 元件
src/lib/                 共用查詢、站點設定與顯示資料整理
src/layouts/             頁面版型
src/pages/               網站頁面與路由
src/styles/              樣式入口與分層樣式模組
public/images/           公開圖片
```

內容、頁面、元件、共用查詢與樣式彼此分離。更新文章與專案時主要修改 `src/content`，調整 UI 時主要修改 `src/components`、`src/layouts` 與 `src/styles`；調整發布規則、排序與站點共用設定時主要修改 `src/lib`。

## 部署

推送到 `main` 分支後，GitHub Actions 會自動執行建置並發布到 GitHub Pages。

正式網址：

```text
https://elliewlh2094.github.io/
```
