var RECORD_BACKGROUND_ = '#B0DDBC';

namespace RecordService {
  
  
  export function record(recordStatement: SaveStatement): boolean {
    var activeSS = SpreadsheetApp.getActiveSpreadsheet();
    var selectedRange = activeSS.getActiveRange();
    var book = BookService.getBook(recordStatement.ledgerId);
    
    if (selectedRange.isBlank()) {
      Browser.msgBox("No data to record. Select a valid cell range.");
      return false;
    }
    if (recordStatement.recordType == 'transactions') {
      return recordTransactions(book, selectedRange, activeSS, recordStatement.highlight);
    } else if (recordStatement.recordType == 'accounts') {
      return recordAccounts(book, selectedRange, recordStatement.highlight);
    }

  }

  function recordAccounts(book: Bkper.Book, selectedRange: GoogleAppsScript.Spreadsheet.Range, highlight: boolean): boolean {
    return false;
  }
  function recordTransactions(book: Bkper.Book, selectedRange: GoogleAppsScript.Spreadsheet.Range, activeSS: GoogleAppsScript.Spreadsheet.Spreadsheet, highlight: boolean): boolean {
    TransactionAccountService.createAccountsIfNeeded(book, selectedRange);

    try {
      book.record(selectedRange.getValues(), activeSS.getSpreadsheetTimeZone());
      if (highlight) {
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