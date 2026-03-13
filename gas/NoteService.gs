/**
 * 客戶要求紀錄業務邏輯
 */
class NoteService {
  constructor() {
    this.dao = new SheetDAO('ClientNotes');
  }

  /** 取得某客戶的所有紀錄（按建立時間倒序） */
  getByClientId(clientId) {
    const notes = this.dao.find({ clientId });
    return notes.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }

  /** 新增紀錄（自動編號 CNT-NNN） */
  create(data) {
    if (!data.clientId) throw new Error('缺少 clientId');
    if (!data.content || !data.content.trim()) throw new Error('紀錄內容不可為空');
    if (!data.noteId) {
      const all = this.dao.getAll();
      const maxNum = all.reduce((max, n) => {
        const m = (n.noteId || '').match(/^CNT-(\d+)$/);
        return m ? Math.max(max, parseInt(m[1], 10)) : max;
      }, 0);
      data.noteId = `CNT-${String(maxNum + 1).padStart(3, '0')}`;
    }
    return this.dao.insert(data);
  }

  /** 刪除單筆紀錄 */
  delete(id) {
    return this.dao.delete(id);
  }

  /** 刪除某客戶的所有紀錄（刪客戶時連帶清理） */
  deleteByClientId(clientId) {
    return this.dao.deleteByQuery({ clientId });
  }
}

