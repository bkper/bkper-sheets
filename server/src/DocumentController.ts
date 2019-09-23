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
    .addToUi();
}

function onInstall() {
  onOpen();
}

function getActiveSpreadsheet(): GoogleAppsScript.Spreadsheet.Spreadsheet {
  return Utilities_.retry(function () {
    return SpreadsheetApp.getActiveSpreadsheet();
  });
}

function getDocumentProperties(): GoogleAppsScript.Properties.Properties {
  return Utilities_.retry(function () {
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
      FormulaService.updateDocument(spreadsheet, properties);
    }
  } else {
    showAuthorizeView_();
  }
}

function executeFetch(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, fetchStatement: FetchStatement, range: GoogleAppsScript.Spreadsheet.Range, saveStatement: boolean): void {
  if (range == null) {
    range = spreadsheet.getActiveCell();
  }
  range = range.getCell(1, 1);
  if (fetchStatement.query.length > 0) {
    let formula = Formula.parseFetchStatement(fetchStatement);
    range.setFormula(formula.toString());
  }
}
