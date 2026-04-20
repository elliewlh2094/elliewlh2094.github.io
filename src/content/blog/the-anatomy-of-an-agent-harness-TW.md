---
title: "代理外殼的剖析（The Anatomy of an Agent Harness）"
description: "撈到一篇解析各種 Harness 產品後，整理出一個好的生產級外殼應該具備什麼東西。翻成中文弄成 MD 格式供參。"
pubDate: 2026-04-20
category: "好文翻譯"
tags: ["好文翻譯", "X articles"]
cover: "/images/blogs/screenshot_2026-04-20 222336.png"
featured: true
draft: false
---

>本篇文章的 Markdown 檔案放在[這裡](https://gist.github.com/elliewlh2094/d3404ddebdc54cd0007eca0ad5a01224)。


作者：Akshay 🚀@akshay_pachaar\
日期：4月6日\
連結：[The Anatomy of an Agent Harness](https://x.com/akshay_pachaar/status/2041146899319971922?s=20)

深入解析 Anthropic、OpenAI、Perplexity 與 LangChain 實際上正在建構的東西。內容涵蓋協調迴圈（orchestration loop）、工具（tools）、記憶（memory）、脈絡管理（context management），以及其他所有能把無狀態大型語言模型（LLM）轉換成有能力代理（agent）的要素。

你已經做出聊天機器人。也許你已經把 ReAct 迴圈接上幾個工具，它可以用於展示。接著你嘗試打造可上線等級的東西，問題就會浮現：模型忘記三步前做過什麼，工具呼叫默默地失敗，脈絡視窗塞滿垃圾。

問題不在你的模型，而在模型周圍的一切。

LangChain 證明了這一點：他們只改變包住 LLM 的基礎設施（同一個模型、同一組權重），就從 TerminalBench 2.0 前 30 名之外躍升到第 5 名。另一個研究專案讓 LLM 自行最佳化基礎設施，達到 76.4% 通過率，超越人工設計的系統。

這個基礎設施現在有了名稱：**代理外殼（agent harness）**。

## 什麼是代理外殼？

這個術語在 2026 年初被正式化，但概念早已存在。外殼是包住 LLM 的完整軟體基礎設施：協調迴圈、工具、記憶、脈絡管理、狀態持久化、錯誤處理與護欄（guardrails）。Anthropic 的 Claude Code 文件說得很簡單：SDK 是「**驅動 Claude Code 的代理外殼**」。OpenAI 的 Codex 團隊使用相同框架，明確把「**代理**」與「**外殼**」等同起來，用來指稱讓 LLM 變得有用的**非模型基礎設施**。

我很喜歡 LangChain 的 Vivek Trivedy 提出的典範公式：「**如果你不是模型，你就是外殼。**」

以下是常讓人混淆的區別。「代理」是湧現行為（emergent behavior）：使用者互動的那個目標導向、使用工具、能自我修正的實體。外殼是產生該行為的機制。當有人說「我做了一個代理」時，他們的意思是他們建構了一個外殼，並把它指向一個模型。

<figure>
  <img src="/images/blogs/anatomy-harness-01.jpg" alt="外殼就是作業系統" />
</figure>

Beren Millidge 在 2023 年的文章「[有鷹架支撐的 LLM 作為自然語言電腦（Scaffolded LLMs as Natural Language Computers）](https://www.beren.io/2023-04-11-Scaffolded-LLMs-natural-language-computers/)」中精確說明了這個類比。原始 LLM 是一個沒有 RAM、沒有磁碟、沒有 I/O 的 CPU。脈絡視窗扮演 RAM（快速但有限）。外部資料庫作為磁碟儲存（容量大但慢）。工具整合則像裝置驅動程式。外殼就是作業系統。如 Millidge 所寫：「**我們重新發明了馮紐曼架構（Von Neumann architecture）**」，因為它是任何運算系統的自然抽象。

## 三層工程

模型周圍有三個同心工程層級：

- **提示工程（Prompt engineering）** 製作模型接收的指令。

- **脈絡工程（Context engineering）** 管理模型看見什麼，以及何時看見。

- **外殼工程（Harness engineering）** 涵蓋前兩者，再加上整個應用程式基礎設施：工具協調、狀態持久化、錯誤復原、驗證迴圈、安全強制執行與生命週期管理。

外殼不是包住提示的包裝器。它是讓自主代理行為成為可能的完整系統。

## 生產外殼的 12 個元件

綜合 Anthropic、OpenAI、LangChain 與更廣泛實務社群的經驗，生產級代理外殼有十二個不同元件。以下逐一說明。

<figure>
  <img src="/images/blogs/anatomy-harness-02.jpg" alt="生產外殼的 12 個元件" />
</figure>

### 1. 協調迴圈

這是心跳。它實作思考-行動-觀察（Thought-Action-Observation, TAO）循環，也稱為 ReAct 迴圈。迴圈的運作方式是：組裝提示、呼叫 LLM、解析輸出、執行任何工具呼叫、把結果送回去，重複直到完成。

從機制上看，它通常只是一個 while 迴圈。**複雜度存在於迴圈管理的一切事物中**，而不是迴圈本身。Anthropic 把他們的執行環境（runtime）描述為「笨迴圈（dumb loop）」，所有智慧都在模型裡。外殼只管理回合。

### 2. 工具

工具是代理的雙手。它們被定義成結構描述（schemas）：名稱、描述、參數型別，並注入 LLM 的脈絡，讓模型知道有哪些可用能力。工具層負責註冊、結構描述驗證、引數擷取、沙盒化執行、結果擷取，以及把結果格式化成 LLM 可讀的觀察。

Claude Code 提供六類工具：檔案操作、搜尋、執行、網頁存取、程式碼智慧與子代理產生。OpenAI 的 Agents SDK 支援函式工具（透過 [@function_tool](https://x.com/@function_tool)）、託管工具（WebSearch、CodeInterpreter、FileSearch）與 MCP 伺服器工具。

### 3. 記憶

記憶在多個時間尺度上運作。**短期記憶（Short-term memory）** 是單一工作階段內的對話歷史。**長期記憶（Long-term memory）** 會跨工作階段持久保存：Anthropic 使用 `CLAUDE.md` 專案檔與自動產生的 `MEMORY.md` 檔案；LangGraph 使用按命名空間組織的 JSON Stores；OpenAI 支援由 SQLite 或 Redis 支撐的 Sessions。

Claude Code 實作三層階層：輕量索引（每筆約 150 個字元，永遠載入）、按需求拉入的詳細主題檔，以及只能透過搜尋存取的原始逐字稿。一個關鍵設計原則是：**代理把自己的記憶當作「提示線索（hint）」，並在行動前對照實際狀態進行驗證。**

### 4. 脈絡管理

這是許多代理默默失敗的地方。核心問題是脈絡腐化（context rot）：**當關鍵內容落在視窗中段位置時，模型效能會下降 30% 以上**（Chroma 研究，並由 Stanford 的「Lost in the Middle」發現佐證）。即使是百萬 token 視窗，也會隨著脈絡增加而出現指令遵循能力下降。

生產策略包括：

- **壓縮（Compaction）**：接近限制時摘要對話歷史（Claude Code 會保留架構決策與未解決錯誤，同時捨棄重複的工具輸出）

- **觀察遮蔽（Observation masking）**：JetBrains 的 Junie 會隱藏舊工具輸出，同時保留可見的工具呼叫

- **即時擷取（Just-in-time retrieval）**：維持輕量識別碼並動態載入資料（Claude Code 使用 grep、glob、head、tail，而不是載入完整檔案）

- **子代理委派（Sub-agent delegation）**：每個子代理進行廣泛探索，但只回傳 1,000 到 2,000 token 的濃縮摘要

Anthropic 的脈絡工程指南說明了目標：找出**最小且訊號最高的 token 集合**，讓期望結果發生的可能性最大化。

### 5. 提示建構

這會組裝模型在每一步實際看見的內容。它是階層式的：系統提示、工具定義、記憶檔案、對話歷史，以及目前使用者訊息。

OpenAI 的 Codex 使用嚴格的優先順序堆疊：伺服器控制的系統訊息（最高優先）、工具定義、開發者指令、使用者指令（階層式 `AGENTS.md` 檔案，32 KiB 限制），接著是對話歷史。

### 6. 輸出解析

現代外殼仰賴原生工具呼叫，模型會回傳結構化 `tool_calls` 物件，而不是必須解析的自由文字。外殼會檢查：有工具呼叫嗎？執行它們並進入迴圈。沒有工具呼叫嗎？那就是最終答案。

針對結構化輸出，OpenAI 與 LangChain 都支援透過 Pydantic 模型提供受結構描述約束的回應。像 `RetryWithErrorOutputParser` 這類舊式做法（把原始提示、失敗完成結果與解析錯誤送回模型）仍可用於極端案例。

### 7. 狀態管理

LangGraph 把狀態建模為在圖節點之間流動的型別化字典，並由歸約器（reducers）合併更新。檢查點會發生在超步驟（super-step）邊界，讓中斷後恢復與時間旅行除錯（time-travel debugging）成為可能。OpenAI 提供四種互斥策略：應用程式記憶、SDK sessions、伺服器端 Conversations API，或輕量的 `previous_response_id` 串接。Claude Code 採取不同做法：**以 git 提交作為檢查點，並以進度檔案作為結構化暫存區。**

### 8. 錯誤處理

這件事重要的原因是：**一個 10 步流程即使每步成功率都有 99%，端到端成功率仍只有約 90.4%。** 錯誤會快速累積。

LangGraph 區分四種錯誤類型：暫時性錯誤（使用退避重試）、LLM 可復原錯誤（以 `ToolMessage` 回傳錯誤，讓模型調整）、使用者可修正錯誤（中斷並等待人類輸入），以及非預期錯誤（向上拋出以便除錯）。Anthropic 在工具處理器內捕捉失敗，並把它們作為錯誤結果回傳，以維持迴圈運行。Stripe 的生產外殼把重試次數上限設為兩次。

### 9. 護欄與安全

OpenAI 的 SDK 實作三個層級：輸入護欄（在第一個代理上執行）、輸出護欄（在最終輸出上執行），以及工具護欄（每次工具叫用時執行）。「絆線（tripwire）」機制會在觸發時立即停止代理。

Anthropic 在架構上把權限強制執行與模型推理分開。模型決定要嘗試什麼；工具系統決定什麼被允許。**Claude Code 會獨立控管約 40 個離散工具能力**，分成三個階段：專案載入時建立信任、每次工具呼叫前檢查權限，以及針對高風險操作要求明確的使用者確認。

### 10. 驗證迴圈

這就是玩具展示與生產代理之間的差異。Anthropic 建議三種做法：規則式回饋（測試、程式碼檢查器、型別檢查器）、視覺回饋（用於介面任務的 Playwright 截圖），以及 LLM 評審（由獨立子代理評估輸出）。

Claude Code 的建立者 Boris Cherny 指出，**給模型一種驗證自身工作的方式，可以讓品質提升 2 到 3 倍。**

### 11. 子代理協調

Claude Code 支援三種執行模型：分叉（Fork，父脈絡的位元組相同副本）、隊友（Teammate，使用檔案式信箱通訊的獨立終端窗格），以及工作樹（Worktree，每個代理有自己的 git 工作樹與隔離分支）。OpenAI 的 SDK 支援把代理作為工具（專家處理有界子任務）與交接（專家取得完整控制權）。LangGraph 把子代理實作為巢狀狀態圖。

## 運轉中的迴圈：逐步說明

現在你已經知道各元件，接著追蹤它們如何在單一循環中共同運作。

<figure>
  <img src="/images/blogs/anatomy-harness-03.jpg" alt="運轉中的迴圈" />
</figure>

**步驟 1（提示組裝）**：外殼建構完整輸入：系統提示 + 工具結構描述 + 記憶檔案 + 對話歷史 + 目前使用者訊息。重要脈絡會放在提示的開頭與結尾（「Lost in the Middle」發現）。

**步驟 2（LLM 推論）**：組裝好的提示送到模型 API。模型產生輸出 token：文字、工具呼叫請求，或兩者皆有。

**步驟 3（輸出分類）**：如果模型產生的是沒有工具呼叫的文字，迴圈結束。如果它請求工具呼叫，進入執行。如果請求交接，更新目前代理並重新開始。

**步驟 4（工具執行）**：針對每個工具呼叫，外殼會驗證引數、檢查權限、在沙盒環境中執行，並擷取結果。唯讀操作可以並行執行；變更性操作會依序執行。

**步驟 5（結果封裝）**：工具結果會格式化成 LLM 可讀的訊息。錯誤會被捕捉並作為錯誤結果回傳，讓模型能自我修正。

**步驟 6（脈絡更新）**：結果附加到對話歷史。如果接近脈絡視窗限制，外殼會觸發壓縮。

**步驟 7（迴圈）**：回到步驟 1。重複直到終止。

**終止條件**是分層的：模型產生沒有工具呼叫的回應、超過最大回合限制、token 預算耗盡、護欄絆線觸發、使用者中斷，或回傳安全拒絕。簡單問題可能需要 1 到 2 個回合。複雜重構任務可能跨越多個回合串接數十次工具呼叫。

[**針對橫跨多個脈絡視窗的長時間任務，Anthropic 開發了兩階段「Ralph Loop」模式**](https://www.anthropic.com/research/long-running-Claude)：**初始化代理（Initializer Agent）** 會設定環境（初始化指令碼、進度檔案、功能清單、初始 git 提交），接著每個後續工作階段中的**程式撰寫代理（Coding Agent）** 會讀取 git 記錄與進度檔案來定位自身，挑選最高優先且未完成的功能，開始工作、提交並撰寫摘要。檔案系統提供跨脈絡視窗的連續性。

## 真實框架如何實作這個模式 

<figure>
  <img src="/images/blogs/anatomy-harness-04.jpg" alt="真實框架如何實作這個模式 " />
</figure>

**Anthropic 的 Claude Agent SDK**透過單一 `query()` 函式暴露外殼，該函式會建立代理式迴圈，並回傳串流訊息的非同步迭代器。執行環境是「笨迴圈」。所有智慧都在模型中。Claude Code 使用蒐集-行動-驗證（Gather-Act-Verify）循環：蒐集脈絡（搜尋檔案、閱讀程式碼）、採取行動（編輯檔案、執行命令）、驗證結果（執行測試、檢查輸出），然後重複。

**OpenAI 的 Agents SDK**透過 `Runner` 類別實作外殼，並有三種模式：非同步、同步與串流。SDK 是「程式碼優先（code-first）」：流程邏輯以原生 Python 表達，而不是圖領域專用語言（DSL）。Codex 外殼在此基礎上擴展為三層架構：Codex Core（代理程式碼 + 執行環境）、App Server（雙向 JSON-RPC API），以及用戶端介面（CLI、VS Code、網頁應用程式）。所有層次共享同一個外殼，這就是為什麼「Codex 模型在 Codex 介面上比在一般聊天視窗中感覺更好」。

**LangGraph**把外殼建模為明確的狀態圖。兩個節點（`llm_call` 與 `tool_node`）由條件邊連接：如果存在工具呼叫，路由到 `tool_node`；如果沒有，路由到 END。LangGraph 演化自 LangChain 的 AgentExecutor，後者在 v0.2 被棄用，原因是難以擴展且缺乏多代理支援。LangChain 的 **Deep Agents** 明確使用「agent harness」這個術語：內建工具、規劃（`write_todos` 工具）、用於脈絡管理的檔案系統、子代理產生與持久記憶。

**CrewAI**實作以角色為基礎的多代理架構：Agent（包住 LLM 的外殼，由角色、目標、背景故事與工具定義）、Task（工作單位），以及 Crew（代理集合）。CrewAI 的 Flows 層加入了「在重要之處放入智慧的確定性骨幹（deterministic backbone with intelligence where it matters）」，在 Crews 處理自主協作時管理路由與驗證。

**AutoGen**（正演化為 Microsoft Agent Framework）開創了以對話驅動的協調。其三層架構（Core、AgentChat、Extensions）支援五種協調模式：循序、並行（扇出/扇入）、群組聊天、交接，以及 magentic（一個管理代理維護動態任務帳本來協調專家）。

## 鷹架隱喻

鷹架隱喻不是裝飾，而是精確描述。建築鷹架是暫時性基礎設施，讓工人能建造原本無法觸及的結構。它不負責施工，但沒有它，工人無法到達較高樓層。

<figure>
  <img src="/images/blogs/anatomy-harness-05.jpg" alt="鷹架隱喻模式 " />
</figure>

**關鍵洞見是：建築完成時，鷹架會被拆除。** 隨著模型改進，外殼複雜度應該下降。Manus 在六個月內重寫五次，每次重寫都移除複雜度。複雜工具定義變成一般 shell 執行。「管理代理」變成簡單的結構化交接。

這指向**共同演化原則（co-evolution principle）**：模型現在會在特定外殼參與迴圈的情況下進行後訓練。Claude Code 的模型學會使用訓練時搭配的特定外殼。改變工具實作可能降低效能，原因是這種緊密耦合。

外殼設計的「未來適應性測試（future-proofing test）」是：如果效能會隨著更強模型提升，而不需要增加外殼複雜度，這個設計就是健全的。

<figure>
  <img src="/images/blogs/anatomy-harness-06.jpg" alt="如果效能會隨著更強模型提升，而不需要增加外殼複雜度" />
</figure>

## 定義每個外殼的七個決策

**每位外殼架構師都會面對七個選擇：**

<figure>
  <img src="/images/blogs/anatomy-harness-07.jpg" alt="每位外殼架構師都會面對七個選擇" />
</figure>

1. **單代理與多代理。** Anthropic 與 OpenAI 都說：先最大化單一代理。多代理系統會增加額外成本（用於路由的額外 LLM 呼叫、交接期間的脈絡損失）。只有當工具過載超過約 10 個重疊工具，或存在明確分離的任務領域時，才進行拆分。

2. **ReAct 與規劃後執行（plan-and-execute）。** ReAct 在每一步交錯推理與行動（彈性高，但每步成本較高）。規劃後執行會把規劃與執行分開。LLMCompiler 報告相較於循序 ReAct 有 **3.6 倍加速**。

3. **脈絡視窗管理策略。** 五種生產做法：以時間為基礎的清除、對話摘要、觀察遮蔽、結構化筆記，以及子代理委派。ACON 研究顯示，透過優先保留推理軌跡而非原始工具輸出，可以**減少 26 到 54% token，同時保留 95% 以上準確率**。

4. **驗證迴圈設計。** 計算式驗證（測試、程式碼檢查器）提供確定性事實依據。推論式驗證（LLM 作為評審）能抓出語意問題，但會增加延遲。Martin Fowler 的 Thoughtworks 團隊把這區分為**引導器（guides）**（前饋，在行動前引導）與**感測器（sensors）**（回饋，在行動後觀察）。

5. **權限與安全架構。** 寬鬆（快速但有風險，自動核准多數動作）與嚴格（安全但慢，每個動作都需要核准）之間的選擇取決於部署脈絡。

6. **工具範圍策略。** 更多工具通常代表更差效能。Vercel 從 v0 移除 **80% 的工具**，並得到更好結果。Claude Code 透過延遲載入達成 **95% 脈絡減量**。原則是：只暴露目前步驟所需的最小工具集合。

7. **外殼厚度。** 有多少邏輯存在於外殼，而不是模型。Anthropic 押注薄外殼與模型改進。圖式框架押注明確控制。Anthropic 會隨著新模型版本內化某項能力，定期從 Claude Code 的外殼刪除規劃步驟。

## 外殼就是產品

兩個使用相同模型的產品，可能只因外殼設計而有極大效能差異。TerminalBench 的證據很清楚：只改變外殼，就讓代理排名移動 20 多個名次。

外殼不是已解決問題，也不是商品化層。艱難工程就在這裡：把脈絡當作稀缺資源管理、設計能在失敗累積前捕捉問題的驗證迴圈、建構能提供連續性且不造成幻覺的記憶系統，並對要建多少鷹架、要留多少給模型做出架構選擇。

隨著模型改進，這個領域正朝向更薄的外殼前進。但外殼本身不會消失。即使是最有能力的模型，也需要某個東西來管理它的脈絡視窗、執行它的工具呼叫、持久化它的狀態，並驗證它的工作。

下次你的代理失敗時，不要責怪模型。去看外殼。

以上就是全部內容！

如果你喜歡這篇文章：

找我 →@akshay_pachaar ✔️

我每天分享 AI、機器學習（Machine Learning）與 vibe coding 最佳實務的教學與洞見。

---

Akshay 🚀@akshay_pachaar

Simplifying LLMs, AI Agents, RAG, and Machine Learning for you! • Co-founder 
@dailydoseofds_
• BITS Pilani • 3 Patents • ex-AI Engineer @ LightningAI
