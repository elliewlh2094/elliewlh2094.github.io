# Ellie's Robot Notebook

這是使用 Astro 建立的機器人探索筆記網站。網站內容以 Markdown 維護，適合逐步累積機器人研究、副專案、AI 工具實作、遊戲心得與手作紀錄。

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
category: "AI 工具實作"
tags: ["標籤一", "標籤二"]
cover: "/images/blog/my-note.png"
featured: true
draft: false
---

這裡撰寫文章內容。
```

設定 `draft: true` 時，文章不會出現在正式網站，也不會產生文章頁。

文章的 `cover` 可省略。省略時，文章卡片與文章頁會顯示格線占位圖面；使用圖片時，建議放在 `public/images`，路徑以 `/images/...` 開頭。

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
category: "機器人研究"
summary:
  - "讀者看完這個專案後會理解的重點一。"
  - "讀者看完這個專案後會記得的重點二。"
tech: ["Astro", "Markdown"]
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
- `repo`：程式碼連結，可省略。
- `demo`：展示連結，可省略。
- `featured`：是否出現在首頁精選專案。
- `order`：專案排序，數字越小越前面。
- `draft`：設定為 `true` 時不發布。

## 放置圖片

公開圖片放在 `public/images`。例如：

```text
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
src/layouts/             頁面版型
src/pages/               網站頁面與路由
src/styles/              全站樣式
public/images/           公開圖片
```

內容、頁面、元件與樣式彼此分離。更新文章與專案時主要修改 `src/content`，調整 UI 時主要修改 `src/components`、`src/layouts` 與 `src/styles`。

## 部署

推送到 `main` 分支後，GitHub Actions 會自動執行建置並發布到 GitHub Pages。

正式網址：

```text
https://elliewlh2094.github.io/
```
