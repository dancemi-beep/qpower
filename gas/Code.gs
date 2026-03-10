/**
 * 諮力顧問報價單管理系統 - API 入口點
 * Code.gs
 */

/**
 * 處理 HTTP GET 請求 (回傳前端 Web 介面)
 */
function doGet(e) {
  // 渲染 SPA 主頁面
  var html = HtmlService.createTemplateFromFile('index').evaluate();
  html.setTitle('諮力顧問報價單管理系統');
  html.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  html.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  return html;
}

/**
 * 處理 HTTP POST 請求 (JSON API)
 */
function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      return apiError('Missing request body');
    }

    var request = JSON.parse(e.postData.contents);
    var action = request.action;
    var payload = request.payload || {};

    if (!action) {
      return apiError('Missing action parameter');
    }

    // 路由分發
    var result = routeRequest(action, payload);
    return apiSuccess(result);

  } catch (err) {
    Logger.log('API Error: ' + err.message + '\n' + err.stack);
    return apiError(err.message);
  }
}

/**
 * HtmlService 引入其他檔案 (用於 index.html 內嵌 css/js)
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * 初始化系統 (首次執行用，建立所需 Sheets 與欄位)
 */
function initSystem() {
  var ss = getSpreadsheet();
  
  var sheetsDef = {
    '公司資訊': ['companyName', 'companyNameEn', 'contactPerson', 'phone', 'lineId', 'address', 'email'],
    '客戶資料': ['clientId', 'companyName', 'contactPerson', 'contactPhone', 'contactEmail', 'address', 'notes'],
    '服務項目': ['serviceId', 'serviceName', 'description', 'executionMethod', 'defaultPrice', 'unit', 'category'],
    '報價單': ['quotationId', 'quotationDate', 'validUntil', 'clientId', 'projectName', 'subtotal', 'discountType', 'discountValue', 'discountedTotal', 'grandTotal', 'taxIncluded', 'status', 'notes', 'paymentTerms', 'createdAt', 'updatedAt'],
    '報價明細': ['quotationId', 'itemNo', 'serviceId', 'customName', 'customDescription', 'executionMethod', 'quantity', 'unit', 'unitPrice', 'amount'],
    '備註模板': ['templateId', 'title', 'content'],
    '付款條件': ['templateId', 'title', 'content']
  };

  for (var name in sheetsDef) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    // 永遠重設第一列為標頭
    sheet.getRange(1, 1, 1, sheetsDef[name].length).setValues([sheetsDef[name]]);
    // 凍結第一列
    sheet.setFrozenRows(1);
  }
  
  // 寫入預設公司資料 (若為空)
  var companySheet = ss.getSheetByName('公司資訊');
  if (companySheet.getLastRow() <= 1) {
    companySheet.appendRow([
      '諮力管理顧問股份有限公司', 
      'QPower Management Consulting Co., Ltd.',
      '秘詩穎',
      '0988-563-600',
      'IMITATE',
      '',
      ''
    ]);
  }
}
