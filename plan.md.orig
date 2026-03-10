# 諮力顧問報價單管理系統 - 實作計畫書

> 本文件為系統開發計畫，會因需求討論而更新。

---

## 開發時程概覽

| 階段 | 內容 | 預估工期 | 狀態 |
|------|------|---------|------|
| Phase 0 | 需求分析與規劃 | 1 天 | 🔄 進行中 |
| Phase 1 | 後端核心 (GAS + Sheets) | 2-3 天 | ⏳ 待開始 |
| Phase 2 | 前端 UI 開發 | 3-4 天 | ⏳ 待開始 |
| Phase 3 | PDF 匯出功能 | 1-2 天 | ⏳ 待開始 |
| Phase 4 | 整合測試與優化 | 1-2 天 | ⏳ 待開始 |

---

## Phase 0：需求分析與規劃

### 0.1 報價單內容分析
- [x] 讀取「諮力ISO導入報價單20250930.pdf」
- [x] 提取報價單結構、欄位、計算邏輯
- [x] 分析備註條款與付款方式

### 0.2 系統規劃文件
- [x] 撰寫 sys_spec.md (產品需求藍圖)
- [x] 撰寫 tech_stack.md (技術選型與架構)
- [x] 撰寫 plan.md (本文件)
- [x] 撰寫 version.md (版本紀錄)
- [x] 撰寫 current.md (進度牆)
- [ ] 使用者確認所有規劃文件

---

## Phase 1：後端核心 (Google Apps Script)

### 1.1 Google Sheets 資料結構建立
- [ ] 建立 Spreadsheet，建立各個 Sheet
- [ ] 設定欄位標頭與資料驗證
- [ ] 匯入預設服務項目資料 (7項)
- [ ] 匯入預設備註模板與付款條件

### 1.2 資料存取層 (SheetDAO.gs)
- [ ] 實作通用 CRUD 封裝
  - `getAll(sheetName)` / `getById(sheetName, id)`
  - `insert(sheetName, rowData)` / `update(sheetName, id, rowData)`
  - `delete(sheetName, id)`
- [ ] ID 自動產生邏輯
- [ ] 資料型別轉換 (日期、數字)

### 1.3 API 路由層 (Code.gs + Router.gs)
- [ ] `doGet()` 渲染前端頁面
- [ ] `doPost()` 接收 JSON API 請求
- [ ] Router 根據 action 分發至對應 Service

### 1.4 業務邏輯層
- [ ] QuotationService.gs
  - 報價單 CRUD
  - 自動計算 (小計、折扣、總額)
  - 狀態管理
  - 報價編號自動產生 (格式: #YYYYMMDD-NNN)
- [ ] ClientService.gs
  - 客戶 CRUD
- [ ] CatalogService.gs
  - 服務項目 CRUD

### 1.5 PDF 產生器 (PdfGenerator.gs)
- [ ] 建立 Google Docs 報價單模板
- [ ] 動態填入資料邏輯
- [ ] 轉換為 PDF 並回傳下載連結

---

## Phase 2：前端 UI 開發

### 2.1 基礎架構
- [ ] index.html (SPA 外殼 + 導航)
- [ ] css.html (設計系統: 色彩、字型、元件)
- [ ] js_api.html (API 通訊封裝)
- [ ] js_app.html (路由、狀態管理)

### 2.2 報價單模組
- [ ] 報價單列表頁 (搜尋、篩選、狀態標籤)
- [ ] 報價單建立/編輯頁
  - 客戶選擇器
  - 服務項目選取 (從目錄勾選)
  - 明細表格 (可編輯數量、單價)
  - 折扣設定
  - 額外項目 (人天計算)
  - 備註與付款條件 (模板選取/自訂)
  - 即時金額計算
- [ ] 報價單預覽頁 (還原 PDF 排版)
- [ ] PDF 下載功能

### 2.3 客戶模組
- [ ] 客戶列表頁
- [ ] 客戶新增/編輯 Modal
- [ ] 客戶歷史報價查詢

### 2.4 服務項目模組
- [ ] 服務項目列表頁
- [ ] 服務項目新增/編輯 Modal

### 2.5 公司設定
- [ ] 公司資訊編輯頁

### 2.6 儀表板 (Dashboard)
- [ ] 報價單統計卡片 (本月/本季)
- [ ] 近期報價單列表
- [ ] 即將到期報價單提醒

---

## Phase 3：PDF 匯出功能

### 3.1 報價單模板設計
- [ ] 根據原始 PDF 設計 Google Docs 模板
- [ ] 設定佔位符 (placeholder)
- [ ] 樣式調整 (字型、表格、頁首頁尾)

### 3.2 動態填入與匯出
- [ ] 資料填入邏輯
- [ ] 表格動態列產生
- [ ] PDF 轉換與下載

---

## Phase 4：整合測試與優化

### 4.1 功能測試
- [ ] 報價單完整流程測試 (建立→編輯→匯出)
- [ ] 計算邏輯驗證
- [ ] 邊界條件測試

### 4.2 UI/UX 優化
- [ ] 響應式設計調整
- [ ] Loading 狀態與錯誤處理
- [ ] 表單驗證

### 4.3 部署
- [ ] Google Apps Script Web App 部署
- [ ] 權限設定
- [ ] 使用說明文件
