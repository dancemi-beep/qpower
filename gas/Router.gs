/**
 * 將路由表統一至 Router.gs 管理，讓 Code.gs 更乾淨
 */

function handleClientAction(method, payload) {
  const service = new ClientService();
  switch (method) {
    case 'getAll': return service.getAll();
    case 'getById': return service.getById(payload.id);
    case 'create': return service.create(payload.data);
    case 'update': return service.update(payload.id, payload.data);
    default: throw new Error(`Unknown method: Client.${method}`);
  }
}

function handleQuotationAction(method, payload) {
  const service = new QuotationService();
  switch (method) {
    case 'getAll': return service.getAll();
    case 'getById': return service.getById(payload.id);
    case 'create': return service.create(payload.data);
    case 'update': return service.update(payload.id, payload.data);
    default: throw new Error(`Unknown method: Quotation.${method}`);
  }
}

function handleCompanyAction(method, payload) {
  const dao = new SheetDAO('CompanyProfile');
  switch (method) {
    case 'getAll': return dao.getAll();
    case 'update': return dao.update(payload.id, payload.data);
    default: throw new Error(`Unknown method: Company.${method}`);
  }
}
