/**
 * 報價單與明細項目業務邏輯
 */
class QuotationService {
  constructor() {
    this.quotationDao = new SheetDAO('Quotations');
    this.itemDao = new SheetDAO('QuotationItems');
  }

  getAll() {
     return this.quotationDao.getAll();
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
     
     // 1. 產生自訂格式的報價單編號 (格式: #YYYYMMDD-NNN)
     const now = new Date();
     const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
     
     const allQuotations = this.quotationDao.getAll();
     const todayCount = allQuotations.filter(q => q.quotationId && q.quotationId.includes(dateStr)).length;
     const seqNo = (todayCount + 1).toString().padStart(3, '0');
     
     headerData.quotationId = `#${dateStr}-${seqNo}`;
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

     // 更新明細項目 (簡化版：全部刪除舊的再新增新的)
     if (items) {
        // [TODO] 實作刪除舊 items (需擴充 DAO 支援依條件刪除)
        // 此處為概念展示，暫未實作 delete 操作
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
