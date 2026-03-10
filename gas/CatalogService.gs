/**
 * 服務項目目錄業務邏輯
 */
class CatalogService {
  constructor() {
    this.dao = new SheetDAO('ServiceCatalog');
  }

  /**
   * 取得所有服務項目
   */
  getAll() {
    return this.dao.getAll();
  }

  /**
   * 提供前端 Dropdown 所需的計價方式選項
   */
  getPricingMethods() {
    return ['整筆價', '人天', '小時'];
  }
}
