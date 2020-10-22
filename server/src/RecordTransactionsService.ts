var RECORD_BACKGROUND_ = '#B0DDBC';

namespace RecordTransactionsService {

  export function recordTransactions(book: Bkper.Book, selectedRange: GoogleAppsScript.Spreadsheet.Range, activeSS: GoogleAppsScript.Spreadsheet.Spreadsheet, highlight: boolean): boolean {
    TransactionAccountService.createAccountsIfNeeded(book, selectedRange);

    let transactions: Bkper.Transaction[] = []
    const timezone = activeSS.getSpreadsheetTimeZone();
    let values = selectedRange.getValues();

    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      transactions.push(arrayToTransaction_(row, book, timezone))
    }

    book.batchCreateTransactions(transactions);

    if (highlight) {
      selectedRange.setBackground(RECORD_BACKGROUND_);
    }

    return true;
  }

  function arrayToTransaction_(row: any[], book: Bkper.Book, timezone?: string): Bkper.Transaction {
    for (var j = 0; j < row.length; j++) {
      var cell = row[j];
      if (typeof cell == "string" || typeof cell == "boolean") {
        row[j] = cell;
      }
      else if (Object.prototype.toString.call(cell) === '[object Date]') {
        row[j] = book.formatDate(cell, timezone);
      } else if (!isNaN(cell)) {
        row[j] = book.formatValue(cell);
      }
    }
    let transaction = book.newTransaction();
    transaction.setDescription(row.join(" "))
    return transaction;
  }

}