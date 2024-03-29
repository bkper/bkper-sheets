var RECORD_BACKGROUND_ = '#b0ddbc';
var ERROR_BACKGROUND_ = '#ea9999';

namespace RecordTransactionsService {

  export function recordTransactions(book: Bkper.Book, selectedRange: GoogleAppsScript.Spreadsheet.Range, activeSS: GoogleAppsScript.Spreadsheet.Spreadsheet, highlight: boolean): boolean {

    const timezone = activeSS.getSpreadsheetTimeZone();

    const success = batchCreateTransactions(book, selectedRange, selectedRange.getValues(), timezone);

    if (highlight && success) {
      selectedRange.setBackground(RECORD_BACKGROUND_);
    }

    return success;
  }

  export function batchCreateTransactions(book: Bkper.Book, range: GoogleAppsScript.Spreadsheet.Range, values: any[][], timezone: string): boolean {

    let header = new TransactionsHeader(range);

    if (findDuplicatedTransactionIds(header, range)) {
      const htmlOutput = Utilities_.getErrorHtmlOutput('There are transactions with the same ID. Please review duplicates (marked in red) and try again.');
      SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Error');
      return false;
    }

    let bookIdHeaderColumn = header.getBookIdHeaderColumn();

    if (bookIdHeaderColumn) {
      //MAP
      let transactionsBatch: { [bookId: string]: RecordTransactionBatch } = {}
      transactionsBatch[book.getId()] = new RecordTransactionBatch(book);
      for (const row of values) {
        let bookId = row[bookIdHeaderColumn.getIndex()];
        if (bookId != null && typeof bookId == "string" && bookId.trim() != '') {
          if (!Utilities_.hasBookIdPrefix(bookId)) {
            throw `Selected range has invalid book id: '${bookId}'`;
          }
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

    return true;
  }

  function formatValue(book: Bkper.Book, cell: any, timezone?: string) {
    if (Utilities_.isDate(cell)) {
      return book.formatDate(cell, timezone);
    } else if (!isNaN(cell)) {
      return book.formatAmount(cell);
    }
    return cell;
  }

  function formatProperty(book: Bkper.Book, cell: any, timezone?: string): string {
    if (Utilities_.isDate(cell)) {
      return book.formatDate(cell, timezone);
    }
    return `${cell}`;
  }

  function arrayToTransaction_(row: any[], book: Bkper.Book, header: TransactionsHeader, timezone?: string): Bkper.Transaction {
    let transaction = book.newTransaction();
    let descriptionRow = []
    if (header.isValid()) {
      for (const column of header.getColumns()) {
        let value = row[column.getIndex()];

        if ((value && value != '') || value == 0) {

          if (createAccountIfNeeded(book, column, value)) {
            descriptionRow.push(value)
          } else if (column.isCreditAccount()) {
            transaction.setCreditAccount(value);
          } else if (column.isDebitAccount()) {
            transaction.setDebitAccount(value);
          } else if (column.isDate()) {
            transaction.setDate(value);
          } else if (column.isAmount()) {
            transaction.setAmount(value);
          } else if (column.isDescription()) {
            transaction.setDescription(value);
          } else if (column.isAttachment()) {
            transaction.addUrl(value)
          } else if (column.isProperty()) {
            transaction.setProperty(column.getName(), formatProperty(book, value, timezone));
          } else if (column.isId()) {
            transaction.addRemoteId(value);
          } else if (!column.isBookId()) {
            descriptionRow.push(formatValue(book, value, timezone))
          }
        }

      }
    } else {
      for (var j = 0; j < row.length; j++) {
        var cell = row[j];
        descriptionRow.push(formatValue(book, cell, timezone))
      }
    }

    if (transaction.getDescription() == '') {
      let descrition = descriptionRow.join(" ");
      if (descrition.trim().length > 0) {
        transaction.setDescription(descrition)
      }
    }

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

  function findDuplicatedTransactionIds(header: TransactionsHeader, transactionsDataRange: GoogleAppsScript.Spreadsheet.Range): boolean {

    const columns = header.getColumns();

    let findDuplicatedTransactionIds = false;

    // search for ID header
    for (const column of columns) {
      if (column.isId()) {
        const idColumnIndex = column.getIndex();
        const transactionsData = transactionsDataRange.getValues();
        let idsMap = new Map<string, string>();
        let errorBackgroundsSet = new Set<string>();
        // look for duplicates
        for (let i = 0; i < transactionsData.length; i++) {
          const transactionId = `${transactionsData[i][idColumnIndex]}`.trim();
          if (transactionId != '') {
            const duplicatedIdRow = idsMap.get(transactionId);
            if (duplicatedIdRow != undefined) {
              findDuplicatedTransactionIds = true;
              // flag both rows
              errorBackgroundsSet.add(`${i + 1}`);
              errorBackgroundsSet.add(`${duplicatedIdRow}`);
            } else {
              idsMap.set(transactionId, `${i + 1}`);
            }
          }
        }
        // set backgrounds
        for (const rowIndex of Array.from(errorBackgroundsSet.values())) {
          const cell = transactionsDataRange.getCell(+rowIndex, idColumnIndex + 1);
          if (cell.getBackground() !== RECORD_BACKGROUND_) {
            cell.setBackground(ERROR_BACKGROUND_);
          }
        }
      }
    }

    return findDuplicatedTransactionIds;
  }
}