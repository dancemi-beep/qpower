# 諮力顧問報價單管理系統 - 版本紀錄

---

## v0.1.0 — 2026-03-09

### 📋 規劃階段完成

- **新增** sys_spec.md：產品需求藍圖，定義系統資料模型與功能邊界
- **新增** tech_stack.md：技術選型與架構，確立 GAS + Sheets 方案
- **新增** plan.md：實作計畫書，四階段開發時程
- **新增** version.md：版本紀錄 (本文件)
- **新增** current.md：AI 溝通進度牆

### 📊 分析成果
- 完成「諮力ISO導入報價單20250930.pdf」解析
- 提取 7 項預設服務項目、折扣規則、付款條件、備註條款

---

## v0.2.0 — 2026-03-11

### 🔧 Phase 1 核心功能完成 + Bug 修復

- **修復** `SheetDAO.gs`：`getAll()` 加入資料正規化，將 Google Sheets 的 Date 物件轉為 ISO 字串，防止 `google.script.run` 序列化失敗
- **修復** `QuotationService.gs`：`getAll()` 對 `subtotal`、`discountedTotal`、`grandTotal` 強制 `Number()` 轉換，避免空字串導致前端 NaN
- **修復** `js_app.html`：儀表板與報價單列表加入防禦性 `Number()` 處理與 debug log
- **驗證** 儀表板統計數據、報價單列表頁資料讀取與渲染皆正常運作

---

## v0.2.1 — 2026-03-11

### 🔧 Phase 1 補完 — 後端核心完整 CRUD

- **新增** `SheetDAO.gs`：`delete(id)` 單筆刪除、`deleteByQuery(query)` 條件批次刪除（從最後一列往前刪避免 index 偏移）
- **新增** `Setup.gs`：初始化 `NotesTemplates`（4 條預設備註）與 `PaymentTerms`（3 種付款條件）Sheet
- **新增** `Router.gs`：`handleTemplateAction()` 處理 Template.getNotes / Template.getPaymentTerms
- **新增** `Code.gs`：Template 路由分發
- **新增** `CatalogService.gs`：從唯讀升級為完整 CRUD（create/getById/update/delete），含 serviceId 自動產生
- **新增** `ClientService.gs`：`delete(id)` 方法
- **新增** `QuotationService.gs`：`delete(id)` 連帶刪除 QuotationItems 明細
- **修復** `QuotationService.gs`：`update()` 的 items 刪除重建邏輯，由 TODO 佔位改為實際 `deleteByQuery` + 重新 insert
- **修復** `Router.gs`：Catalog 路由擴充 getById/create/update/delete，Client 路由補 delete，Quotation 路由補 delete

---

## v0.3.0 — 2026-03-11

### 🎨 Phase 2 前端 UI 主體開發

- **新增** `js_client.html`：客戶管理完整 CRUD 元件（列表 + Bootstrap Modal 新增/編輯 + 刪除確認）
- **新增** `js_catalog.html`：服務項目目錄完整 CRUD 元件（列表 + Modal + 計價方式/分類/費用欄位）
- **修改** `js_api.html`：補齊所有 API 方法 — Client (getById/update/delete)、Catalog (getById/create/update/delete)、Quotation (update/delete)、Template (getNotes/getPaymentTerms)
- **修改** `js_app.html`：QuotationListView 增強 — 狀態篩選下拉、狀態 badge 色彩、詳情按鈕→編輯導航、草稿刪除功能；移除 ClientView/CatalogView 空殼改為 include 獨立檔案
- **修改** `js_quotation_form.html`：支援編輯模式 — onMounted 判斷 quotationId 後 API 載入既有資料填入表單、saveQuotation 判斷 create/update
- **修改** `index.html`：加入 js_client.html 與 js_catalog.html 的 include
- **模式** GAS 元件模組化：將複雜元件拆分為獨立 .html 檔案，透過 `<?!= include() ?>` 引入，解決單檔過大問題

---

## v0.3.1 — 2026-03-12

### 🏠 系統首頁新增

- **新增** `js_home.html`：系統首頁元件，包含五大區塊
  - Hero Banner：品牌名稱 + 核心價值主張 + 漸層背景 + CTA 按鈕
  - USP 卡片：中小企業專注、合理預算、一條龍取證、快速導入
  - 服務項目總覽：從 ServiceCatalog API 動態載入，卡片式呈現含計價方式與費用
  - ISO 27001 導入流程：五步驟 Stepper（需求諮詢→整體規劃→文件建置→內部稽核→取得認證）
  - 聯絡資訊：顧問窗口、電話、Email、LINE ID
- **修改** `index.html`：導航列新增「首頁」按鈕、include js_home.html
- **修改** `js_app.html`：路由表新增 HomeView、預設路由從 dashboard 改為 home

---

## v0.4.0 — 2026-03-12

### 🏷️ 統一編碼原則

- **修改** `ClientService.gs`：create() 加入 CLT-NNN 自動流水號產生邏輯（解析現有最大編號 +1）
- **修改** `QuotationService.gs`：quotationId 格式從 `#YYYYMMDD-NNN` 改為 `QUO-YYYYMMDD-NNN`
- **修改** `Setup.gs`：預設客戶 ID 從 `C-001` 改為 `CLT-001`
- **修改** `js_client.html`：客戶編號顯示樣式從灰色小字改為 badge
- **修改** `js_catalog.html`：服務編號顯示樣式從灰色小字改為 badge
- **修改** `sys_spec.md`：更新 clientId/quotationId/serviceId 格式說明
- **原則** 所有實體使用人類可讀編碼作為 P-Key，UUID 僅用於 QuotationItems（不顯示於畫面）
- ⚠️ **破壞性變更**：舊資料（UUID clientId、`#` 開頭 quotationId）需手動清除
