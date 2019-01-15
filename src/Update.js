function update() {
  if (bkperSpreadsheetsAddonLib.isUserAuthorized()) {
    var lock = LockService.getDocumentLock();
    var success = lock.tryLock(20000);
    if (success) {
      var spreadsheet = getActiveSpreadsheet();
      var properties = getDocumentProperties();
      bkperSpreadsheetsAddonLib.update(spreadsheet, properties, false);
    }
  } else {
    showAuthorizeView_();
  }
}
