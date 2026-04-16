# elliewlh2094 個人品牌網站

這是使用 Astro 建立的個人品牌網站第一版。網站內容以 Markdown 維護，適合逐步累積個人介紹、程式專案與部落格文章。

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
tags: ["標籤一", "標籤二"]
draft: false
---

這裡撰寫文章內容。
```

設定 `draft: true` 時，文章不會出現在正式網站，也不會產生文章頁。

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

- `cover`：專案封面圖，建議放在 `public/images/projects`。
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
src/content/blog/        部落格文章
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
