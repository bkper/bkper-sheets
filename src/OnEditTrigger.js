function onEdit(e){
  var spreadsheet = getActiveSpreadsheet();
  var properties = getDocumentProperties();
  
  bkperSpreadsheetsAddonLib.clearEmptyFetchStatementsRanges(spreadsheet, properties);
}
