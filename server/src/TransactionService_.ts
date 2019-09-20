var RECORD_BACKGROUND_ = '#B0DDBC';

namespace TransactionService_ {
  
  //insert on spreadsheet
  export function insert(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, fetchStatement: FetchStatement, range: GoogleAppsScript.Spreadsheet.Range): void {
    
    // var transactions = builder.addUrls().build();
    // if (transactions.length > 0 && transactions[0].length > 0) {
    //   var newRange = Utilities_.getRangeForTable(spreadsheet, transactions, range);


    //   newRange.setValues(transactions);
      
    //   var filteredByAccount = builder.getFilteredByAccount();
    //   var isFilterByPermanentAcc = filteredByAccount != null && filteredByAccount.isPermanent();
    //   var dateFormatPattern = ledger.getDatePattern();
    //   var fractionDigits = ledger.getFractionDigits();
    //   var numberFormats = getNumberFormats_(transactions, isFilterByPermanentAcc, dateFormatPattern, fractionDigits);
    //   newRange.setNumberFormats(numberFormats);      
      
    // } else {
    //   Browser.msgBox("No data matched your search.");
    // }
  }
  
  // function getNumberFormats_(table: any[][], isFilterByPermanentAcc: boolean, dateFormatPattern: string, fractionDigits: number): string[][] {
  //   var formatsTable = new Array<Array<string>>();
  //   var numberFormatPattern = Utilities_.getNumberFormatPattern(fractionDigits);
  //   for(var i = 0; i < table.length; i++) {
  //     var formatsRow = new Array()
  //     for(var j = 0; j < table[i].length; j++) {
  //       if (j == 0) {
  //         //Date - first column
  //         formatsRow.push(dateFormatPattern);
  //       } else if (isAmountColumn_(j, isFilterByPermanentAcc)) {
  //         //Amount
  //         formatsRow.push(numberFormatPattern);
  //       } else if (isTimestampColumn_(j, isFilterByPermanentAcc)) {
  //         formatsRow.push(dateFormatPattern + " HH:mm")
  //       }else {
  //         formatsRow.push("@");
  //       }
  //     }
  //     formatsTable.push(formatsRow);
  //   }
  //   return formatsTable;
  // }
  
  // function isAmountColumn_(index: number, isFilterByPermanentAcc: boolean): boolean {
  //   return (isFilterByPermanentAcc && (index == 5)) || (!isFilterByPermanentAcc && index == 4);
  // }
  
  // function isTimestampColumn_(index: number, isFilterByPermanentAcc: boolean): boolean {
  //   return (isFilterByPermanentAcc && (index == 6)) || (!isFilterByPermanentAcc && index == 5);
  // }
  
  export function record(ledgerId: string, highlight: boolean): boolean {
    var activeSS = SpreadsheetApp.getActiveSpreadsheet();
    
    var rangeValues;
    var highlightRange;
    var dataRange = activeSS.getDataRange();
    var selectedRange = activeSS.getActiveRange();
    
    var ledger = BkperApp.getBook(ledgerId);
    
    if (!selectedRange.isBlank()) {
      rangeValues = getRangeValues_(selectedRange);
      highlightRange = selectedRange;
    } else {
      Browser.msgBox("No data to record. Select a valid cell range.");
      return false;
    }
    
    TransactionAccountService_.createAccountsIfNeeded(ledger, selectedRange);

    try {
      ledger.record(rangeValues, activeSS.getSpreadsheetTimeZone());
      if (highlight) {
        highlightRange.setBackground(RECORD_BACKGROUND_);
      }
      return true;
    } catch (e) {
      var error = JSON.stringify(e);
      
      Logger.log(error);
      return false;
    }
  }
  
  function getRangeValues_(selectedRange: GoogleAppsScript.Spreadsheet.Range): any[][] {
    
    var values = selectedRange.getValues();
    var rangeValues = new Array<Array<any>>();
    
    for (var i = 0; i < values.length; i++) {
      var rowArray = values[i];
      rangeValues.push(rowArray);
    }
    
    return rangeValues;
  }
}