/**
 * Web App 入口與路由
 */

function doGet(e) {
  const page = e.parameter.page || 'index';
  return HtmlService.createTemplateFromFile(page)
    .evaluate()
    .setTitle('諮力報價單系統')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const result = routeApi(postData);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 處理來自前端的請求
 */
function routeApi(request) {
  try {
    const { action, payload } = request;
    console.log(`[API Request] Action: ${action}`);
    let result;

    if (!action) {
      throw new Error('Missing action parameter');
    }

    // 根據 action 名稱前綴分派到對應的 Service
    if (action.startsWith('Catalog.')) {
      result = handleCatalogAction(action.split('.')[1], payload);
    } else if (action.startsWith('Client.')) {
      result = handleClientAction(action.split('.')[1], payload);
    } else if (action.startsWith('Quotation.')) {
      result = handleQuotationAction(action.split('.')[1], payload);
    } else if (action.startsWith('Company.')) {
      result = handleCompanyAction(action.split('.')[1], payload);
    } else if (action.startsWith('Contact.')) {
      result = handleContactAction(action.split('.')[1], payload);
    } else if (action.startsWith('Note.')) {
      result = handleNoteAction(action.split('.')[1], payload);
    } else if (action.startsWith('Template.')) {
      result = handleTemplateAction(action.split('.')[1], payload);
    } else if (action === 'System.initializeDatabase') {
      initializeDatabase();
      result = { message: 'Database initialized with defaults' };
    } else {
      throw new Error(`Unknown action type: ${action}`);
    }

    return { success: true, data: result };
  } catch (err) {
    console.error(`[API Error] ${request.action}:`, err);
    return { success: false, error: err.toString() };
  }
}

/**
 * 各模組的 Action 處理函式已全數遷移至 Router.gs
 */

// 補助函式，用於在 HTML 模板中包含其他檔案
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
