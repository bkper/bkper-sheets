namespace RecordGroupsService {

  const RECORD_GROUPS_BACKGROUND = '#E9EAED';

  export function recordGroups(book: Bkper.Book, selectedRange: GoogleAppsScript.Spreadsheet.Range, activeSS: GoogleAppsScript.Spreadsheet.Spreadsheet, highlight: boolean): boolean {
    const timezone = activeSS.getSpreadsheetTimeZone();
    batchCreateGroups(book, selectedRange, selectedRange.getValues(), timezone);
    if (highlight) {
      selectedRange.setBackground(RECORD_GROUPS_BACKGROUND);
    }
    return true;
  }

  export function batchCreateGroups(book: Bkper.Book, range: GoogleAppsScript.Spreadsheet.Range, values: any[][], timezone: string) {

    const header = new GroupsHeader(range);
    const bookIdHeaderColumn = header.getBookIdHeaderColumn();

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
          batch = arrayToBatch_(row, batch.getBook(), batch, header, timezone);
        } else {
          let batch = groupsBatch[book.getId()];
          batch = arrayToBatch_(row, batch.getBook(), batch, header, timezone);
        }
      }
      // REDUCE
      for (const key in groupsBatch) {
        let batch = groupsBatch[key];
        // Create groups
        batch.getBook().batchCreateGroups(batch.getGroups());
        // Set parents
        let parentGroupsMap = batch.getParentGroupsMap();
        for (const key of Object.keys(parentGroupsMap)) {
          setParent(batch.getBook(), key, parentGroupsMap[key]);
        }
      }
    } else {
      let batch = new RecordGroupBatch(book);
      for (const row of values) {
        batch = arrayToBatch_(row, book, batch, header, timezone);
      }
      // Create groups
      book.batchCreateGroups(batch.getGroups());
      // Set parents
      let parentGroupsMap = batch.getParentGroupsMap();
      for (const key of Object.keys(parentGroupsMap)) {
        setParent(book, key, parentGroupsMap[key]);
      }
    }

    return false;
  }

  function arrayToBatch_(row: any[], book: Bkper.Book, batch: RecordGroupBatch, header: GroupsHeader, timezone: string): RecordGroupBatch {
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

}
