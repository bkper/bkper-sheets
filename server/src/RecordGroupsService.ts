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
          batch.push(arrayToGroup_(row, batch.getBook(), header, timezone));
        } else {
          let batch = groupsBatch[book.getId()];
          batch.push(arrayToGroup_(row, batch.getBook(), header, timezone));
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
        groups.push(arrayToGroup_(row, book, header, timezone));
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

  function arrayToGroup_(row: any[], book: Bkper.Book, header: GroupsHeader, timezone: string): Bkper.Group {
    let group = book.newGroup();
    if (header.isValid()) {
      for (const column of header.getColumns()) {
        let value = row[column.getIndex()];
        if (column.isName()) {
          if (book.getGroup(value)) {
            // Group already exists
            return;
          }
          group.setName(value);
        } else if (column.isParent()) {
          const parentGroup = validateParent(book, value);
          group.setParent(parentGroup);
        } else if (column.isProperty()) {
          group.setProperty(column.getName(), formatProperty(book, value, timezone));
        }
      }
    } else {
      // row[0] should be the Name
      const name = row[0];
      if (name) {
        if (book.getGroup(name)) {
          // Group already exists
          return;
        }
        group.setName(name);
      }
      // row[2] should be the Parent name
      const parentName = row[2];
      if (parentName) {
        const parentGroup = validateParent(book, parentName);
        group.setParent(parentGroup);
      }
    }
    return group;
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

  function formatProperty(book: Bkper.Book, cell: any, timezone?: string) {
    if (Utilities_.isDate(cell)) {
      return book.formatDate(cell, timezone);
    }
    return cell;
  }

  function validateParent(book: Bkper.Book, parentName: string): Bkper.Group {
    const parentGroup = book.getGroup(parentName);
    if (parentGroup) {
      return parentGroup;
    }
    return book.newGroup().setName(parentName).create();
  }

}
