# 諮力顧問報價單管理系統 - 技術選型與架構

> 本文件作為開發的「藍圖」，可隨需求變化調整。

---

## 1. 技術架構總覽

```
┌─────────────────────────────────┐
│         使用者瀏覽器              │
│   (HTML + CSS + JavaScript)      │
└──────────┬──────────────────────┘
           │ HTTPS
           ▼
┌─────────────────────────────────┐
│    Google Apps Script Web App    │
│    (doGet / doPost endpoint)    │
│                                 │
│  ┌───────────┐ ┌──────────────┐ │
│  │  路由層    │ │  業務邏輯層   │ │
│  │ (Router)  │ │ (Services)   │ │
│  └───────────┘ └──────────────┘ │
│  ┌──────────────────────────────┤
│  │       資料存取層 (DAO)        │
│  └──────────────────────────────┤
└──────────┬──────────────────────┘
           │ Sheets API
           ▼
┌─────────────────────────────────┐
│       Google Sheets (資料庫)     │
│                                 │
│  Sheet: 公司資訊                 │
│  Sheet: 客戶資料                 │
│  Sheet: 服務項目目錄              │
│  Sheet: 報價單主表               │
│  Sheet: 報價單明細               │
│  Sheet: 備註模板                 │
│  Sheet: 付款條件模板              │
└─────────────────────────────────┘
```

## 2. 技術選型

### 2.1 後端 — Google Apps Script (GAS)

| 項目 | 選擇 | 理由 |
|------|------|------|
| **執行環境** | Google Apps Script V8 | 免費、免伺服器、原生整合 Google 生態系 |
| **API 模式** | doGet/doPost + JSON API | 前後端分離，SPA 透過 fetch 呼叫 |
| **資料庫** | Google Sheets | 零成本、非技術人員可直接查看/修改資料 |
| **PDF 產生** | Google Docs 模板 + DocumentApp | 利用 Google Docs 作為報價單模板，動態填入後轉 PDF |
| **認證** | Google OAuth 自動驗證 | Web App 部署設定「僅限特定使用者」 |

#### GAS 限制與因應

| 限制 | 說明 | 因應策略 |
|------|------|---------|
| 6 分鐘執行上限 | 單次腳本最長執行 6 分鐘 | 報價單操作輕量，不受影響 |
| 每日配額 | Sheets 讀寫有每日上限 | 中小企業使用量遠低於上限 |
| 無狀態 | 每次請求獨立，無 session | 前端管理登入狀態，每次帶 token |

### 2.2 前端 — 原生 HTML/CSS/JS (SPA)

| 項目 | 選擇 | 理由 |
|------|------|------|
| **框架** | 無框架 (Vanilla JS) | GAS 的 HtmlService 不支援現代打包工具，原生最穩定 |
| **CSS** | 自訂 CSS + CSS Variables | 輕量、不依賴外部 CDN |
| **圖示** | Material Icons (CDN) | Google 風格一致性 |
| **字型** | Noto Sans TC (Google Fonts) | 繁體中文最佳顯示 |
| **模板引擎** | GAS HtmlService.createTemplateFromFile | 伺服器端模板渲染 |

### 2.3 資料儲存 — Google Sheets 結構

| Sheet 名稱 | 用途 | 主鍵 |
|------------|------|------|
| `公司資訊` | 諮力公司基本設定 | (單列) |
| `客戶資料` | 客戶名冊 | clientId |
| `服務項目` | 服務目錄 | serviceId |
| `報價單` | 報價單主表 (header) | quotationId |
| `報價明細` | 報價單明細 (line items) | quotationId + itemNo |
| `備註模板` | 預設備註條款 | templateId |
| `付款條件` | 預設付款方式 | templateId |

## 3. 部署架構

```
Google Apps Script Project
├── Code.gs              # 主入口 (doGet/doPost)
├── Router.gs            # API 路由分發
├── QuotationService.gs  # 報價單業務邏輯
├── ClientService.gs     # 客戶管理邏輯
├── CatalogService.gs    # 服務項目邏輯
├── SheetDAO.gs          # 資料存取封裝
├── PdfGenerator.gs      # PDF 產生器
├── Utils.gs             # 工具函式
├── index.html           # 主頁面 (SPA shell)
├── css.html              # 樣式 (內嵌)
├── js_app.html          # 前端主邏輯
├── js_api.html          # API 通訊層
├── js_quotation.html    # 報價單模組
├── js_client.html       # 客戶模組
└── js_catalog.html      # 服務項目模組
```

## 4. API 設計

採用 JSON-RPC 風格（GAS 限制下最適方案）：

### Request
```json
{
  "action": "quotation.create",
  "payload": { ... }
}
```

### Response
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### API 清單

| Action | 說明 |
|--------|------|
| `quotation.list` | 報價單列表 |
| `quotation.get` | 取得單筆報價單 |
| `quotation.create` | 建立報價單 |
| `quotation.update` | 更新報價單 |
| `quotation.delete` | 刪除報價單 |
| `quotation.exportPdf` | 匯出 PDF |
| `client.list` | 客戶列表 |
| `client.get` | 取得單筆客戶 |
| `client.create` | 建立客戶 |
| `client.update` | 更新客戶 |
| `client.delete` | 刪除客戶 |
| `catalog.list` | 服務項目列表 |
| `catalog.create` | 建立服務項目 |
| `catalog.update` | 更新服務項目 |
| `catalog.delete` | 刪除服務項目 |
| `company.get` | 取得公司資訊 |
| `company.update` | 更新公司資訊 |

## 5. 已確認決策 (2026-03-09)

| # | 決策項目 | 結論 |
|---|---------|------|
| 1 | 資料庫方案 | ✅ Google Sheets |
| 2 | PDF 產生方式 | ✅ Google Docs 模板動態填入轉 PDF |
| 3 | 部署方式 | ✅ GAS Web App 預設 URL，不需自訂網域 |
| 4 | 使用者權限 | ✅ 全權限，後續有需要再分角色 |
