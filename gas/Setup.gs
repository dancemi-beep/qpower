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

  // 2. 客戶資訊 (Clients) — 聯絡人/備註已正規化至獨立 Sheet
  setupSheet(ss, 'Clients', [
    'clientId', 'companyName', 'taxId', 'address', 'createdAt', 'updatedAt'
  ]);

  const clientSheet = ss.getSheetByName('Clients');
  if (clientSheet.getLastRow() <= 1) {
    const ts = Utils.getCurrentTimestamp();
    const defaultClients = [
      ['CLT-001', '示範客戶 A', '12345678', '台北市信義區...', ts, ts]
    ];
    clientSheet.getRange(2, 1, defaultClients.length, 6).setValues(defaultClients);
  }

  // 2a. 客戶聯絡人 (ClientContacts)
  setupSheet(ss, 'ClientContacts', [
    'contactId', 'clientId', 'contactName', 'contactPhone', 'contactEmail', 'isPrimary', 'createdAt'
  ]);

  const contactSheet = ss.getSheetByName('ClientContacts');
  if (contactSheet.getLastRow() <= 1) {
    const ts = Utils.getCurrentTimestamp();
    const defaultContacts = [
      ['CON-001', 'CLT-001', '王小明', '02-1234-5678', 'test@example.com', true, ts]
    ];
    contactSheet.getRange(2, 1, defaultContacts.length, 7).setValues(defaultContacts);
  }

  // 2b. 客戶要求紀錄 (ClientNotes)
  setupSheet(ss, 'ClientNotes', [
    'noteId', 'clientId', 'content', 'createdAt'
  ]);

  const clientNoteSheet = ss.getSheetByName('ClientNotes');
  if (clientNoteSheet.getLastRow() <= 1) {
    const ts = Utils.getCurrentTimestamp();
    const defaultNotes = [
      ['CNT-001', 'CLT-001', '系統預設測試客戶，可安全刪除。', ts]
    ];
    clientNoteSheet.getRange(2, 1, defaultNotes.length, 4).setValues(defaultNotes);
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
  
  // 6. 備註模板 (NotesTemplates)
  setupSheet(ss, 'NotesTemplates', [
    'templateId', 'templateName', 'content', 'sortOrder', 'isDefault', 'createdAt'
  ]);

  const notesSheet = ss.getSheetByName('NotesTemplates');
  if (notesSheet.getLastRow() <= 1) {
    const ts = Utils.getCurrentTimestamp();
    const defaultNotes = [
      ['NT-001', '範圍限制', '本報價僅涵蓋上述所列之服務項目，如有額外需求將另行報價。', 1, true, ts],
      ['NT-002', '不含驗證規費', '本報價不含第三方驗證機構之審查規費及差旅費用。', 2, true, ts],
      ['NT-003', '未稅聲明', '以上費用均為未稅價格，如需開立發票將另加 5% 營業稅。', 3, true, ts],
      ['NT-004', '時程協調', '實際執行時程將依雙方協調後確認，如有異動將提前通知。', 4, true, ts]
    ];
    notesSheet.getRange(2, 1, defaultNotes.length, 6).setValues(defaultNotes);
  }

  // 7. 付款條件模板 (PaymentTerms)
  setupSheet(ss, 'PaymentTerms', [
    'termId', 'termName', 'content', 'sortOrder', 'isDefault', 'createdAt'
  ]);

  const paymentSheet = ss.getSheetByName('PaymentTerms');
  if (paymentSheet.getLastRow() <= 1) {
    const ts = Utils.getCurrentTimestamp();
    const defaultTerms = [
      ['PT-001', '二期款 50/50', '第一期款：簽約後支付 50% 含稅\n第二期款：完成後支付 50% 含稅', 1, true, ts],
      ['PT-002', '三期款 40/30/30', '第一期款：簽約後支付 40% 含稅\n第二期款：期中支付 30% 含稅\n第三期款：完成後支付 30% 含稅', 2, false, ts],
      ['PT-003', '一次付清', '於簽約後一次支付全額含稅款項。', 3, false, ts]
    ];
    paymentSheet.getRange(2, 1, defaultTerms.length, 6).setValues(defaultTerms);
  }

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

  // 永遠同步標頭（確保欄位與程式碼定義一致）
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#f3f3f3');
  sheet.setFrozenRows(1);

  return sheet;
}
/**
 * 手動建立測試客戶資料
 */
function createTestClients() {
  const service = new ClientService();
  
  const testClients = [
    {
      companyName: '測試企業股份有限公司',
      contactPerson: '張小姐',
      contactPhone: '02-8888-9999',
      contactEmail: 'test1@example.com',
      address: '台北市大安區忠孝東路',
      notes: '手動新增測試 A'
    },
    {
      companyName: '好夥伴諮詢有限公司',
      contactPerson: '李先生',
      contactPhone: '03-555-6666',
      contactEmail: 'test2@example.com',
      address: '新竹市科學園區',
      notes: '手動新增測試 B'
    }
  ];

  testClients.forEach(c => service.create(c));
  console.log('Test clients created successfully.');
}
