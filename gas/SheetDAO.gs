/**
 * 諮力顧問報價單管理系統 - 資料存取層
 * SheetDAO.gs
 *
 * 封裝 Google Sheets CRUD 操作
 */

// ===== Spreadsheet 連線 =====

var SPREADSHEET_ID = ''; // TODO: 部署時填入 Spreadsheet ID

/**
 * 取得 Spreadsheet 物件
 * 如果 SPREADSHEET_ID 為空，使用綁定的 Spreadsheet
 */
function getSpreadsheet() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

// ===== 通用 CRUD =====

/**
 * 取得指定 Sheet 的所有資料 (含標頭轉物件)
 * @param {string} sheetName
 * @returns {Object[]}
 */
function getAll(sheetName) {
  var sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var results = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    results.push(row);
  }
  return results;
}

/**
 * 根據主鍵取得單筆資料
 * @param {string} sheetName
 * @param {string} idColumn 主鍵欄位名
 * @param {string} idValue 主鍵值
 * @returns {Object|null}
 */
function getById(sheetName, idColumn, idValue) {
  var sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return null;

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return null;

  var headers = data[0];
  var idIdx = headers.indexOf(idColumn);
  if (idIdx === -1) return null;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]) === String(idValue)) {
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j];
      }
      return row;
    }
  }
  return null;
}

/**
 * 根據條件篩選資料
 * @param {string} sheetName
 * @param {Object} filters { columnName: value, ... }
 * @returns {Object[]}
 */
function getByFilter(sheetName, filters) {
  var all = getAll(sheetName);
  return all.filter(function(row) {
    for (var key in filters) {
      if (String(row[key]) !== String(filters[key])) return false;
    }
    return true;
  });
}

/**
 * 新增一筆資料
 * @param {string} sheetName
 * @param {Object} rowData { columnName: value, ... }
 * @returns {Object} 新增的資料
 */
function insert(sheetName, rowData) {
  var sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet not found: ' + sheetName);

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var newRow = headers.map(function(h) {
    return rowData[h] !== undefined ? rowData[h] : '';
  });

  sheet.appendRow(newRow);
  return rowData;
}

/**
 * 更新一筆資料
 * @param {string} sheetName
 * @param {string} idColumn 主鍵欄位名
 * @param {string} idValue 主鍵值
 * @param {Object} updateData { columnName: value, ... }
 * @returns {Object|null} 更新後的資料
 */
function update(sheetName, idColumn, idValue, updateData) {
  var sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return null;

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return null;

  var headers = data[0];
  var idIdx = headers.indexOf(idColumn);
  if (idIdx === -1) return null;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]) === String(idValue)) {
      // 更新欄位
      for (var key in updateData) {
        var colIdx = headers.indexOf(key);
        if (colIdx !== -1) {
          data[i][colIdx] = updateData[key];
        }
      }
      // 寫回整列
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([data[i]]);

      // 回傳更新後物件
      var result = {};
      for (var j = 0; j < headers.length; j++) {
        result[headers[j]] = data[i][j];
      }
      return result;
    }
  }
  return null;
}

/**
 * 刪除一筆資料
 * @param {string} sheetName
 * @param {string} idColumn
 * @param {string} idValue
 * @returns {boolean}
 */
function deleteRow(sheetName, idColumn, idValue) {
  var sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return false;

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return false;

  var headers = data[0];
  var idIdx = headers.indexOf(idColumn);
  if (idIdx === -1) return false;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]) === String(idValue)) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

/**
 * 批次刪除 (根據條件)
 * @param {string} sheetName
 * @param {string} column
 * @param {string} value
 * @returns {number} 刪除筆數
 */
function deleteByFilter(sheetName, column, value) {
  var sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return 0;

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return 0;

  var headers = data[0];
  var colIdx = headers.indexOf(column);
  if (colIdx === -1) return 0;

  var count = 0;
  // 由下往上刪以避免 index 偏移
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][colIdx]) === String(value)) {
      sheet.deleteRow(i + 1);
      count++;
    }
  }
  return count;
}

/**
 * 批次新增多筆資料
 * @param {string} sheetName
 * @param {Object[]} rows
 */
function insertBatch(sheetName, rows) {
  if (!rows || rows.length === 0) return;

  var sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet not found: ' + sheetName);

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  var newRows = rows.map(function(rowData) {
    return headers.map(function(h) {
      return rowData[h] !== undefined ? rowData[h] : '';
    });
  });

  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, newRows.length, headers.length).setValues(newRows);
}
