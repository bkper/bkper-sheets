try {
  //@ts-ignore
  BkperApp.APP_KEY = "AIzaSyDvJOj3NEj3qP676HyIBlJ3Upq3kvJcgJw";
} catch (err) {
  //OK
}

/**
 * @OnlyCurrentDoc
 */
function onOpen() {
  SpreadsheetApp.getUi().createAddonMenu()
  .addItem('Open', 'showSidebar')
  .addItem('Auto-Record...', 'showAutoRecordPopup')
  .addItem('Update', 'update')
  .addItem('Auto-Update...', 'showAutoUpdatePopup')
  .addToUi();
}

function onInstall() {
  onOpen();
}

function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit){
  var spreadsheet = getActiveSpreadsheet();
  var properties = getDocumentProperties();
  var fetchStatementDAO = new FetchStatementDAO(spreadsheet, properties);
  fetchStatementDAO.deleteEmptyStatements();
}

function getActiveSpreadsheet(): GoogleAppsScript.Spreadsheet.Spreadsheet {
  return Utilities_.retry(function() {
    return SpreadsheetApp.getActiveSpreadsheet();
  });
}

function getDocumentProperties(): GoogleAppsScript.Properties.Properties {
  return Utilities_.retry(function() {
    return PropertiesService.getDocumentProperties();
  });
}

function update() {
  if (BkperApp.isUserAuthorized()) {
    var lock = LockService.getDocumentLock();
    var success = lock.tryLock(20000);
    if (success) {
      var spreadsheet = getActiveSpreadsheet();
      var properties = getDocumentProperties();
      UpdateService_.updateDocument(spreadsheet, properties, false);
    }
  } else {
    showAuthorizeView_();
  }
}

function executeFetch(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, properties: GoogleAppsScript.Properties.Properties, fetchStatement: FetchStatement, range: GoogleAppsScript.Spreadsheet.Range, saveStatement: boolean): void {
  if (range == null) {
    range = spreadsheet.getActiveCell();
  }
  if(fetchStatement.query.length > 0) {    
    if (fetchStatement.fetchType == "balances") {
      BalanceService_.insert(spreadsheet, properties, fetchStatement, range, saveStatement);
    } else if (fetchStatement.fetchType == "transactions") {
      TransactionService_.insert(spreadsheet, fetchStatement, range);
    }
  }  
}
