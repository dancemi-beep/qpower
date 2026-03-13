/**
 * 客戶聯絡人業務邏輯
 */
class ContactService {
  constructor() {
    this.dao = new SheetDAO('ClientContacts');
  }

  /** 取得某客戶的所有聯絡人 */
  getByClientId(clientId) {
    return this.dao.find({ clientId });
  }

  /** 新增聯絡人（自動編號 CON-NNN） */
  create(data) {
    if (!data.clientId) throw new Error('缺少 clientId');
    if (!data.contactId) {
      const all = this.dao.getAll();
      const maxNum = all.reduce((max, c) => {
        const m = (c.contactId || '').match(/^CON-(\d+)$/);
        return m ? Math.max(max, parseInt(m[1], 10)) : max;
      }, 0);
      data.contactId = `CON-${String(maxNum + 1).padStart(3, '0')}`;
    }
    return this.dao.insert(data);
  }

  /** 更新聯絡人 */
  update(id, data) {
    return this.dao.update(id, data);
  }

  /** 刪除聯絡人 */
  delete(id) {
    return this.dao.delete(id);
  }

  /** 刪除某客戶的所有聯絡人（刪客戶時連帶清理） */
  deleteByClientId(clientId) {
    return this.dao.deleteByQuery({ clientId });
  }
}

