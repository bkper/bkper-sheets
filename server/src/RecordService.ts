var RECORD_BACKGROUND_ = '#B0DDBC';

namespace RecordService {
  
  
  export function record(recordStatement: SaveStatement): boolean {
    var activeSS = SpreadsheetApp.getActiveSpreadsheet();
    var selectedRange = activeSS.getActiveRange();
    var book = BookService.getBook(recordStatement.ledgerId);
    
    if (selectedRange.isBlank()) {
      Browser.msgBox("No data to record. Select a valid cell range.");
      return false;
    }
    if (recordStatement.recordType == 'transactions') {
      return recordTransactions(book, selectedRange, activeSS, recordStatement.highlight);
    } else if (recordStatement.recordType == 'accounts') {
      return recordAccounts(book, selectedRange, recordStatement.highlight);
    }

  }

  function recordAccounts(book: Bkper.Book, selectedRange: GoogleAppsScript.Spreadsheet.Range, highlight: boolean): boolean {

    let values = selectedRange.getValues();

    let nameRowIndexMap: any = {};
    let maxLength = 0;

    let groups: string[] = []
    for (let i = 0; i < values.length; i++) {
      const row = values[i]
      const name = row[0] + '';
      nameRowIndexMap[name] = i;
      if (row.length >= maxLength) {
        maxLength = row.length;
      }

      if (row.length > 1) {
        for (let j = 1; j < row.length; j++) {
          const cell = row[j];
          if (!isType(cell) && !book.getGroup(cell)) {
            groups.push(cell);
          }
        }
      }
    }

    if (groups.length > 0) {
      book.createGroups(groups);
    }

    book.createAccounts(values);

    if (highlight) {
      let backgrounds: any[][] = initilizeMatrix(new Array(values.length), maxLength);
      let accounts = book.getAccounts();
      for (const account of accounts) {
        const index = nameRowIndexMap[account.getName()];
        if (index != null) {
          backgrounds[index] = fill(new Array(maxLength), getTypeColor(account.getType()));
        }
      }
      selectedRange.setBackgrounds(backgrounds);
    }
    return false;
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

  function isType(groupOrType: string): boolean {
    if (groupOrType == BkperApp.AccountType.ASSET) {
      return true;
    }
    if (groupOrType == BkperApp.AccountType.LIABILITY) {
      return true;
    }
    if (groupOrType == BkperApp.AccountType.INCOMING) {
      return true;
    }
    if (groupOrType == BkperApp.AccountType.OUTGOING) {
      return true;
    }
    return false;
  }

  function recordTransactions(book: Bkper.Book, selectedRange: GoogleAppsScript.Spreadsheet.Range, activeSS: GoogleAppsScript.Spreadsheet.Spreadsheet, highlight: boolean): boolean {
    TransactionAccountService.createAccountsIfNeeded(book, selectedRange);

    try {
      book.record(selectedRange.getValues(), activeSS.getSpreadsheetTimeZone());
      if (highlight) {
        selectedRange.setBackground(RECORD_BACKGROUND_);
      }
      return true;
    } catch (e) {
      var error = JSON.stringify(e);
      
      Logger.log(error);
      return false;
    }
  }


}