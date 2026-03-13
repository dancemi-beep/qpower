/**
 * 服務項目目錄業務邏輯
 */
class CatalogService {
  constructor() {
    this.dao = new SheetDAO('ServiceCatalog');
  }

  getAll() {
    return this.dao.getAll();
  }

  getById(id) {
    return this.dao.getById(id);
  }

  create(data) {
    // 自動產生 serviceId (SRV-NNN)
    if (!data.serviceId) {
      const all = this.dao.getAll();
      const nextNum = all.length + 1;
      data.serviceId = `SRV-${String(nextNum).padStart(3, '0')}`;
    }
    if (!data.status) data.status = 'active';
    return this.dao.insert(data);
  }

  update(id, data) {
    return this.dao.update(id, data);
  }

  delete(id) {
    return this.dao.delete(id);
  }

  getPricingMethods() {
    return ['整筆價', '人天', '小時'];
  }
}
