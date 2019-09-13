var STATEMENT_PREFIX = "bkper_fetch_";

/**
 * @public
 */
interface FetchStatement {
  ledgerId: string,
  query: string,
  rangeName: string,
  fetchType: string,
  balanceType?: "CUMULATIVE" | "PERIOD" | "TOTAL";
  lastUpdate: number
}
class FetchStatementDAO {

  properties: GoogleAppsScript.Properties.Properties;
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;

  constructor(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, properties: GoogleAppsScript.Properties.Properties) {
    this.properties = properties;
    this.spreadsheet = spreadsheet;
  }

  saveStatement(range: GoogleAppsScript.Spreadsheet.Range, statement: FetchStatement) {
    var rangeName = STATEMENT_PREFIX + Utilities_.generateUID();
    this.spreadsheet.setNamedRange(rangeName, range);
    statement.rangeName = rangeName;
    var statementJSON = JSON.stringify(statement);
    this.properties.setProperty(rangeName, statementJSON);    
  }
  
  updateStatement(statement: FetchStatement): void {
    var rangeName = statement.rangeName;
    var statementJSON = JSON.stringify(statement);
    this.properties.setProperty(rangeName, statementJSON);    
  }
  
  deleteStatement(rangeName: string, range: GoogleAppsScript.Spreadsheet.Range): void {
    if (range != null) {
      range.clearContent();
    }

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

  deletePreviousStatementAtSameRange(actualRange: GoogleAppsScript.Spreadsheet.Range): void {
    var statements = this.getStatements();
    for (var i = 0; i < statements.length; i++) {
      var statement = statements[i];
      try {
        var range = this.spreadsheet.getRangeByName(statement.rangeName);
        if (range != null && range.getSheet().getName() ==  actualRange.getSheet().getName() && range.getRow() == actualRange.getRow() && range.getColumn() == actualRange.getColumn()) {
          Logger.log("Deleting statement as same range: " + statement.rangeName)
          this.deleteStatement(statement.rangeName, range);
          break;
        }
      } catch (error) {
        Utilities_.logError(error);
      }
    }
  }
  
  
  deleteEmptyStatements(): void {
    var statements = this.getStatements();
    for (var i = 0; i < statements.length; i++) {
      var statement = statements[i];
      try {
        
        var range = this.spreadsheet.getRangeByName(statement.rangeName);
        if (this.isRangeEmpty_(range)) {
          Logger.log("Deleting empty statement: " + statement.rangeName)
          this.deleteStatement(statement.rangeName, range);
        }  
      } catch (error) {
        Utilities_.logError(error);
      }
    }    
  }

  private isRangeEmpty_(range: GoogleAppsScript.Spreadsheet.Range) {
    if (range == null) {
      return true;
    }
    var values = range.getValues();
    for (var i = 0; i < values.length; i++) {
      for (var j = 0; j < values[i].length; j++) {
        var val = values[i][j];
        if (val != null && val != "") {
          return false;
        }
      }
    }
    return true;
  }  
  
  getStatements(): FetchStatement[] {
    var properties = this.properties.getProperties();
    var statements = new Array<FetchStatement>();
    for (var property in properties) {
      if (property.indexOf(STATEMENT_PREFIX) == 0) {
        Logger.log(property);
        var statementJSON = properties[property];
        var statement = JSON.parse(statementJSON);
        statements.push(statement);
      }
    }
    return statements;
  }
  
  
}
