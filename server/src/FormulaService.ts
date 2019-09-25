var LAST_UPDATE_KEY = "bkper_last_update";

namespace FormulaService {


  export function updateDocument(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, properties: GoogleAppsScript.Properties.Properties) {

    updateFormulas(spreadsheet, 'Date');
    updateFormulas(spreadsheet, 'Name');

    //Migration
    var fetchStatementDAO = new FetchStatementDAO(spreadsheet, properties);
    var statements = fetchStatementDAO.getStatements();
    for (var i = 0; i < statements.length; i++) {
      var statement = statements[i];
      var range = spreadsheet.getRangeByName(statement.rangeName);
      if (range != null) {
        range.clear();
        executeFetch(spreadsheet, statement, range);
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

    if (AutoUpdateTrigger.isEnabled()) {
      AutoUpdateTrigger.disable();
    }

  }

  function updateFormulas(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, text: string) {
    let finder = spreadsheet.createTextFinder(text);
    let ranges = finder.findAll();
    if (ranges != null && ranges.length > 0) {
      ranges.forEach(range => {
        let formulaStr = range.getFormula();
        if (Formula.isBkperFormula(formulaStr)) {
          let formula = Formula.parseString(formulaStr);
          formula.incrementUpdate();
          range.setFormula(formula.toString());          
        }
      });
    }
  }

}