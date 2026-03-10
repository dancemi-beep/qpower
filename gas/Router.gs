/**
 * 諮力顧問報價單管理系統 - 路由分發
 * Router.gs
 */

/**
 * 根據 action 將請求分發到對應的 Service
 * @param {string} action 例如 'quotation.list'
 * @param {Object} payload 請求參數
 * @returns {Object} 處理結果資料
 */
function routeRequest(action, payload) {
  switch (action) {
    // --- 報價單 (Quotation) ---
    case 'quotation.list':
      return QuotationService.getList(payload);
    case 'quotation.get':
      return QuotationService.get(payload.id);
    case 'quotation.create':
      return QuotationService.create(payload);
    case 'quotation.update':
      return QuotationService.update(payload.id, payload);
    case 'quotation.delete':
      return QuotationService.delete(payload.id);
    case 'quotation.exportPdf':
      return QuotationService.exportPdf(payload.id);

    // --- 客戶資料 (Client) ---
    case 'client.list':
      return ClientService.getList();
    case 'client.get':
      return ClientService.get(payload.id);
    case 'client.create':
      return ClientService.create(payload);
    case 'client.update':
      return ClientService.update(payload.id, payload);
    case 'client.delete':
      return ClientService.delete(payload.id);

    // --- 服務項目目錄 (Catalog) ---
    case 'catalog.list':
      return CatalogService.getList();
    case 'catalog.create':
      return CatalogService.create(payload);
    case 'catalog.update':
      return CatalogService.update(payload.id, payload);
    case 'catalog.delete':
      return CatalogService.delete(payload.id);

    // --- 公司資訊 (Company) ---
    case 'company.get':
      var all = getAll('公司資訊');
      return all.length > 0 ? all[0] : null;
    case 'company.update':
      // 假設公司資訊只有一筆
      var allData = getAll('公司資訊');
      if (allData.length > 0) {
        return update('公司資訊', 'companyName', allData[0].companyName, payload);
      }
      return insert('公司資訊', payload);
      
    // --- 模板 (Templates) ---
    case 'template.notes.list':
      return getAll('備註模板');
    case 'template.payment.list':
      return getAll('付款條件');

    default:
      throw new Error('Unknown action: ' + action);
  }
}
