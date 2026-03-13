/**
 * 將路由表統一至 Router.gs 管理，讓 Code.gs 更乾淨
 */

function handleClientAction(method, payload) {
  const service = new ClientService();
  switch (method) {
    case 'getAll': return service.getAll();
    case 'getById': return service.getById(payload.id);
    case 'getFullProfile': return service.getFullProfile(payload.id);
    case 'create': return service.create(payload.data);
    case 'update': return service.update(payload.id, payload.data);
    case 'delete': return service.delete(payload.id);
    case 'createTestClients':
      createTestClients();
      return { success: true, message: 'Test clients created' };
    default: throw new Error(`Unknown method: Client.${method}`);
  }
}

function handleContactAction(method, payload) {
  const service = new ContactService();
  switch (method) {
    case 'getByClientId': return service.getByClientId(payload.clientId);
    case 'create': return service.create(payload.data);
    case 'update': return service.update(payload.id, payload.data);
    case 'delete': return service.delete(payload.id);
    default: throw new Error(`Unknown method: Contact.${method}`);
  }
}

function handleNoteAction(method, payload) {
  const service = new NoteService();
  switch (method) {
    case 'getByClientId': return service.getByClientId(payload.clientId);
    case 'create': return service.create(payload.data);
    case 'delete': return service.delete(payload.id);
    default: throw new Error(`Unknown method: Note.${method}`);
  }
}

function handleQuotationAction(method, payload) {
  const service = new QuotationService();
  switch (method) {
    case 'getAll': return service.getAll();
    case 'getById': return service.getById(payload.id);
    case 'create': return service.create(payload.data);
    case 'update': return service.update(payload.id, payload.data);
    case 'delete': return service.delete(payload.id);
    default: throw new Error(`Unknown method: Quotation.${method}`);
  }
}

function handleCatalogAction(method, payload) {
  const service = new CatalogService();
  switch (method) {
    case 'getAll': return service.getAll();
    case 'getById': return service.getById(payload.id);
    case 'create': return service.create(payload.data);
    case 'update': return service.update(payload.id, payload.data);
    case 'delete': return service.delete(payload.id);
    case 'getPricingMethods': return service.getPricingMethods();
    default: throw new Error(`Unknown method: Catalog.${method}`);
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

function handleTemplateAction(method, payload) {
  switch (method) {
    case 'getNotes': return new SheetDAO('NotesTemplates').getAll();
    case 'getPaymentTerms': return new SheetDAO('PaymentTerms').getAll();
    default: throw new Error(`Unknown method: Template.${method}`);
  }
}
