function showAutoRecordPopup() {
  if (BkperApp.isUserAuthorized()) {
    var bookId = loadLastSelectedLedger();
    bkperSpreadsheetsAddonLib.showAutoRecordPopup(bookId);
  } else {
    showAuthorizeView_();
  }  
}

function loadAutoRecordConfig() {
  var sheet = getActiveSpreadsheet().getActiveSheet();
  var bookId = loadLastSelectedLedger();
  var properties = getDocumentProperties(); 
  return bkperSpreadsheetsAddonLib.loadAutoRecordConfig(sheet, bookId, properties);
}

function enableAutoRecord(enable) {
  var sheet = getActiveSpreadsheet().getActiveSheet();
  var bookId = loadLastSelectedLedger();
  var properties = getDocumentProperties();
  var config;
  if (enable) {
    if (!AutoRecordTrigger.isEnabled()) {
      AutoRecordTrigger.enableTrigger();
    }
    config = bkperSpreadsheetsAddonLib.enableAutoRecord(sheet, bookId, properties);
  } else {
    config = bkperSpreadsheetsAddonLib.disableAutoRecord(sheet, bookId, properties);
  }
  return config;
}

