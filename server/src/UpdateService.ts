var LAST_UPDATE_KEY = "bkper_last_update";

namespace UpdateService_ {


  export function updateDocument(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, properties: GoogleAppsScript.Properties.Properties, autoUpdate: boolean) {

    try {
      updateFormulas(spreadsheet, properties, 'Date', autoUpdate);
      updateFormulas(spreadsheet, properties, 'Name', autoUpdate);
      setLastUpdate(properties);
    } catch(error) {
      setLastUpdateError(properties, error);
    }

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

  function updateFormulas(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, properties: GoogleAppsScript.Properties.Properties, text: string, autoUpdate: boolean) {
    let finder = spreadsheet.createTextFinder(text);
    let ranges = finder.findAll();
    if (ranges != null && ranges.length > 0) {
      ranges.forEach(range => {
        let formulaStr = range.getFormula();
        if (Formula.isBkperFormula(formulaStr)) {
          let formula = Formula.parseString(formulaStr);
          formula.incrementUpdate();
          try {
            let book = LedgerService_.loadBook(formula.bookId);
            if (book.getPermission() != BkperApp.Permission.NONE && book.getPermission() != BkperApp.Permission.RECORD_ONLY) {
              if (autoUpdate) {
                //Check if book was updated
                let key = `book_last_update_${book.getId()}`;
                let lastUpdate = +properties.getProperty(key);
                if (lastUpdate != null && book.getLastUpdateMs() !== lastUpdate) {
                  //Update last update
                  lastUpdate = book.getLastUpdateMs();
                  properties.setProperty(key, lastUpdate + "");
                  range.setFormula(formula.toString());
                }
              } else {
                range.setFormula(formula.toString());
              }
            }
          } catch (error) {
            Logger.log(error);
            //OK - Don't update in case of error such as book not found or forbidden
          }
        }
      });
    }
  }

  function setLastUpdate(properties: GoogleAppsScript.Properties.UserProperties): void {
    var lastUpdate = {
      dateMs: Date.now(),
      user: Session.getEffectiveUser().getEmail()
    }
    properties.setProperty(LAST_UPDATE_KEY, JSON.stringify(lastUpdate));
  }

  function setLastUpdateError(properties: GoogleAppsScript.Properties.UserProperties, error: string): void {
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