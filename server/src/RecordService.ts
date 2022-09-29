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
      return RecordTransactionsService.recordTransactions(book, selectedRange, activeSS, recordStatement.highlight);
    } else if (recordStatement.recordType == 'accounts') {
      return RecordAccountsService.recordAccounts(book, selectedRange, activeSS, recordStatement.highlight);
    } else if (recordStatement.recordType == 'groups') {
      return RecordGroupsService.recordGroups(book, selectedRange, activeSS, recordStatement.highlight);
    }

  }

}