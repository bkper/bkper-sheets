var RECORD_BACKGROUND_ = '#B0DDBC';

namespace RecordTransactionsService {

  export function recordTransactions(book: Bkper.Book, selectedRange: GoogleAppsScript.Spreadsheet.Range, activeSS: GoogleAppsScript.Spreadsheet.Spreadsheet, highlight: boolean): boolean {
    
    const timezone = activeSS.getSpreadsheetTimeZone();
    
    batchCreateTransactions(book, selectedRange, selectedRange.getValues(), timezone);

    if (highlight) {
      selectedRange.setBackground(RECORD_BACKGROUND_);
    }

    return true;
  }

  export function batchCreateTransactions(book: Bkper.Book, range: GoogleAppsScript.Spreadsheet.Range,  values: any[][], timezone: string) {

    let header = new TransactionsHeader(range);

    let bookIdHeaderColumn = header.getBookIdHeaderColumn();
    
    if (bookIdHeaderColumn) {
      //MAP
      let transactionsBatch: {[bookId: string]: RecordTransactionBatch} = {}
      transactionsBatch[book.getId()] = new RecordTransactionBatch(book);
      for (const row of values) {
        let bookId = row[bookIdHeaderColumn.getIndex()];
        if (bookId != null && typeof bookId == "string" && bookId.trim() != '') {
          let batch = transactionsBatch[bookId];
          if (batch == null) {
            let rowBook = BkperApp.getBook(bookId);
            batch = new RecordTransactionBatch(rowBook);
            transactionsBatch[bookId] = batch;
          }
          batch.push(arrayToTransaction_(row, batch.getBook(), header, timezone))
        } else {
          let batch = transactionsBatch[book.getId()];
          batch.push(arrayToTransaction_(row, batch.getBook(), header, timezone))
        }
      }

      //REDUCE
      for (const key in transactionsBatch) {
        let batch = transactionsBatch[key];
        batch.getBook().batchCreateTransactions(batch.getTransactions());
      }
      
    } else {
      let transactions: Bkper.Transaction[] = [];
      for (const row of values) {
        transactions.push(arrayToTransaction_(row, book, header, timezone));
      }
      book.batchCreateTransactions(transactions);
    }
  }

    function formatValue(book: Bkper.Book, cell: any, timezone?: string) {
        if (Utilities_.isDate(cell)) {
            return book.formatDate(cell, timezone);
        } else if (!isNaN(cell)) {
            return book.formatAmount(cell);
        }
        return cell;
    }

    function formatProperty(book: Bkper.Book, cell: any, timezone?: string) {
        if (Utilities_.isDate(cell)) {
            return book.formatDate(cell, timezone);
        }
        return cell;
    }

  function arrayToTransaction_(row: any[], book: Bkper.Book, header: TransactionsHeader, timezone?: string): Bkper.Transaction {
    let transaction = book.newTransaction();
    let descriptionRow = []
    if (header.isValid()) {
      for (const column of header.getColumns()) {
        let value = row[column.getIndex()];
        if (createAccountIfNeeded(book, column, value)) {
          descriptionRow.push(value)
        } else if (column.isProperty()) {
          transaction.setProperty(column.getName(), formatProperty(book, value, timezone));
        } else if (column.isId()) {
            transaction.addRemoteId(value);
        } else if (!column.isBookId()) {
          descriptionRow.push(formatValue(book, value, timezone))
        }
      }
    } else {
        for (var j = 0; j < row.length; j++) {
            var cell = row[j];
            descriptionRow.push(formatValue(book, cell, timezone))
        }
    }

    transaction.setDescription(descriptionRow.join(" "))

    return transaction;
  }


  function createAccountIfNeeded(book: Bkper.Book, column: TransactionsHeaderColumn, value: any): boolean {
    let group = book.getGroup(column.getName());
    if (group) {
      try {
        book.createAccount(value, group.getName());
      } catch (error) {
        //Ok! Maybe account already exists
        Logger.log(error);
      }
      return true;
    } else {
      return false;
    }
  }
}