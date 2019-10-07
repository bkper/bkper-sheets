var LAST_UPDATE_KEY = "bkper_last_update";

namespace FormulaService {


  export function updateDocument(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, properties: GoogleAppsScript.Properties.Properties) {

    updateFormulas(spreadsheet);

    //Migration - TODO REMOVE Later
    try {
      var fetchStatementDAO = new FetchStatementDAO(spreadsheet, properties);
      var statements = fetchStatementDAO.getStatements();
      for (var i = 0; i < statements.length; i++) {
        try {
          var statement = statements[i];
          var range = null;
          
          try {
            range = spreadsheet.getRangeByName(statement.rangeName);
          } catch (error) {
            Utilities_.logError(error);
          }
    
          if (range != null) {
            range.clear();
            executeFetch(spreadsheet, statement, range);
          }
          fetchStatementDAO.deleteStatement(statement.rangeName);
        } catch (error) {
          Utilities_.logError(error);
        }
      }
  
      let namedRanges = spreadsheet.getNamedRanges();
      if (namedRanges != null) {
        namedRanges.forEach(namedRange => {
          try {
            if (namedRange.getName().indexOf("bkper_fetch") >= 0) {
              fetchStatementDAO.deleteStatement(namedRange.getName());
            }
          } catch (error) {
            Utilities_.logError(error);
          }
        })
      }
  
      if (AutoUpdateTrigger.isEnabled()) {
        AutoUpdateTrigger.disable();
      }
    } catch (error) {
      Utilities_.logError(error);
    }


  }

  function updateFormulas(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet) {
    let finder = spreadsheet.createTextFinder("BKPER").matchFormulaText(true);
    let ranges = finder.findAll();
    if (ranges != null && ranges.length > 0) {
      ranges.forEach(range => {
        let formulaStr = range.getFormula();
        if (Formula.isBkperFormula(formulaStr)) {
          let formula = Formula.parseString(formulaStr, spreadsheet.getSpreadsheetLocale());
          formula.incrementUpdate();
          range.setFormula(formula.toString());          
        }
      });
    }
  }

}