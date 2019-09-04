


function executeFetch(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, properties: GoogleAppsScript.Properties.Properties, fetchStatement: Statement, range: GoogleAppsScript.Spreadsheet.Range, saveStatement: boolean): void {
  if (range == null) {
    range = spreadsheet.getActiveCell();
  }
  if(fetchStatement.query.length > 0) {    
    if (fetchStatement.fetchType == "balances") {
      BalanceService_.insert(spreadsheet, properties, fetchStatement, range, saveStatement);
    } else if (fetchStatement.fetchType == "transactions") {
      TransactionService_.insert(spreadsheet, properties, fetchStatement, range, saveStatement);
    }
  }  
}
