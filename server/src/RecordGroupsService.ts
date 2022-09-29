namespace RecordGroupsService {

  export function recordGroups(book: Bkper.Book, selectedRange: GoogleAppsScript.Spreadsheet.Range, activeSS: GoogleAppsScript.Spreadsheet.Spreadsheet, highlight: boolean): boolean {
    const timezone = activeSS.getSpreadsheetTimeZone();
    batchCreateGroups(book, selectedRange, selectedRange.getValues(), highlight, timezone);
    return true;
  }

  export function batchCreateGroups(book: Bkper.Book, range: GoogleAppsScript.Spreadsheet.Range, values: any[][], highlight: boolean, timezone: string) {

    const header = new GroupsHeader(range);
    const bookIdHeaderColumn = header.getBookIdHeaderColumn();

    let GroupsMap: Bkper.Group[] = [];

    if (bookIdHeaderColumn) {
      // MAP
      let groupsBatch: { [bookId: string]: RecordGroupBatch } = {};
      groupsBatch[book.getId()] = new RecordGroupBatch(book);
      for (const row of values) {
        let bookId = row[bookIdHeaderColumn.getIndex()];
        if (bookId != null && typeof bookId == "string" && bookId.trim() != '') {
          let batch = groupsBatch[bookId];
          if (batch == null) {
            const book = BkperApp.getBook(bookId);
            batch = new RecordGroupBatch(book);
            groupsBatch[bookId] = batch;
          }
          // batch.push(arrayToAccount_(row, batch.getBook(), header, timezone));
        } else {
          let batch = groupsBatch[book.getId()];
          // batch.push(arrayToAccount_(row, batch.getBook(), header, timezone));
        }
      }
      // REDUCE
      for (const key in groupsBatch) {
        let batch = groupsBatch[key];
        GroupsMap = GroupsMap.concat(batch.getGroups());
        batch.getBook().batchCreateGroups(batch.getGroups());
      }
    } else {
      let groups: Bkper.Group[] = [];
      for (const row of values) {
        // groups.push(arrayToAccount_(row, book, header, timezone));
      }
      GroupsMap = GroupsMap.concat(groups);
      book.batchCreateGroups(groups);
    }

    // if (highlight) {
    //   let backgrounds: any[][] = initilizeMatrix(new Array(values.length), header.getColumns().length);
    //   for (let i = 0; i < GroupsMap.length; i++) {
    //     backgrounds[i] = fill(new Array(header.getColumns().length), getTypeColor(GroupsMap[i].getType()));
    //   }
    //   range.setBackgrounds(backgrounds);
    // }

    return false;
  }

  // function arrayToAccount_(row: any[], book: Bkper.Book, header: AccountsHeader, timezone: string): Bkper.Account {
  //   let account = book.newAccount().setType(BkperApp.AccountType.ASSET);
  //   if (header.isValid()) {
  //     let groupNames: string[] = [];
  //     for (const column of header.getColumns()) {
  //       let value = row[column.getIndex()];
  //       if (column.isName()) {
  //         if (book.getAccount(value)) {
  //           // Account already exists
  //           return;
  //         }
  //         account.setName(value);
  //       } else if (column.isType() && isValidType(value)) {
  //         account.setType(value as Bkper.AccountType);
  //       } else if (column.isGroup()) {
  //         groupNames.push(value as string);
  //       } else if (column.isProperty()) {
  //         account.setProperty(column.getName(), formatProperty(book, value, timezone));
  //       }
  //     }
  //     const groups = validateGroups(book, groupNames);
  //     account.setGroups(groups);
  //   } else {
  //     let groupNames: string[] = [];
  //     // row[0] should be the Name
  //     const name = row[0];
  //     if (name) {
  //       if (book.getAccount(name)) {
  //         // Account already exists
  //         return;
  //       }
  //       account.setName(name);
  //     }
  //     // row[1] should be the Type
  //     const type = row[1];
  //     if (isValidType(type)) {
  //       account.setType(type as Bkper.AccountType);
  //     }
  //     // Every other cell should be a Group name
  //     for (let i = 2; i < row.length; i++) {
  //       const groupName = row[i];
  //       if (groupName) {
  //         groupNames.push(groupName as string);
  //       }
  //     }
  //     const groups = validateGroups(book, groupNames);
  //     account.setGroups(groups);
  //   }
  //   return account;
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
