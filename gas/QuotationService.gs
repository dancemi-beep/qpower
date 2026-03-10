/**
 * 諮力顧問報價單管理系統 - 報價單服務層
 * QuotationService.gs
 */

var QuotationService = {
  
  /**
   * 取得報價單列表
   * @param {Object} filters 篩選條件
   */
  getList: function(filters) {
    var list = getAll('報價單');
    
    // 如果有篩選
    if (filters) {
      list = list.filter(function(q) {
        if (filters.status && q.status !== filters.status) return false;
        if (filters.clientId && q.clientId !== filters.clientId) return false;
        return true;
      });
    }
    
    // 依日期降冪排序
    list.sort(function(a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    return list;
  },
  
  /**
   * 取得單筆報價單 (含明細)
   */
  get: function(id) {
    var quotation = getById('報價單', 'quotationId', id);
    if (!quotation) throw new Error('Quotation not found: ' + id);
    
    // 取得明細
    var items = getByFilter('報價明細', { 'quotationId': id });
    
    // 確保明細依項次排序
    items.sort(function(a, b) {
      return Number(a.itemNo) - Number(b.itemNo);
    });
    
    quotation.items = items;
    return quotation;
  },
  
  /**
   * 建立新報價單
   */
  create: function(data) {
    var qid = generateQuotationId();
    var now = new Date();
    
    var quotation = {
      quotationId: qid,
      quotationDate: data.quotationDate || formatDate(now),
      validUntil: data.validUntil || formatDate(calcValidUntil(now, 30)),
      clientId: data.clientId,
      projectName: data.projectName || '',
      subtotal: data.subtotal || 0,
      discountType: data.discountType || '',
      discountValue: data.discountValue || 0,
      discountedTotal: data.discountedTotal || 0,
      grandTotal: data.grandTotal || 0,
      taxIncluded: data.taxIncluded !== false, // 預設為 true
      status: data.status || '草稿',
      notes: data.notes || '',
      paymentTerms: data.paymentTerms || '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    
    // 新增主表
    var result = insert('報價單', quotation);
    result.items = [];
    
    // 新增明細
    if (data.items && data.items.length > 0) {
      var itemRows = data.items.map(function(item, idx) {
        var qty = toNumber(item.quantity);
        var price = toNumber(item.unitPrice);
        
        return {
          quotationId: qid,
          itemNo: idx + 1,
          serviceId: item.serviceId || '',
          customName: item.customName || '',
          customDescription: item.customDescription || '',
          executionMethod: item.executionMethod || '',
          quantity: qty,
          unit: item.unit || '',
          unitPrice: price,
          amount: qty * price
        };
      });
      
      insertBatch('報價明細', itemRows);
      result.items = itemRows;
    }
    
    return result;
  },
  
  /**
   * 更新報價單
   */
  update: function(id, data) {
    var existing = getById('報價單', 'quotationId', id);
    if (!existing) throw new Error('Quotation not found: ' + id);
    
    // 更新主表欄位
    var updateData = {
      quotationDate: data.quotationDate !== undefined ? data.quotationDate : existing.quotationDate,
      validUntil: data.validUntil !== undefined ? data.validUntil : existing.validUntil,
      clientId: data.clientId !== undefined ? data.clientId : existing.clientId,
      projectName: data.projectName !== undefined ? data.projectName : existing.projectName,
      subtotal: data.subtotal !== undefined ? data.subtotal : existing.subtotal,
      discountType: data.discountType !== undefined ? data.discountType : existing.discountType,
      discountValue: data.discountValue !== undefined ? data.discountValue : existing.discountValue,
      discountedTotal: data.discountedTotal !== undefined ? data.discountedTotal : existing.discountedTotal,
      grandTotal: data.grandTotal !== undefined ? data.grandTotal : existing.grandTotal,
      taxIncluded: data.taxIncluded !== undefined ? data.taxIncluded : existing.taxIncluded,
      status: data.status !== undefined ? data.status : existing.status,
      notes: data.notes !== undefined ? data.notes : existing.notes,
      paymentTerms: data.paymentTerms !== undefined ? data.paymentTerms : existing.paymentTerms,
      updatedAt: new Date().toISOString()
    };
    
    var result = update('報價單', 'quotationId', id, updateData);
    
    // 若有傳入 items，則全刪全重建，確保同步
    if (data.items) {
      deleteByFilter('報價明細', 'quotationId', id);
      
      if (data.items.length > 0) {
        var itemRows = data.items.map(function(item, idx) {
          var qty = toNumber(item.quantity);
          var price = toNumber(item.unitPrice);
          
          return {
            quotationId: id,
            itemNo: idx + 1,
            serviceId: item.serviceId || '',
            customName: item.customName || '',
            customDescription: item.customDescription || '',
            executionMethod: item.executionMethod || '',
            quantity: qty,
            unit: item.unit || '',
            unitPrice: price,
            amount: qty * price
          };
        });
        insertBatch('報價明細', itemRows);
        result.items = itemRows;
      } else {
        result.items = [];
      }
    } else {
      // 若沒傳 items，還是把舊的撈出來回給前端
      result.items = getByFilter('報價明細', { 'quotationId': id });
    }
    
    return result;
  },
  
  /**
   * 刪除報價單
   */
  delete: function(id) {
    // 只能刪除草稿
    var existing = getById('報價單', 'quotationId', id);
    if (!existing) throw new Error('Quotation not found: ' + id);
    if (existing.status !== '草稿') {
      throw new Error('Only draft quotations can be deleted');
    }
    
    deleteRow('報價單', 'quotationId', id);
    deleteByFilter('報價明細', 'quotationId', id);
    
    return { id: id, deleted: true };
  },

  /**
   * 產生 PDF (佔位，後續實作)
   */
  exportPdf: function(id) {
    // Phase 3 實作
    throw new Error('PDF export not implemented yet');
  }
};
