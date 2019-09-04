
function showAutoRecordPopup(bookId) {
  var ui = HtmlService.createTemplateFromFile('AutoRecordView').evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setWidth(550).setHeight(155);
  if (bookId == null) {
    showSidebar();
    Browser.msgBox("Please select a book first.")
    return;
  }
  
  try {
    var sheetName = SpreadsheetApp.getActiveSheet().getName();
    var book = BkperApp.getBook(bookId);
    //Check if user has access to book
    book.getName();
    SpreadsheetApp.getUi().showModalDialog(ui, 'Auto-Record new lines from sheet [' + sheetName + ']?');
  } catch (error) {
    Utilities_.logError(error);
    showSidebar();
    Browser.msgBox("Please select a book first.")    
  }
}


function enableAutoRecord(sheet, bookId, properties) {
  return AutoRecordService_.createAutoRecordBinding(sheet, bookId, properties); 
}

function loadAutoRecordConfig(sheet, bookId, properties) {
  return AutoRecordService_.loadAutoRecordConfig(sheet, bookId, properties); 
}

function disableAutoRecord(sheet, bookId, properties) {
  return AutoRecordService_.deleteAutoRecordBinding(sheet,bookId, properties);
}

function processAutoRecord(spreadsheet, properties) {
  AutoRecordService_.processAutoRecord(spreadsheet, properties);
}