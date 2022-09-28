namespace RecordAccountsService {

  export function recordAccounts(book: Bkper.Book, selectedRange: GoogleAppsScript.Spreadsheet.Range, activeSS: GoogleAppsScript.Spreadsheet.Spreadsheet, highlight: boolean): boolean {
    const timezone = activeSS.getSpreadsheetTimeZone();
    batchCreateAccounts(book, selectedRange, selectedRange.getValues(), highlight, timezone);
    return true;
  }

  export function batchCreateAccounts(book: Bkper.Book, range: GoogleAppsScript.Spreadsheet.Range, values: any[][], highlight: boolean, timezone: string) {

    const header = new AccountsHeader(range);
    const bookIdHeaderColumn = header.getBookIdHeaderColumn();

    let accountsMap: Bkper.Account[] = [];

    if (bookIdHeaderColumn) {
      // MAP
      let accountsBatch: { [bookId: string]: RecordAccountBatch } = {};
      accountsBatch[book.getId()] = new RecordAccountBatch(book);
      for (const row of values) {
        let bookId = row[bookIdHeaderColumn.getIndex()];
        if (bookId != null && typeof bookId == "string" && bookId.trim() != '') {
          let batch = accountsBatch[bookId];
          if (batch == null) {
            const book = BkperApp.getBook(bookId);
            batch = new RecordAccountBatch(book);
            accountsBatch[bookId] = batch;
          }
          batch.push(arrayToAccount_(row, batch.getBook(), header, timezone));
        } else {
          let batch = accountsBatch[book.getId()];
          batch.push(arrayToAccount_(row, batch.getBook(), header, timezone));
        }
      }
      // REDUCE
      for (const key in accountsBatch) {
        let batch = accountsBatch[key];
        accountsMap = accountsMap.concat(batch.getAccounts());
        batch.getBook().batchCreateAccounts(batch.getAccounts());
      }
    } else {
      let accounts: Bkper.Account[] = [];
      for (const row of values) {
        accounts.push(arrayToAccount_(row, book, header, timezone));
      }
      accountsMap = accountsMap.concat(accounts);
      book.batchCreateAccounts(accounts);
    }

    // if (highlight) {
    //   let backgrounds: any[][] = initilizeMatrix(new Array(values.length), header.getColumns().length);
    //   for (let i = 0; i < accountsMap.length; i++) {
    //     backgrounds[i] = fill(new Array(header.getColumns().length), getTypeColor(accountsMap[i].getType()));
    //   }
    //   range.setBackgrounds(backgrounds);
    // }

    return false;
  }

  function arrayToAccount_(row: any[], book: Bkper.Book, header: AccountsHeader, timezone: string): Bkper.Account {
    let account = book.newAccount().setType(BkperApp.AccountType.ASSET);
    if (header.isValid()) {
      let groupNames: string[] = [];
      for (const column of header.getColumns()) {
        let value = row[column.getIndex()];
        if (column.isName()) {
          if (book.getAccount(value)) {
            // Account already exists
            return;
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
    }
    return account;
  }

  //   if (highlight) {
  //     let backgrounds: any[][] = initilizeMatrix(new Array(values.length), maxLength);
  //     let accounts = book.getAccounts();
  //     for (const account of accounts) {
  //       const index = nameRowIndexMap[account.getName()];
  //       if (index != null) {
  //         backgrounds[index] = fill(new Array(maxLength), getTypeColor(account.getType()));
  //       }
  //     }
  //     selectedRange.setBackgrounds(backgrounds);
  //   }
  //   return false;
  // }

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

  function getTypeColor(type: Bkper.AccountType): string {
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

  function formatProperty(book: Bkper.Book, cell: any, timezone?: string) {
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
        if (group.getChildren().length === 0) {
          groups.push(group);
        }
      } else {
        newGroups.push(book.newGroup().setName(groupName));
      }
    }
    newGroups = book.batchCreateGroups(newGroups);
    return groups.concat(newGroups);
  }

}