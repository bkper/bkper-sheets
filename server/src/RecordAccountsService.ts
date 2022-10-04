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
        const newAccounts = batch.getAccounts();
        // Create accounts
        if (newAccounts && newAccounts.length > 0) {
          batch.getBook().batchCreateAccounts(newAccounts);
        }
        // Update backgrounds array
        if (highlight) {
          const accountTypesMap = batch.getAccountTypesMap();
          for (const key of Object.keys(accountTypesMap)) {
            backgrounds[+key] = fill(new Array(header.getColumns().length), getTypeColor(accountTypesMap[key]));
          }
        }
      }
    } else {
      let batch = new RecordAccountBatch(book);
      const startAt = shouldIgnoreFirstRow ? 1 : 0;
      for (let i = startAt; i < values.length; i++) {
        batch = arrayToBatch_(values[i], batch, header, timezone, highlight, i);
      }
      const newAccounts = batch.getAccounts();
      // Create accounts
      if (newAccounts && newAccounts.length > 0) {
        batch.getBook().batchCreateAccounts(newAccounts);
      }
      // Update backgrounds array
      if (highlight) {
        const accountTypesMap = batch.getAccountTypesMap();
        for (const key of Object.keys(accountTypesMap)) {
          backgrounds[+key] = fill(new Array(header.getColumns().length), getTypeColor(accountTypesMap[key]));
        }
      }
    }

    // Set backgrounds
    if (highlight) {
      range.setBackgrounds(backgrounds);
    }

  }

  function arrayToBatch_(row: any[], batch: RecordAccountBatch, header: AccountsHeader, timezone: string, highlight: boolean, rowIndex: number): RecordAccountBatch {
    const book = batch.getBook();
    let account = book.newAccount().setType(BkperApp.AccountType.ASSET);
    if (header.isValid()) {
      let groupNames: string[] = [];
      for (const column of header.getColumns()) {
        let value = row[column.getIndex()];
        if (column.isName()) {
          const acc = book.getAccount(value);
          if (acc) {
            // Account already exists
            if (highlight) {
              batch.addToAccountTypesMap(rowIndex + '', acc.getType() as string);
            }
            return batch;
          }
          account.setName(value);
        } else if (column.isType() && isValidType(value)) {
          account.setType(value as Bkper.AccountType);
        } else if (column.isGroup()) {
          groupNames.push(value as string);
        } else if (column.isProperty()) {
          account.setProperty(column.getName(), formatProperty(book, value, timezone));
        }
      }
      const groups = validateGroups(book, groupNames);
      account.setGroups(groups);
    } else {
      let groupNames: string[] = [];
      // row[0] should be the Name
      const name = row[0];
      if (name) {
        const acc = book.getAccount(name);
        if (acc) {
          // Account already exists
          if (highlight) {
            batch.addToAccountTypesMap(rowIndex + '', acc.getType() as string);
          }
          return batch;
        }
        account.setName(name);
      }
      // row[1] should be the Type
      const type = row[1];
      if (isValidType(type)) {
        account.setType(type as Bkper.AccountType);
      }
      // Every other cell should be a Group name
      for (let i = 2; i < row.length; i++) {
        const groupName = row[i];
        if (groupName) {
          groupNames.push(groupName as string);
        }
      }
      const groups = validateGroups(book, groupNames);
      account.setGroups(groups);
    }
    if (highlight) {
      batch.addToAccountTypesMap(rowIndex + '', account.getType() as string);
    }
    batch.push(account);
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

  function getTypeColor(type: string): string {
    if (type == BkperApp.AccountType.ASSET) {
      return '#dfedf6';
    }
    if (type == BkperApp.AccountType.LIABILITY) {
      return '#fef3d8';
    }
    if (type == BkperApp.AccountType.INCOMING) {
      return '#e2f3e7';
    }
    return '#f6deda';
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

  function formatProperty(book: Bkper.Book, cell: any, timezone?: string): any {
    if (Utilities_.isDate(cell)) {
      return book.formatDate(cell, timezone);
    }
    return cell;
  }

  function validateGroups(book: Bkper.Book, groupNames: string[]): Bkper.Group[] {
    let groups: Bkper.Group[] = [];
    let newGroups: Bkper.Group[] = [];
    for (const groupName of groupNames) {
      const group = book.getGroup(groupName);
      if (group) {
        groups.push(group);
      } else {
        newGroups.push(book.newGroup().setName(groupName));
      }
    }
    newGroups = book.batchCreateGroups(newGroups);
    return groups.concat(newGroups);
  }

  function isFirstRowHeader(values: any[][]): boolean {
    return values[0][0].trim().toLowerCase() == 'name' ? true : false;
  }

}
