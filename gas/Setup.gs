/**
 * 初始化 Google Spreadsheet 資料庫
 * 執行此函式將會建立所有需要的 Sheet 與欄位標頭
 */
function initializeDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. 公司資訊 (CompanyProfile)
  setupSheet(ss, 'CompanyProfile', [
    'field', 'value', 'description'
  ]);
  
  // 建立預設公司資料
  const companySheet = ss.getSheetByName('CompanyProfile');
  if (companySheet.getLastRow() <= 1) {
    const defaultData = [
      ['companyName', '諮力管理顧問股份有限公司', '公司全名'],
      ['companyNameEn', 'QPower Management Consulting Co., Ltd.', '英文名稱'],
      ['contactPerson', '秘詩穎', '聯絡窗口'],
      ['phone', '0988-563-600', '聯絡電話'],
      ['lineId', 'IMITATE', 'LINE ID'],
      ['address', '', '公司地址'],
      ['email', '', '電子信箱']
    ];
    companySheet.getRange(2, 1, defaultData.length, 3).setValues(defaultData);
  }

  // 2. 客戶資訊 (Clients)
  setupSheet(ss, 'Clients', [
    'clientId', 'companyName', 'contactPerson', 'contactPhone', 'contactEmail', 'address', 'notes', 'createdAt', 'updatedAt'
  ]);
  
  const clientSheet = ss.getSheetByName('Clients');
  if (clientSheet.getLastRow() <= 1) {
    const defaultClients = [
      ['C-001', '示範客戶 A', '王小明', '02-1234-5678', 'test@example.com', '台北市信義區...', '系統預設測試客戶', Utils.getCurrentTimestamp(), Utils.getCurrentTimestamp()]
    ];
    clientSheet.getRange(2, 1, defaultClients.length, 9).setValues(defaultClients);
  }

  // 3. 服務項目目錄 (ServiceCatalog)
  setupSheet(ss, 'ServiceCatalog', [
    'serviceId', 'serviceName', 'description', 'executionMethod', 'defaultPrice', 'pricingMethod', 'category', 'status'
  ]);
  
  // 建立預設服務項目
  const catalogSheet = ss.getSheetByName('ServiceCatalog');
  if (catalogSheet.getLastRow() <= 1) {
    const defaultCatalog = [
      ['SRV-001', '整體流程規劃', '', '顧問諮詢會 (約3小時)', 21000, '整筆價', '輔導', 'active'],
      ['SRV-002', '各階段內容說明', '', '詳細解釋說明會 (約4小時)', 30000, '整筆價', '輔導', 'active'],
      ['SRV-003', '執行方式與控制項解說', '', '條文內容說明會 (約4小時)', 50000, '整筆價', '輔導', 'active'],
      ['SRV-004', '文件彙整與分類建議', '', '輔導諮詢會 (約3小時)', 30000, '整筆價', '輔導', 'active'],
      ['SRV-005', '文件內容審閱', '', '顧問諮詢與審閱 (共3次)', 30000, '整筆價', '輔導', 'active'],
      ['SRV-006', '內部稽核規劃與輔導', '', '內稽指導與模擬 (約6小時)', 50000, '整筆價', '輔導', 'active'],
      ['SRV-007', '導入人力支援服務', '', '按實際人天計價', 20000, '人天', '支援', 'active']
    ];
    catalogSheet.getRange(2, 1, defaultCatalog.length, 8).setValues(defaultCatalog);
  }

  // 4. 報價單 (Quotations)
  setupSheet(ss, 'Quotations', [
    'quotationId', 'quotationDate', 'validUntil', 'clientId', 'projectName', 
    'subtotal', 'discountType', 'discountValue', 'discountedTotal', 'grandTotal', 
    'taxIncluded', 'status', 'notes', 'paymentTerms', 'createdAt', 'updatedAt'
  ]);

  // 5. 報價單明細項 (QuotationItems)
  setupSheet(ss, 'QuotationItems', [
    'id', 'quotationId', 'itemNo', 'serviceId', 'customName', 'customDescription', 
    'executionMethod', 'quantity', 'pricingMethod', 'unitPrice', 'amount', 'type' // type: normal/additional
  ]);
  
  // 刪除預設的 "工作表1"
  const defaultSheet = ss.getSheetByName('工作表1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }
}

/**
 * 輔助函式：建立或取得 Sheet，並設定標頭
 */
function setupSheet(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  // 設定標頭 (如果第一列是空的)
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  if (!headerRange.getValue()) {
    headerRange.setValues([headers]);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f3f3f3');
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}
