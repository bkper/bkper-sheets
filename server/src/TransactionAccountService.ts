namespace TransactionAccountService {
  
  export function createAccountsIfNeeded(book: Bkper.Book, selectedRange: GoogleAppsScript.Spreadsheet.Range): void {
    try {
      
      var headerGroups = getHeaderGroups_(book, selectedRange);
      
      for (var i = 0; i < headerGroups.length; i++) {
        var headerGroup = headerGroups[i];
        var accountNamesArray = getColumnValues_(selectedRange, headerGroup.columnIndex);
        Logger.log(accountNamesArray)
        createAccountsIfDoesNotExists_(book, headerGroup.group, accountNamesArray);
      }
      
    } catch (error) {
      Utilities_.logError(error);
    }
  }
  
  function getHeaderGroups_(book: Bkper.Book, range: GoogleAppsScript.Spreadsheet.Range): {columnIndex: number, group: Bkper.Group}[] {
    
    var groups = book.getGroups();
    
    var headerGroups = new Array<{columnIndex: number, group: Bkper.Group}>();
    
    for (var i = 0; i < groups.length; i++) {
      var group = groups[i];
      var columnIndex = getColumnIndex_(book, range, group.getName());
      if (columnIndex != null) {
        headerGroups.push({columnIndex: columnIndex, group: group})
      }
    }
    
    return headerGroups;

  }
  
  function getColumnIndex_(book: Bkper.Book, range: GoogleAppsScript.Spreadsheet.Range, columnTag: string): number {
    var frozenRows = range.getSheet().getFrozenRows();
    var numRows = frozenRows > 0 ? frozenRows : 1;
    var headerValues = range.getSheet().getSheetValues(1, range.getColumn(), numRows, range.getNumColumns());
    for (var i = 0; i < headerValues.length; i++) {
      for (var j = 0; j < headerValues[i].length; j++) {
        if (isEqual_(headerValues[i][j], columnTag)) {
          return j;
        }
      }
    }
    return null;
  }
  
  function isEqual_(cell: any, text: string): boolean {
    if (cell != null && (typeof cell == "string")) {
      return cell.toUpperCase() == text.toUpperCase();
    }
    return false;
  }
  
  function createAccountsIfDoesNotExists_(book: Bkper.Book, group: Bkper.Group, accountNamesArray: string[]): void {
    for (var i = 0; i < accountNamesArray.length; i++) {
      var accountName = accountNamesArray[i];
      if (book.getAccount(accountName) == null) {
        try {
          book.createAccount(accountName, group.getName());
        } catch (error) {
          //Ok! Maybe account already exists
          Logger.log(error);
        }
      }
    }
    
  }
  
  function getColumnValues_(range: GoogleAppsScript.Spreadsheet.Range, columnIndex: number): any[] {
    var values = range.getValues();
    var columnValues = new Array();
    if (columnIndex != null) {
      for (var i = 0; i < values.length; i++) {
        for (var j = 0; j < values[i].length; j++) {
          if (j == columnIndex) {
            columnValues.push(values[i][j]);
          }
        }
      }
    }
    return columnValues;
  }
  
  
}

