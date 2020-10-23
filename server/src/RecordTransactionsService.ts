var RECORD_BACKGROUND_ = '#B0DDBC';

namespace RecordTransactionsService {

  export function recordTransactions(book: Bkper.Book, selectedRange: GoogleAppsScript.Spreadsheet.Range, activeSS: GoogleAppsScript.Spreadsheet.Spreadsheet, highlight: boolean): boolean {
    
    const timezone = activeSS.getSpreadsheetTimeZone();
    
    batchCreateTransactions(book, selectedRange, timezone);

    if (highlight) {
      selectedRange.setBackground(RECORD_BACKGROUND_);
    }

    return true;
  }

  export function batchCreateTransactions(book: Bkper.Book, range: GoogleAppsScript.Spreadsheet.Range, timezone: string) {

    let header = new TransactionsHeader(book, range);
    TransactionAccountService.createAccountsIfNeeded(header);
    
    let values = range.getValues();
    let transactions: Bkper.Transaction[] = [];
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      transactions.push(arrayToTransaction_(row, book, header, timezone));
    }

    book.batchCreateTransactions(transactions);
  }

  function arrayToTransaction_(row: any[], book: Bkper.Book, header: TransactionsHeader, timezone?: string): Bkper.Transaction {
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
    let descriptionRow = []
    if (header.isValid()) {
      for (const column of header.getColumns()) {
        let value = row[column.getIndex()];
        if (column.isProperty()) {
          transaction.setProperty(column.getName(), value);
        } else {
          //TODO parse others?
          descriptionRow.push(value)
        }
      }
    } else {
      descriptionRow = row;
    }

    transaction.setDescription(descriptionRow.join(" "))

    return transaction;
  }

}