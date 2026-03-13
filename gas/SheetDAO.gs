/**
 * 通用資料存取物件 (Data Access Object)
 * 負責所有與 Google Spreadsheet 互動的底層邏輯
 */
class SheetDAO {
  constructor(sheetName) {
    this.sheetName = sheetName;
    this.ss = SpreadsheetApp.getActiveSpreadsheet();
    this.sheet = this.ss.getSheetByName(sheetName);
    
    if (!this.sheet) {
      throw new Error(`Sheet not found: ${sheetName}`);
    }
  }

  /**
   * 取得所有資料 (回傳物件陣列)
   */
  getAll() {
    const dataRange = this.sheet.getDataRange();
    const values = dataRange.getValues();

    if (values.length <= 1) return []; // 只有標頭或空的

    const headers = values[0];
    const rows = values.slice(1);

    // 將每一格的值正規化：Date→ISO字串、數字保留、空值→空字串
    const sanitizedRows = rows.map(row => row.map(cell => {
      if (cell instanceof Date) return cell.toISOString();
      if (cell === null || cell === undefined) return '';
      return cell;
    }));

    return Utils.rowsToObjects(headers, sanitizedRows);
  }

  /**
   * 根據 ID 取得單筆資料
   * 假設第一欄 (index 0) 永遠是 ID (如 clientId, quotationId, serviceId)
   */
  getById(id) {
    const all = this.getAll();
    const headers = this.getHeaders();
    const idKey = headers[0];
    
    return all.find(item => item[idKey] === id);
  }

  /**
   * 根據特定條件尋找多筆資料
   * @param {Object} query - 查詢條件，如 { clientId: 'C001', status: 'active' }
   */
  find(query) {
    const all = this.getAll();
    return all.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  /**
   * 新增一筆資料
   * 將在最後一列新增，並自動填上建立時間等
   */
  insert(dataObj) {
    const headers = this.getHeaders();
    const idKey = headers[0];
    
    // 如果沒有傳入 ID，自動產生 (先依賴呼叫端提供，但若沒則補上 uuid)
    if (!dataObj[idKey]) {
      dataObj[idKey] = Utils.generateId();
    }
    
    // 處理時間戳記
    if (headers.includes('createdAt')) dataObj.createdAt = Utils.getCurrentTimestamp();
    if (headers.includes('updatedAt')) dataObj.updatedAt = Utils.getCurrentTimestamp();

    const rowArray = Utils.objectToRow(headers, dataObj);
    // 用 setValues + 純文字格式寫入，避免 Google Sheets 自動轉型（如電話號碼前導零被吃掉）
    const newRowIdx = this.sheet.getLastRow() + 1;
    const range = this.sheet.getRange(newRowIdx, 1, 1, rowArray.length);
    range.setNumberFormat('@');   // 所有格子設為純文字
    range.setValues([rowArray]);

    return dataObj;
  }

  /**
   * 更新一筆資料 (根據第一欄 ID)
   */
  update(id, updateData) {
    const headers = this.getHeaders();
    const idKey = headers[0];
    
    const dataRange = this.sheet.getDataRange();
    const values = dataRange.getValues();
    
    if (values.length <= 1) return null;

    // 尋找目標列 (1-based index for Apps Script range)
    let targetRowIdx = -1;
    for (let i = 1; i < values.length; i++) {
        if (values[i][0] === id) {
            targetRowIdx = i + 1; // getRange 是 1-based，且 values 陣列是 0-based 但有標頭列
            break;
        }
    }

    if (targetRowIdx === -1) {
       throw new Error(`Record with ${idKey}=${id} not found in ${this.sheetName}`);
    }

    // 取得舊資料
    const oldRowValues = values[targetRowIdx - 1]; // 因為 targetRowIdx 取過 +1，所以 -1 回到 original array index
    const oldObj = Utils.rowsToObjects(headers, [oldRowValues])[0];
    
    // 合併資料
    const mergedObj = { ...oldObj, ...updateData };
    
    // 更新時間戳記
    if (headers.includes('updatedAt')) {
        mergedObj.updatedAt = Utils.getCurrentTimestamp();
    }

    const newRowArray = Utils.objectToRow(headers, mergedObj);
    
    // 單獨寫入該列
    this.sheet.getRange(targetRowIdx, 1, 1, headers.length).setValues([newRowArray]);
    
    return mergedObj;
  }

  /**
   * 根據 ID 刪除單筆資料 (第一欄為 ID)
   * @param {string} id - 要刪除的記錄 ID
   * @returns {boolean} 是否成功刪除
   */
  delete(id) {
    const dataRange = this.sheet.getDataRange();
    const values = dataRange.getValues();

    if (values.length <= 1) return false;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][0]) === String(id)) {
        this.sheet.deleteRow(i + 1); // Sheet row 是 1-based，且第 0 列是標頭
        return true;
      }
    }
    return false;
  }

  /**
   * 根據查詢條件刪除多筆資料
   * @param {Object} query - 查詢條件，如 { quotationId: '#20260310-001' }
   * @returns {number} 刪除的筆數
   */
  deleteByQuery(query) {
    const headers = this.getHeaders();
    const camelHeaders = headers.map(h => {
      if (typeof h !== 'string' || !h.includes(' ')) return h;
      return h.split(' ').map((word, i) => {
        if (i === 0) return word.toLowerCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join('');
    });

    const dataRange = this.sheet.getDataRange();
    const values = dataRange.getValues();
    if (values.length <= 1) return 0;

    // 從最後一列往前刪，避免 index 偏移
    let deletedCount = 0;
    for (let i = values.length - 1; i >= 1; i--) {
      const row = values[i];
      let match = true;
      for (const key in query) {
        const colIdx = camelHeaders.indexOf(key);
        if (colIdx === -1 || String(row[colIdx]) !== String(query[key])) {
          match = false;
          break;
        }
      }
      if (match) {
        this.sheet.deleteRow(i + 1);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  /**
   * 取得標頭陣列
   */
  getHeaders() {
     const headerRange = this.sheet.getRange(1, 1, 1, this.sheet.getLastColumn());
     return headerRange.getValues()[0];
  }
}
