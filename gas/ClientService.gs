/**
 * 客戶資料業務邏輯
 * Clients 表欄位：clientId, companyName, taxId, address, createdAt, updatedAt
 * 聯絡人 → ClientContacts（ContactService）
 * 要求紀錄 → ClientNotes（NoteService）
 */
class ClientService {
  constructor() {
    this.dao = new SheetDAO('Clients');
  }

  /** 取得所有客戶（含主要聯絡人 denormalize） */
  getAll() {
    const clients = this.dao.getAll();
    const contactService = new ContactService();
    const allContacts = contactService.dao.getAll();

    return clients.map(c => {
      const contacts = allContacts.filter(ct => ct.clientId === c.clientId);
      const primary = contacts.find(ct => String(ct.isPrimary) === 'true') || contacts[0];
      return {
        ...c,
        primaryContact: primary ? primary.contactName : '',
        primaryPhone: primary ? primary.contactPhone : '',
        primaryEmail: primary ? primary.contactEmail : '',
        contactCount: contacts.length
      };
    });
  }

  getById(id) {
    return this.dao.getById(id);
  }

  /** 取得客戶完整資料（含聯絡人 + 紀錄 + 歷史報價） */
  getFullProfile(id) {
    const client = this.dao.getById(id);
    if (!client) throw new Error(`客戶 ${id} 不存在`);

    const contactService = new ContactService();
    const noteService = new NoteService();
    const quotationDao = new SheetDAO('Quotations');

    const contacts = contactService.getByClientId(id);
    const notes = noteService.getByClientId(id);
    const quotations = quotationDao.find({ clientId: id }).map(q => ({
      quotationId: q.quotationId,
      projectName: q.projectName || '',
      grandTotal: Number(q.grandTotal) || 0,
      status: q.status || '草稿',
      quotationDate: q.quotationDate || ''
    }));

    return { ...client, contacts, notes, quotations };
  }

  create(clientData) {
    // 自動產生客戶編號 (CLT-NNN)
    if (!clientData.clientId) {
      const all = this.dao.getAll();
      const maxNum = all.reduce((max, c) => {
        const match = (c.clientId || '').match(/^CLT-(\d+)$/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);
      clientData.clientId = `CLT-${String(maxNum + 1).padStart(3, '0')}`;
    }
    return this.dao.insert(clientData);
  }

  update(id, clientData) {
    return this.dao.update(id, clientData);
  }

  /** 刪除客戶（連帶清理聯絡人、紀錄） */
  delete(id) {
    new ContactService().deleteByClientId(id);
    new NoteService().deleteByClientId(id);
    return this.dao.delete(id);
  }
}
