# 諮力顧問報價單管理系統 - 進度牆

> 與 AI 溝通的「進度牆」，方便下一次開始接續工作。

---

## 🔄 當前狀態：規劃階段 — 等待使用者確認

### 最後更新：2026-03-09

### 已完成
1. ✅ 分析「諮力ISO導入報價單20250930.pdf」，提取完整報價單結構
2. ✅ 撰寫 `sys_spec.md` — 定義 7 個服務項目、5 個資料模型、8 大功能模組
3. ✅ 撰寫 `tech_stack.md` — 確立 Google Apps Script + Sheets 架構
4. ✅ 撰寫 `plan.md` — 四階段開發計畫 (Phase 0-4)
5. ✅ 撰寫 `version.md` — 版本 v0.1.0 紀錄
6. ✅ 撰寫 `current.md` — 本文件

### 待辦 (Blocking)
- ⏳ **等待使用者確認規劃文件**，特別是 `tech_stack.md` 中的 4 個待確認項目：
  1. Google Sheets 作為資料庫方案是否同意？
  2. PDF 產生方式偏好（Google Docs 模板 vs HTML 轉 PDF）？
  3. 是否需要自訂網域？
  4. 是否需要角色權限區分？

### 下一步
- 使用者確認後進入 **Phase 1：後端核心開發**
- 首先建立 Google Sheets 資料結構與 GAS 專案骨架

### 重要檔案
| 檔案 | 用途 |
|------|------|
| `sys_spec.md` | 系統需求功能說明 |
| `plan.md` | 實作計畫書 |
| `tech_stack.md` | 技術選型與架構 |
| `version.md` | 版本紀錄 |
| `current.md` | 本檔案 — 進度牆 |
| `諮力ISO導入報價單20250930.pdf` | 原始報價單參考 |
