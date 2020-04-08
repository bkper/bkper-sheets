var BALANCE_TYPE_TOTAL_ = "TOTAL";
var BALANCE_TYPE_PERIOD_ = "PERIOD";
var BALANCE_TYPE_CUMULATIVE_ = "CUMULATIVE";

function showSidebar(): void {
  if (Authorizer.isUserAuthorized()) {
    var ui = HtmlService.createTemplateFromFile('SidebarView').evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setTitle('Bkper');
    SpreadsheetApp.getUi().showSidebar(ui);
  } else {
    showAuthorizeView_();
  }
}

/**
 * @public
 */
function checkUserAuthorized() {
  if (Authorizer.isUserAuthorized()) {
    update();
    showSidebar();
  }
}

/**
 * @public
 */
function loadLedgers(): {id: string, name: string, permission : bkper.Permission, selected: boolean}[] {
  try {
    var ledgers = BookService.loadBooks();
    var lastSelectedLedger = loadLastSelectedLedger();
    return ledgers.map((book => {return {id: book.getId(), name: book.getName(),  permission: book.getPermission(), selected: book.getId() == lastSelectedLedger}}));
  } catch (err) {
    if (!Authorizer.isUserAuthorized()) {
      showAuthorizeView_();
      throw err;
    }
  }  
}

/**
 * @public
 */
function recordLines(ledgerId: string, highlight: boolean): boolean {
  return TransactionService.record(ledgerId, highlight);
}

/**
 * @public
 */
function loadQueries(ledgerId: string): LedgerQueries {
	return QueryService.loadQueries(ledgerId);
}

/**
 * @public
 */
function fetchQuery(fetchStatement: FetchStatement) {
  var spreadsheet = getActiveSpreadsheet();
  executeFetch(spreadsheet, fetchStatement, null);
}

function getRecordTemplatesKey() {
  return "LAST_SELECTED_LEDGER_ID_" + Session.getEffectiveUser().getEmail();
}

function loadLastSelectedLedger() {
  return getDocumentProperties().getProperty(getRecordTemplatesKey());
}

/**
 * @public
 */
function saveLastSelectedLedger(ledgerId: string): void {
  if (ledgerId != null) {
    getDocumentProperties().setProperty(getRecordTemplatesKey(), ledgerId);
  } else {
    getDocumentProperties().deleteProperty(getRecordTemplatesKey())
  }
}
