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
      backgrounds[0] = fill(new Array(header.getColumns().length), undefined);
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
          if (!Utilities_.hasBookIdPrefix(bookId)) {
            throw `Selected range has invalid book id: '${bookId}'`;
          }
          let batch = groupsBatch[bookId];
          if (batch == null) {
            const book = BkperApp.getBook(bookId);
            batch = new RecordGroupBatch(book);
            groupsBatch[bookId] = batch;
          }
          batch = arrayToBatch_(row, batch, header, timezone, highlight, i);
        } else {
          let batch = groupsBatch[book.getId()];
          batch = arrayToBatch_(row, batch, header, timezone, highlight, i);
        }
      }
      // REDUCE
      for (const key in groupsBatch) {
        let batch = groupsBatch[key];
        // Record batch
        batch.record();
        // Update backgrounds array
        if (highlight) {
          backgrounds = updateBackgroundsArray(backgrounds, batch, header.getColumns().length);
        }
      }
    } else {
      let batch = new RecordGroupBatch(book);
      const startAt = shouldIgnoreFirstRow ? 1 : 0;
      for (let i = startAt; i < values.length; i++) {
        const row = values[i];
        batch = arrayToBatch_(row, batch, header, timezone, highlight, i);
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

  function updateBackgroundsArray(backgroundsArray: any[][], batch: RecordGroupBatch, headerLength: number): any[][] {
    const groupsMap = batch.getGroupsMap();
    for (const key of Object.keys(groupsMap)) {
      const color = groupsMap[key] ? RECORD_GROUPS_BACKGROUND : undefined;
      backgroundsArray[+key] = fill(new Array(headerLength), color);
    }
    return backgroundsArray;
  }

  function arrayToBatch_(row: any[], batch: RecordGroupBatch, header: GroupsHeader, timezone: string, highlight: boolean, rowIndex: number): RecordGroupBatch {

    const book = batch.getBook();

    let groupName: string;
    let parentName: string;
    let groupProperties: { [propKey: string]: string } = {};

    if (header.isValid()) {
      for (const column of header.getColumns()) {
        const value = (row[column.getIndex()] + '').trim();
        if (column.isName()) {
          groupName = value;
        } else if (column.isParent()) {
          batch.pushParentName(value);
          parentName = value;
        } else if (column.isProperty()) {
          if (!groupProperties[column.getName()]) {
            groupProperties[column.getName()] = formatPropertyValue(book, value, timezone);
          }
        }
      }
    } else {
      // row[0] should be the Name
      groupName = (row[0] + '').trim();
    }

    if (highlight) {
      batch.addToGroupsMap(rowIndex + '', groupName);
    }

    if (!groupName) {
      return batch;
    }

    batch.pushGroup(new BatchGroup(book, groupName, parentName, groupProperties));

    return batch;
  }

  function formatPropertyValue(book: Bkper.Book, value: any, timezone?: string): string {
    if (Utilities_.isDate(value)) {
      return book.formatDate(value, timezone);
    }
    return value + '';
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
