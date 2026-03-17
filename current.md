# 諮力顧問報價單管理系統 - 進度牆

---

## ✅ 當前狀態：批次 A + B 完成 — 待 clasp push + 測試

### 最後更新：2026-03-17

### 批次 A 已完成（客戶功能增強）
1. ✅ **Sheet 結構升級**：Clients 加 `taxId`、新建 `ClientContacts` / `ClientNotes` Sheet
2. ✅ **後端 Service**：ContactService / NoteService CRUD + ClientService 擴充（getFullProfile 聚合查詢、delete 連帶清理）
3. ✅ **js_api.html**：補齊 contact / note API
4. ✅ **js_client.html 重寫**：
   - 統編欄位
   - 單一 Modal 完成建立（基本資料 + 多聯絡人 + 多筆要求紀錄）
   - 儲存後自動關閉 Modal + Toast 成功提示
   - 詳情 Modal（聯絡人列表 + 要求紀錄 + 歷史報價）
5. ✅ **Setup.gs 修復**：`setupSheet()` 改為永遠同步標頭（解決新欄位不生效問題）

### 批次 B 已完成（報價單功能強化）
1. ✅ **B1 執行方式自動帶入**：`js_quotation_form.html` 的 `onServiceSelect` 已實作（第 273 行）
2. ✅ **B2 報價單狀態流程**：
   - **後端**：`QuotationService.updateStatus()` 實作狀態機（草稿→已報價→已成交/未成交/作廢）
   - **Router + API**：新增 `Quotation.updateStatus` 路由與 API 方法
   - **前端**：報價單列表加入狀態操作按鈕組
     - 草稿：可編輯、可送出報價、可作廢
     - 已報價：可標記成交/未成交/作廢
     - 最終狀態（已成交/未成交/作廢）：僅可查看
   - **狀態 Badge 更新**：草稿/已報價/已成交/未成交/作廢 五種狀態色彩

### ⚠️ 接續操作（下次開始前）
1. 到 `qpower/gas` 目錄執行 `clasp push`
2. GAS 編輯器跑一次 `initializeDatabase`（讓標頭更新 + 建立新 Sheet）
3. 清掉 Clients Sheet 舊資料列
4. 測試批次 A（新增客戶）+ 批次 B（報價單狀態轉換）

### 待辦
- [ ] clasp push + initializeDatabase + 測試批次 A + B
- [ ] **批次 C**：防連點 + Toast 提示優化（通用）
- [ ] 報價單預覽頁（Phase 2.2 剩餘）
- [ ] 公司設定頁面（Phase 2.5）
- [ ] 儀表板到期提醒（Phase 2.6 剩餘）

### 下一步
- clasp push → 測試批次 A + B → 批次 C（防連點 + Toast 優化）

### 重要檔案
| 檔案 | 用途 |
|------|------|
| js_home.html | 系統首頁（公司介紹 + 服務總覽 + 聯絡資訊） |
| js_client.html | 客戶管理（統編 + 多聯絡人 + 多筆紀錄 + 歷史報價） |
| js_catalog.html | 服務項目管理完整 CRUD 元件 |
| js_app.html | 儀表板 + 報價單列表（含篩選/刪除） |
| js_quotation_form.html | 報價單建立/編輯表單（含編輯模式載入） |
| js_api.html | 所有 API 呼叫封裝（含 contact / note） |
| ContactService.gs | 客戶聯絡人 CRUD |
| NoteService.gs | 客戶要求紀錄 CRUD |
