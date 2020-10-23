namespace TransactionAccountService {
  
  export function createAccountsIfNeeded(header: TransactionsHeader): void {
    if (!header.isValid()) {
      return;
    }
    
    try {
      
      var columns = header.getColumns();
      
      for (var i = 0; i < columns.length; i++) {
        let column = columns[i];
        if (column.getGroup() != null) {
          var accountNamesArray = getColumnValues_(header.getRange(), i);
          Logger.log(accountNamesArray)
          createAccountsIfDoesNotExists_(header.getBook(), column.getGroup(), accountNamesArray);
        }
      }
      
    } catch (error) {
      Utilities_.logError(error);
    }
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

