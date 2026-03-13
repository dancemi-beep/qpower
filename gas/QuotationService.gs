/**
 * 報價單與明細項目業務邏輯
 */
class QuotationService {
  constructor() {
    this.quotationDao = new SheetDAO('Quotations');
    this.itemDao = new SheetDAO('QuotationItems');
  }

  getAll() {
     const quotations = this.quotationDao.getAll();
     const clients = new ClientService().getAll();

     console.log(`[Debug] Quotations count: ${quotations.length}`);
     console.log(`[Debug] Clients count: ${clients.length}`);
     if (quotations.length > 0) {
       console.log(`[Debug] Quotation[0] raw keys: ${Object.keys(quotations[0]).join(', ')}`);
       console.log(`[Debug] Quotation[0] raw JSON: ${JSON.stringify(quotations[0])}`);
     }
     if (clients.length > 0) {
       console.log(`[Debug] Client[0] raw keys: ${Object.keys(clients[0]).join(', ')}`);
     }

     // 建立 ID 對映表以提高搜尋效率
     const clientMap = {};
     clients.forEach(c => {
       clientMap[c.clientId] = c.companyName;
     });

     // 將客戶名稱合併回報價單物件，同時確保數字欄位正確
     const result = quotations.map(q => ({
       ...q,
       subtotal: Number(q.subtotal) || 0,
       discountedTotal: Number(q.discountedTotal) || 0,
       grandTotal: Number(q.grandTotal) || 0,
       clientName: clientMap[q.clientId] || '未知客戶'
     }));

     console.log(`[Debug] Final result[0]: ${result.length > 0 ? JSON.stringify(result[0]) : 'EMPTY'}`);
     return result;
  }

  getById(id) {
     const quotation = this.quotationDao.getById(id);
     if (!quotation) return null;

     // 附加明細項目
     quotation.items = this.itemDao.find({ quotationId: id });
     return quotation;
  }

  /**
   * 建立報價單 (草稿)
   * @param {Object} data 包含基本資料與 items 陣列
   */
  create(data) {
     const { items, ...headerData } = data;
     
     // 1. 產生自訂格式的報價單編號 (格式: QUO-YYYYMMDD-NNN)
     const now = new Date();
     const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;

     const allQuotations = this.quotationDao.getAll();
     const todayCount = allQuotations.filter(q => q.quotationId && q.quotationId.includes(dateStr)).length;
     const seqNo = (todayCount + 1).toString().padStart(3, '0');

     headerData.quotationId = `QUO-${dateStr}-${seqNo}`;
     headerData.quotationDate = Utils.getCurrentTimestamp().split('T')[0]; // YYYY-MM-DD
     headerData.status = '草稿';
     headerData.createdAt = Utils.getCurrentTimestamp();

     // 重新計算確保後端一致性
     const calculated = this._calculateTotals(items, headerData.discountType, headerData.discountValue, headerData.taxIncluded);
     Object.assign(headerData, calculated);

     const newQuotation = this.quotationDao.insert(headerData);

     // 2. 寫入明細項目
     if (items && items.length > 0) {
        items.forEach((item, index) => {
            const itemObj = {
                ...item,
                quotationId: newQuotation.quotationId,
                itemNo: index + 1,
                amount: (item.quantity || 1) * (item.unitPrice || 0)
            };
            this.itemDao.insert(itemObj);
        });
     }

     return newQuotation;
  }

  /**
   * 刪除報價單（連同明細項目）
   */
  delete(id) {
     // 先刪明細
     this.itemDao.deleteByQuery({ quotationId: id });
     // 再刪主表
     return this.quotationDao.delete(id);
  }

  /**
   * 更新報價單
   */
  update(id, data) {
     const { items, ...headerUpdate } = data;
     
     const currentHeader = this.quotationDao.getById(id);
     if (!currentHeader) throw new Error(`Quotation ${id} not found.`);

     // 重新計算
     if (items) {
        const calculated = this._calculateTotals(items, headerUpdate.discountType || currentHeader.discountType, headerUpdate.discountValue || currentHeader.discountValue);
        Object.assign(headerUpdate, calculated);
     }
     
     const updatedQuotation = this.quotationDao.update(id, headerUpdate);

     // 更新明細項目：刪除舊的再新增新的
     if (items) {
        this.itemDao.deleteByQuery({ quotationId: id });
        items.forEach((item, index) => {
          const itemObj = {
            ...item,
            quotationId: id,
            itemNo: index + 1,
            amount: (item.quantity || 1) * (item.unitPrice || 0)
          };
          this.itemDao.insert(itemObj);
        });
     }

     return updatedQuotation;
  }

  /**
   * 後端重新計算金額邏輯
   */
  _calculateTotals(items, discountType, discountValue, taxIncluded) {
      if (!items || items.length === 0) return { subtotal: 0, discountedTotal: 0, grandTotal: 0 };
      
      let subtotal = 0;
      let additionalTotal = 0;

      items.forEach(item => {
         const amt = (item.quantity || 1) * (item.unitPrice || 0);
         if (item.type === 'additional') {
             additionalTotal += amt;
         } else {
             subtotal += amt;
         }
      });

      let discountedTotal = subtotal;
      if (discountType === 'percentage' && discountValue > 0) {
          discountedTotal = subtotal * (1 - (discountValue / 100));
      } else if (discountType === 'fixed' && discountValue > 0) {
          discountedTotal = Math.max(0, subtotal - discountValue);
      }

      let totalBeforeTax = discountedTotal + additionalTotal;
      let grandTotal = totalBeforeTax;
      
      if (taxIncluded) {
          grandTotal = Math.round(totalBeforeTax * 1.05);
      }

      return {
          subtotal: Math.round(subtotal),
          discountedTotal: Math.round(discountedTotal),
          grandTotal: Math.round(grandTotal)
      };
  }
}
