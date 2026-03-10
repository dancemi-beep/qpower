/**
 * 諮力顧問報價單管理系統 - 客戶與服務目錄服務層
 * ClientService.gs / CatalogService.gs
 */

var ClientService = {
  getList: function() {
    return getAll('客戶資料');
  },
  
  get: function(id) {
    var client = getById('客戶資料', 'clientId', id);
    if (!client) throw new Error('Client not found: ' + id);
    return client;
  },
  
  create: function(data) {
    if (!data.companyName) throw new Error('Company name is required');
    
    var client = {
      clientId: 'C' + generateId(),
      companyName: data.companyName,
      contactPerson: data.contactPerson || '',
      contactPhone: data.contactPhone || '',
      contactEmail: data.contactEmail || '',
      address: data.address || '',
      notes: data.notes || ''
    };
    
    return insert('客戶資料', client);
  },
  
  update: function(id, data) {
    return update('客戶資料', 'clientId', id, data);
  },
  
  delete: function(id) {
    // 檢查是否有關聯報價單
    var quotations = getByFilter('報價單', { 'clientId': id });
    if (quotations.length > 0) {
      throw new Error('Cannot delete client with existing quotations');
    }
    deleteRow('客戶資料', 'clientId', id);
    return { id: id, deleted: true };
  }
};

var CatalogService = {
  getList: function() {
    return getAll('服務項目');
  },
  
  create: function(data) {
    if (!data.serviceName) throw new Error('Service name is required');
    
    var service = {
      serviceId: 'S' + generateId(),
      serviceName: data.serviceName,
      description: data.description || '',
      executionMethod: data.executionMethod || '',
      defaultPrice: toNumber(data.defaultPrice),
      unit: data.unit || '式',
      category: data.category || ''
    };
    
    return insert('服務項目', service);
  },
  
  update: function(id, data) {
    return update('服務項目', 'serviceId', id, data);
  },
  
  delete: function(id) {
    // 註：因為報價明明細會自己存一份品名價格，所以直接刪除目錄不影響已存在的報價單
    deleteRow('服務項目', 'serviceId', id);
    return { id: id, deleted: true };
  }
};
