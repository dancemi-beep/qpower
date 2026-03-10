/**
 * 共用工具類
 */
class Utils {
  
  /**
   * 產生 UUID (v4)
   * Apps Script 沒有內建 crypto，使用簡易版本
   */
  static generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * 產生目前時間戳記 (ISO 格式)
   */
  static getCurrentTimestamp() {
    return new Date().toISOString();
  }

  /**
   * 格式化數字 (例如加上千位數逗點)
   */
  static formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return '';
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(amount);
  }

  /**
   * 解析可能包含 JSON 字串的欄位
   */
  static safeJsonParse(str, defaultVal = null) {
    if (!str) return defaultVal;
    try {
      return JSON.parse(str);
    } catch (e) {
      return defaultVal;
    }
  }

  /**
   * 將陣列與標頭轉換為物件陣列 (若標頭含空格則轉為 camelCase，否則保持原樣)
   */
  static rowsToObjects(headers, rows) {
    const camelHeaders = headers.map(h => {
      if (typeof h !== 'string' || !h.includes(' ')) return h;
      return h.split(' ').map((word, i) => {
        if (i === 0) return word.toLowerCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join('');
    });

    return rows.map(row => {
      const obj = {};
      camelHeaders.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
  }

  /**
   * 將物件轉換為寫入 Sheet 的陣列格式
   */
  static objectToRow(headers, obj) {
    return headers.map(header => {
      let key = header;
      if (typeof header === 'string' && header.includes(' ')) {
        key = header.split(' ').map((word, i) => {
          if (i === 0) return word.toLowerCase();
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join('');
      }
      return obj[key] !== undefined ? obj[key] : '';
    });
  }
}
