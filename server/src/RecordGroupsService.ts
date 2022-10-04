namespace RecordGroupsService {

  const RECORD_GROUPS_BACKGROUND = '#E9EAED';

  export function recordGroups(book: Bkper.Book, selectedRange: GoogleAppsScript.Spreadsheet.Range, activeSS: GoogleAppsScript.Spreadsheet.Spreadsheet, highlight: boolean): boolean {
    const timezone = activeSS.getSpreadsheetTimeZone();
    batchCreateGroups(book, selectedRange, selectedRange.getValues(), highlight, timezone);
    return true;
  }

  export function batchCreateGroups(book: Bkper.Book, range: GoogleAppsScript.Spreadsheet.Range, values: any[][], highlight: boolean, timezone: string) {

    const header = new GroupsHeader(range);
    const bookIdHeaderColumn = header.getBookIdHeaderColumn();

    let shouldIgnoreFirstRow = false;
    let backgrounds: any[][] = initilizeMatrix(new Array(values.length), header.getColumns().length);

    // Ignore first row if it's a header
    if (isFirstRowHeader(values)) {
      shouldIgnoreFirstRow = true;
    }

    if (bookIdHeaderColumn) {
      // MAP
      let groupsBatch: { [bookId: string]: RecordGroupBatch } = {};
      groupsBatch[book.getId()] = new RecordGroupBatch(book);
      const startAt = shouldIgnoreFirstRow ? 1 : 0;
      for (let i = startAt; i < values.length; i++) {
        const row = values[i];
        let bookId = row[bookIdHeaderColumn.getIndex()];
        if (bookId != null && typeof bookId == "string" && bookId.trim() != '') {
          let batch = groupsBatch[bookId];
          if (batch == null) {
            const book = BkperApp.getBook(bookId);
            batch = new RecordGroupBatch(book);
            groupsBatch[bookId] = batch;
          }
          batch = arrayToBatch_(row, batch, header, timezone);
        } else {
          let batch = groupsBatch[book.getId()];
          batch = arrayToBatch_(row, batch, header, timezone);
        }
      }
      // REDUCE
      for (const key in groupsBatch) {
        let batch = groupsBatch[key];
        // Create groups
        const newGroups = batch.getGroups();
        if (newGroups && newGroups.length > 0) {
          batch.getBook().batchCreateGroups(newGroups);
          // Set parents
          let parentGroupsMap = batch.getParentGroupsMap();
          for (const key of Object.keys(parentGroupsMap)) {
            setParent(batch.getBook(), key, parentGroupsMap[key]);
          }
        }
      }
    } else {
      let batch = new RecordGroupBatch(book);
      const startAt = shouldIgnoreFirstRow ? 1 : 0;
      for (let i = startAt; i < values.length; i++) {
        const row = values[i];
        batch = arrayToBatch_(row, batch, header, timezone);
      }
      // Create groups
      const newGroups = batch.getGroups();
      if (newGroups && newGroups.length > 0) {
        batch.getBook().batchCreateGroups(newGroups);
        // Set parents
        let parentGroupsMap = batch.getParentGroupsMap();
        for (const key of Object.keys(parentGroupsMap)) {
          setParent(batch.getBook(), key, parentGroupsMap[key]);
        }
      }
    }

    if (highlight) {
      const numOfColumns = header.getColumns().length;
      for (let i = 0; i < values.length; i++) {
        backgrounds[i] = fill(new Array(numOfColumns), RECORD_GROUPS_BACKGROUND);
      }
      if (shouldIgnoreFirstRow) {
        backgrounds[0] = fill(new Array(numOfColumns), undefined);
      }
      range.setBackgrounds(backgrounds);
    }

  }

  function arrayToBatch_(row: any[], batch: RecordGroupBatch, header: GroupsHeader, timezone: string): RecordGroupBatch {
    const book = batch.getBook();
    let group = book.newGroup();
    if (header.isValid()) {
      for (const column of header.getColumns()) {
        let value = row[column.getIndex()];
        if (column.isName()) {
          if (book.getGroup(value)) {
            // Group already exists
            return batch;
          }
          group.setName(value);
        } else if (column.isParent()) {
          const parentGroup = book.getGroup(value);
          if (parentGroup) {
            group.setParent(parentGroup);
          } else {
            if (batch.getGroups().map(g => g.getName()).indexOf(value) < 0) {
              batch.push(book.newGroup().setName(value));
            }
            batch.addToParentGroupsMap(group.getName(), value);
          }
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
          return batch;
        }
        group.setName(name);
      }
    }
    batch.push(group);
    return batch;
  }

  function formatProperty(book: Bkper.Book, cell: any, timezone?: string): any {
    if (Utilities_.isDate(cell)) {
      return book.formatDate(cell, timezone);
    }
    return cell;
  }

  function setParent(book: Bkper.Book, groupName: string, parentName: string): void {
    const group = book.getGroup(groupName);
    const parentGroup = book.getGroup(parentName);
    if (!group || !parentGroup) {
      return;
    }
    group.setParent(parentGroup).update();
  }

  function initilizeMatrix(matrix: any[], columns: number): any[] {
    for (let i = 0; i < matrix.length; i++) {
      matrix[i] = new Array(columns);
    }
    return matrix;
  }

  function fill(array: any[], value: string): any[] {
    for (let i = 0; i < array.length; i++) {
      array[i] = value;
    }
    return array;
  }

  function isFirstRowHeader(values: any[][]): boolean {
    return values[0][0].trim().toLowerCase() == 'name' ? true : false;
  }

}
