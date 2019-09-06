var BALANCE_TYPE_TOTAL_ = "total";
var BALANCE_TYPE_PERIOD_ = "period";
var BALANCE_TYPE_CUMULATIVE_ = "cumulative";

function showSidebar(): void {
  if (BkperApp.isUserAuthorized()) {
    var ui = HtmlService.createTemplateFromFile('SidebarView').evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setTitle('Bkper Sheets');
    SpreadsheetApp.getUi().showSidebar(ui);
  } else {
    showAuthorizeView_();
  }
}

function checkUserAuthorized() {
  if (BkperApp.isUserAuthorized()) {
    showSidebar();
  }
}

function loadLedgers(): {id: string, name: string, permission : GoogleAppsScript.Bkper.Permission, selected: boolean}[] {
  try {
    var ledgers = LedgerService_.loadLedgers();
    var lastSelectedLedger = loadLastSelectedLedger();
    return ledgers.map((book => {return {id: book.getId(), name: book.getName(),  permission: book.getPermission(), selected: book.getId() == lastSelectedLedger}}));
  } catch (err) {
    if (!BkperApp.isUserAuthorized()) {
      showAuthorizeView_();
      throw err;
    }
  }  
}

function recordLines(ledgerId: string, highlight: boolean): boolean {
  return TransactionService_.record(ledgerId, highlight);
}

function loadQueries(ledgerId: string): LedgerQueries {
	return QueryService_.loadQueries(ledgerId);
}

function fetchQuery(fetchStatement: FetchStatement) {
  var spreadsheet = getActiveSpreadsheet();
  var properties = getDocumentProperties();
  executeFetch(spreadsheet, properties, fetchStatement, null, true);
}

function getRecordTemplatesKey() {
  return "LAST_SELECTED_LEDGER_ID_" + Session.getEffectiveUser().getEmail();
}

function loadLastSelectedLedger() {
  return getDocumentProperties().getProperty(getRecordTemplatesKey());
}

function saveLastSelectedLedger(ledgerId: string): void {
  if (ledgerId != null) {
    getDocumentProperties().setProperty(getRecordTemplatesKey(), ledgerId);
  } else {
    getDocumentProperties().deleteProperty(getRecordTemplatesKey())
  }
}

