/**
 * 諮力顧問報價單管理系統 - 工具函式
 * Utils.gs
 */

/**
 * 產生 UUID (短版)
 * @returns {string} 8 字元短 ID
 */
function generateId() {
  return Utilities.getUuid().split('-')[0];
}

/**
 * 產生報價單編號
 * 格式: #YYYYMMDD-NNN (當日流水號)
 * @returns {string}
 */
function generateQuotationId() {
  var today = new Date();
  var dateStr = Utilities.formatDate(today, 'Asia/Taipei', 'yyyyMMdd');
  var prefix = '#' + dateStr;

  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('報價單');
  var data = sheet.getDataRange().getValues();

  var maxSeq = 0;
  for (var i = 1; i < data.length; i++) {
    var qid = String(data[i][0]);
    if (qid.indexOf(prefix) === 0) {
      var seq = parseInt(qid.split('-')[1], 10);
      if (seq > maxSeq) maxSeq = seq;
    }
  }

  var nextSeq = String(maxSeq + 1);
  while (nextSeq.length < 3) nextSeq = '0' + nextSeq;
  return prefix + '-' + nextSeq;
}

/**
 * 格式化日期
 * @param {Date|string} date
 * @returns {string} YYYY/MM/DD
 */
function formatDate(date) {
  if (!date) return '';
  if (typeof date === 'string') date = new Date(date);
  return Utilities.formatDate(date, 'Asia/Taipei', 'yyyy/MM/dd');
}

/**
 * 計算有效期限 (報價日 + N 天)
 * @param {Date} quotationDate
 * @param {number} days 預設 30
 * @returns {Date}
 */
function calcValidUntil(quotationDate, days) {
  days = days || 30;
  var d = new Date(quotationDate);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * 數字格式化 (千位分隔)
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('zh-TW');
}

/**
 * 安全取得數值
 * @param {*} val
 * @returns {number}
 */
function toNumber(val) {
  var n = Number(val);
  return isNaN(n) ? 0 : n;
}

/**
 * 建立標準 API 回應
 */
function apiSuccess(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, data: data, error: null }))
    .setMimeType(ContentService.MimeType.JSON);
}

function apiError(message) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, data: null, error: message }))
    .setMimeType(ContentService.MimeType.JSON);
}
