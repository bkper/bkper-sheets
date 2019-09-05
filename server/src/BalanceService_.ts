namespace BalanceService_ {


  //insert on spreadsheet
  export function insert(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, properties: GoogleAppsScript.Properties.Properties, fetchStatement: Statement, range: GoogleAppsScript.Spreadsheet.Range, saveStatement: boolean): void {  
    var ledger = LedgerService_.loadLedger(fetchStatement.ledgerId);
    
	var balances = ledger.getBalancesReport(fetchStatement.query);
    var table = getBalancesDataTable_(balances, fetchStatement.balanceType);
    if (table.length > 0 ) {
      var newRange = Utilities_.getRangeForTable(spreadsheet, table, range);
      var fetchStatementDAO = new FetchStatementDAO(spreadsheet, properties);
      if (saveStatement) {
        fetchStatementDAO.deletePreviousStatementAtSameRange(newRange);      
        fetchStatementDAO.saveStatement(newRange, fetchStatement);
      } else {
        range.clearContent();
      }
      newRange.setValues(table);
      var periodicity = balances.getPeriodicity();
      var numberFormats = getNumberFormats_(table, fetchStatement.balanceType, periodicity, ledger.getDatePattern(), ledger.getFractionDigits());
      newRange.setNumberFormats(numberFormats);      
    }
  }

  function getBalancesDataTable_(balanceReport: GoogleAppsScript.Bkper.BalancesReport, balanceType: GoogleAppsScript.Bkper.BalanceType): any[][] {
    var tableBuilder = null;
    if (balanceType == BALANCE_TYPE_TOTAL_) {
      if (balanceReport.hasOnlyOneGroup()) {
        tableBuilder = balanceReport.getBalancesContainers()[0].createDataTable();
      } else {
        tableBuilder = balanceReport.createDataTable();
      }
    } else if (balanceType == BALANCE_TYPE_CUMULATIVE_) {
      tableBuilder = balanceReport.createDataTable();
      tableBuilder.setBalanceType(BkperApp.BalanceType.CUMULATIVE);
    } else if (balanceType == BALANCE_TYPE_PERIOD_) {
      tableBuilder = balanceReport.createDataTable();
      tableBuilder.setBalanceType(BkperApp.BalanceType.PERIOD);
    }
    return tableBuilder.build();
  }  
  
  function getNumberFormats_(table: any[][], balanceType: GoogleAppsScript.Bkper.BalanceType, periodicity: GoogleAppsScript.Bkper.Periodicity, datePattern: string, fractionDigits: number) {
    var formatsTable = new Array();
    var numberFormatPattern = Utilities_.getNumberFormatPattern(fractionDigits);
    var dateFormatPattern = getDateFormatPattern_(periodicity, datePattern);
    for(var i = 0; i < table.length; i++) {
      var formatsRow = new Array()
      for(var j = 0; j < table[i].length; j++) {
        if (j == 0) {
          //first column
          if (balanceType == BALANCE_TYPE_TOTAL_) {
            formatsRow.push("@");
          } else {
            formatsRow.push(dateFormatPattern);
          }
        } else {
          //Amount
          formatsRow.push(numberFormatPattern);
        }
      }
      formatsTable.push(formatsRow);
    }
    return formatsTable;
  }
    
  function getDateFormatPattern_(periodicity: GoogleAppsScript.Bkper.Periodicity, datePattern: string) {
    if (periodicity == BkperApp.Periodicity.DAILY) {
      return datePattern;
    } else if (periodicity == BkperApp.Periodicity.MONTHLY) {
      return "MMM/yyyy";
    } else {
      return "yyyy";
    }
  }
  

}