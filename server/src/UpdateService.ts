var LAST_UPDATE_KEY = "bkper_last_update";

namespace UpdateService_ {


  export function updateDocument(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, properties: GoogleAppsScript.Properties.Properties, autoUpdate: boolean) {

    let finder = spreadsheet.createTextFinder('Date');
    let ranges = finder.findAll();
    if (ranges != null && ranges.length > 0) {
      ranges.forEach(range => {
        let formulaStr = range.getFormula();
        if (Formula.isBkperFormula(formulaStr)) {
          let formula = Formula.parseString(formulaStr);
          formula.switch();
          //TODO Check if book was updated
          //TODO Only update if permission ok
          range.setFormula(formula.toString());
        }
      })
    }

    UpdateService_.setLastUpdate(properties);

    //Migration
    var fetchStatementDAO = new FetchStatementDAO(spreadsheet, properties);
    var statements = fetchStatementDAO.getStatements();
    for (var i = 0; i < statements.length; i++) {
      var statement = statements[i];
      var range = spreadsheet.getRangeByName(statement.rangeName);
      if (range != null) {
        range.clear();
        executeFetch(spreadsheet, statement, range, false);
        fetchStatementDAO.deleteStatement(statement.rangeName);
      }
    }

    let namedRanges = spreadsheet.getNamedRanges();
    if (namedRanges != null) {
      namedRanges.forEach(namedRange => {
        if (namedRange.getName().indexOf("bkper_fetch") >= 0) {
          fetchStatementDAO.deleteStatement(namedRange.getName());
        }
      })
    }

  }

  export function setLastUpdate(properties: GoogleAppsScript.Properties.UserProperties): void {
    var lastUpdate = {
      dateMs: Date.now(),
      user: Session.getEffectiveUser().getEmail()
    }
    properties.setProperty(LAST_UPDATE_KEY, JSON.stringify(lastUpdate));
  }

  export function setLastUpdateError(properties: GoogleAppsScript.Properties.UserProperties, error: string): void {

    var lastUpdate = {
      dateMs: null as number,
      user: error
    }
    properties.setProperty(LAST_UPDATE_KEY, JSON.stringify(lastUpdate));
  }

  export function getLastUpdate(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, properties: GoogleAppsScript.Properties.UserProperties): string {

    var lastUpdateJSON = properties.getProperty(LAST_UPDATE_KEY);
    if (lastUpdateJSON == null) {
      return "";
    }

    var lastUpdate = JSON.parse(lastUpdateJSON);

    if (lastUpdate.dateMs == null) {
      return "Last update was UNSUCESSFUL: " + lastUpdate.user;
    }

    var lastUpdateDate = new Date(new Number(lastUpdate.dateMs).valueOf());

    var formatedLastUpdateDate = Utilities_.formatDateRelativeTo(lastUpdateDate, new Date(), spreadsheet.getSpreadsheetTimeZone());

    var fullLastUpdate = "Last update was " + formatedLastUpdateDate + " by " + lastUpdate.user;

    return fullLastUpdate;
  }



}