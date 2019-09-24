var STATEMENT_PREFIX = "bkper_fetch_";

/**
 * @public
 */
interface FetchStatement {
  ledgerId: string,
  query: string,
  rangeName: string,
  fetchType: "transactions" | "balances",
  balanceType?: "CUMULATIVE" | "PERIOD" | "TOTAL",
  expandGroups?: boolean,
  transpose?: boolean,
  lastUpdate: number
}
class FetchStatementDAO {

  properties: GoogleAppsScript.Properties.Properties;
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;

  constructor(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, properties: GoogleAppsScript.Properties.Properties) {
    this.properties = properties;
    this.spreadsheet = spreadsheet;
  }

  
  deleteStatement(rangeName: string): void {

    try {
      this.properties.deleteProperty(rangeName);    
    } catch (error) {
      Utilities_.logError(error);
    }
    
    try {
      this.spreadsheet.removeNamedRange(rangeName);
    } catch (error) {
      Utilities_.logError(error);
    }    
  }
  
  getStatements(): FetchStatement[] {
    var properties = this.properties.getProperties();
    var statements = new Array<FetchStatement>();
    for (var property in properties) {
      if (property.indexOf(STATEMENT_PREFIX) == 0) {
        var statementJSON = properties[property];
        var statement = JSON.parse(statementJSON);
        statements.push(statement);
      }
    }
    return statements;
  }
  
  
}
