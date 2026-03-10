/**
 * 客戶資料業務邏輯
 */
class ClientService {
  constructor() {
    this.dao = new SheetDAO('Clients');
  }

  getAll() {
     return this.dao.getAll();
  }

  getById(id) {
     return this.dao.getById(id);
  }

  create(clientData) {
     const newClient = this.dao.insert(clientData);
     return newClient;
  }

  update(id, clientData) {
     return this.dao.update(id, clientData);
  }
}
