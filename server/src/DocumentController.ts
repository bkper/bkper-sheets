/**
 * @OnlyCurrentDoc
 */
function onOpen() {
  return Utilities_.retry(function () {
    SpreadsheetApp.getUi().createAddonMenu()
    .addItem('Open', 'showSidebar')
    .addItem('Auto-Record', 'showAutoRecordPopup')
    .addItem('Update', 'update')
    .addToUi();
  });
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
  if (Authorizer.isUserAuthorized()) {
    var spreadsheet = getActiveSpreadsheet();
    var properties = getDocumentProperties();
    FormulaService.updateDocument(spreadsheet, properties);
  } else {
    showAuthorizeView_();
  }
}

function executeFetch(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, fetchStatement: FetchStatement, range: GoogleAppsScript.Spreadsheet.Range): void {
  if (range == null) {
    range = spreadsheet.getActiveCell();
  }
  range = range.getCell(1, 1);
  if (fetchStatement.ledgerId.length > 0) {
    let formula = Formula.parseFetchStatement(fetchStatement, spreadsheet.getSpreadsheetLocale());
    range.setFormula(formula.toString());
  }
}