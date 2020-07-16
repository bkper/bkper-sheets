var RECORD_BACKGROUND_ = '#B0DDBC';

namespace SaveService {
  
  
  export function save(saveStatement: SaveStatement): boolean {
    var activeSS = SpreadsheetApp.getActiveSpreadsheet();
    var selectedRange = activeSS.getActiveRange();
    var book = BookService.getBook(saveStatement.ledgerId);
    
    if (!selectedRange.isBlank()) {
    } else {
      Browser.msgBox("No data to record. Select a valid cell range.");
      return false;
    }
    
    TransactionAccountService.createAccountsIfNeeded(book, selectedRange);

    try {
      book.record(selectedRange.getValues(), activeSS.getSpreadsheetTimeZone());
      if (saveStatement.highlight) {
        selectedRange.setBackground(RECORD_BACKGROUND_);
      }
      return true;
    } catch (e) {
      var error = JSON.stringify(e);
      
      Logger.log(error);
      return false;
    }
  }


}