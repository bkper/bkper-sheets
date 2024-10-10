namespace RecordAccountsService {

  export function recordAccounts(book: Bkper.Book, selectedRange: GoogleAppsScript.Spreadsheet.Range, activeSS: GoogleAppsScript.Spreadsheet.Spreadsheet, highlight: boolean): boolean {
    const timezone = activeSS.getSpreadsheetTimeZone();
    batchCreateAccounts(book, selectedRange, selectedRange.getValues(), highlight, timezone);
    return true;
  }

  export function batchCreateAccounts(book: Bkper.Book, range: GoogleAppsScript.Spreadsheet.Range, values: any[][], highlight: boolean, timezone: string) {

    const header = new AccountsHeader(range);
    const bookIdHeaderColumn = header.getBookIdHeaderColumn();

    let shouldIgnoreFirstRow = false;
    let backgrounds: any[][] = initilizeMatrix(new Array(values.length), header.getColumns().length);

    // Ignore first row if it's a header
    if (isFirstRowHeader(values)) {
      shouldIgnoreFirstRow = true;
      backgrounds[0] = fill(new Array(header.getColumns().length), undefined);
    }

    if (bookIdHeaderColumn) {
      // MAP
      let accountsBatch: { [bookId: string]: RecordAccountBatch } = {};
      accountsBatch[book.getId()] = new RecordAccountBatch(book);
      const startAt = shouldIgnoreFirstRow ? 1 : 0;
      for (let i = startAt; i < values.length; i++) {
        const row = values[i];
        let bookId = row[bookIdHeaderColumn.getIndex()];
        if (bookId != null && typeof bookId == "string" && bookId.trim() != '') {
          if (!Utilities_.hasBookIdPrefix(bookId)) {
            throw `Selected range has invalid book id: '${bookId}'`;
          }
          let batch = accountsBatch[bookId];
          if (batch == null) {
            const book = BkperApp.getBook(bookId);
            batch = new RecordAccountBatch(book);
            accountsBatch[bookId] = batch;
          }
          batch = arrayToBatch_(row, batch, header, timezone, highlight, i);
        } else {
          let batch = accountsBatch[book.getId()];
          batch = arrayToBatch_(row, batch, header, timezone, highlight, i);
        }
      }
      // REDUCE
      for (const key in accountsBatch) {
        let batch = accountsBatch[key];
        // Record batch
        batch.record();
        // Update backgrounds array
        if (highlight) {
          backgrounds = updateBackgroundsArray(backgrounds, batch, header.getColumns().length);
        }
      }
    } else {
      let batch = new RecordAccountBatch(book);
      const startAt = shouldIgnoreFirstRow ? 1 : 0;
      for (let i = startAt; i < values.length; i++) {
        batch = arrayToBatch_(values[i], batch, header, timezone, highlight, i);
      }
      // Record batch
      batch.record();
      // Update backgrounds array
      if (highlight) {
        backgrounds = updateBackgroundsArray(backgrounds, batch, header.getColumns().length);
      }
    }

    // Set backgrounds
    if (highlight) {
      range.setBackgrounds(backgrounds);
    }

  }

  function updateBackgroundsArray(backgroundsArray: any[][], batch: RecordAccountBatch, headerLength: number): any[][] {
    const accountTypesMap = batch.getAccountTypesMap();
    for (const key of Object.keys(accountTypesMap)) {
      backgroundsArray[+key] = fill(new Array(headerLength), getTypeColor(accountTypesMap[key]));
    }
    return backgroundsArray;
  }

  function arrayToBatch_(row: any[], batch: RecordAccountBatch, header: AccountsHeader, timezone: string, highlight: boolean, rowIndex: number): RecordAccountBatch {

    const book = batch.getBook();

    let accountName: string;
    let accountType: Bkper.AccountType;
    let accountGroupNames: string[] = [];
    let accountProperties: { [propKey: string]: string } = {};

    if (header.isValid()) {
      for (const column of header.getColumns()) {
        const value = (row[column.getIndex()] + '').replaceAll('\n', ' ').trim();
        if (column.isName()) {
          accountName = value;
        } else if (column.isType()) {
          accountType = isValidType(value) ? value as Bkper.AccountType : BkperApp.AccountType.ASSET;
        } else if (column.isGroup()) {
          batch.pushGroupName(value);
          accountGroupNames.push(value);
        } else if (column.isProperty()) {
          if (!accountProperties[column.getName()]) {
            accountProperties[column.getName()] = formatPropertyValue(book, value, timezone);
          }
        }
      }
    } else {
      // row[0] should be the Name
      accountName = (row[0] + '').replaceAll('\n', ' ').trim();
      // row[1] should be the Type
      const type = (row[1] + '').replaceAll('\n', ' ').trim();
      accountType = isValidType(type) ? type as Bkper.AccountType : BkperApp.AccountType.ASSET;
      // Every other cell should be a Group name
      for (let i = 2; i < row.length; i++) {
        const value = (row[i] + '').replaceAll('\n', ' ').trim();
        batch.pushGroupName(value);
        accountGroupNames.push(value);
      }
    }

    if (highlight) {
      const type = accountName ? `${accountType}` : undefined;
      batch.setAccountType(`${rowIndex}`, type);
    }

    if (!accountName) {
      return batch;
    }

    const account = book.getAccount(accountName);
    if (account) {
      batch.setExistingAccount(new BatchExistingAccount(book, account, accountGroupNames, accountProperties), `${rowIndex}`);
    } else {
      const newAccount = book.newAccount().setName(accountName).setType(accountType);
      batch.setNewAccount(new BatchNewAccount(book, newAccount, accountGroupNames, accountProperties), `${rowIndex}`);
    }

    return batch;
  }

  function fill(array: any[], value: string): any[] {
    for (let i = 0; i < array.length; i++) {
      array[i] = value;
    }
    return array;
  }

  function initilizeMatrix(matrix: any[], columns: number): any[] {
    for (let i = 0; i < matrix.length; i++) {
      matrix[i] = new Array(columns);
    }
    return matrix;
  }

  function getTypeColor(type: string): string | undefined {
    if (type == BkperApp.AccountType.ASSET) {
      return '#dfedf6';
    }
    if (type == BkperApp.AccountType.LIABILITY) {
      return '#fef3d8';
    }
    if (type == BkperApp.AccountType.INCOMING) {
      return '#e2f3e7';
    }
    if (type == BkperApp.AccountType.OUTGOING) {
      return '#f6deda';
    }
    return undefined;
  }

  function isValidType(type: string): boolean {
    if (type == BkperApp.AccountType.ASSET) {
      return true;
    }
    if (type == BkperApp.AccountType.LIABILITY) {
      return true;
    }
    if (type == BkperApp.AccountType.INCOMING) {
      return true;
    }
    if (type == BkperApp.AccountType.OUTGOING) {
      return true;
    }
    return false;
  }

  function formatPropertyValue(book: Bkper.Book, value: any, timezone?: string): string {
    if (Utilities_.isDate(value)) {
      return book.formatDate(value, timezone);
    }
    return value + '';
  }

  function isFirstRowHeader(values: any[][]): boolean {
    return values[0][0].trim().toLowerCase() == 'name' ? true : false;
  }

}
