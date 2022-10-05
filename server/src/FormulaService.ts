var LAST_UPDATE_KEY = "bkper_last_update";

namespace FormulaService {


  export function updateDocument(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, properties: GoogleAppsScript.Properties.Properties) {
    updateFormulas(spreadsheet);
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