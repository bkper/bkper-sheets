var RECORD_BACKGROUND_ = '#B0DDBC';

namespace TransactionService_ {
  
  
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