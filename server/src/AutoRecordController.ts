function showAutoRecordPopup() {
  if (Authorizer.isUserAuthorized()) {
    var bookId = loadLastSelectedLedger();
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
  } else {
    showAuthorizeView_();
  }  
}

/**
 * @public
 */
function loadAutoRecordConfig() {
  var sheet = getActiveSpreadsheet().getActiveSheet();
  var bookId = loadLastSelectedLedger();
  var properties = getDocumentProperties(); 
  return AutoRecordService.loadAutoRecordConfig(sheet, bookId, properties);
}

/**
 * @public 
 */
function enableAutoRecord(enable: boolean): AutorecordConfig {
  var sheet = getActiveSpreadsheet().getActiveSheet();
  var bookId = loadLastSelectedLedger();
  var properties = getDocumentProperties();
  var config;
  if (enable) {
    if (!AutoRecordTrigger.isEnabled()) {
      AutoRecordTrigger.enableTrigger();
    }
    config = AutoRecordService.createAutoRecordBinding(sheet, bookId, properties);
  } else {
    config = AutoRecordService.deleteAutoRecordBinding(sheet, bookId, properties);
  }
  return config;
}
