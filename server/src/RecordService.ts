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

    let values = selectedRange.getValues();

    let groups: string[] = []
    for (let i = 0; i < values.length; i++) {
      const row = values[i]
      if (row.length > 1) {
        for (let j = 1; j < row.length; j++) {
          const cell = row[j];
          if (!isType(cell) && !book.getGroup(cell)) {
            groups.push(cell);
          }
        }
      }
    }

    if (groups.length > 0) {
      book.createGroups(groups);
    }

    let createdAccounts = book.createAccounts(values);

    //TODO hightlight

    return false;
  }

  function isType(groupOrType: string): boolean {
    if (groupOrType == BkperApp.AccountType.ASSET) {
      return true;
    }
    if (groupOrType == BkperApp.AccountType.LIABILITY) {
      return true;
    }
    if (groupOrType == BkperApp.AccountType.INCOMING) {
      return true;
    }
    if (groupOrType == BkperApp.AccountType.OUTGOING) {
      return true;
    }
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