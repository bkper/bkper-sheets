enum FormulaName {
  BKPER_TRANSACTIONS = "BKPER_TRANSACTIONS",
  BKPER_BALANCES_TOTAL = "BKPER_BALANCES_TOTAL",
  BKPER_BALANCES_PERIOD = "BKPER_BALANCES_PERIOD",
  BKPER_BALANCES_CUMULATIVE = "BKPER_BALANCES_CUMULATIVE"
}

class Formula {

  name: FormulaName;
  update: number;
  bookId: string;
  query: string;
  isBookIdString: boolean;
  isQueryString: boolean;
  expandGroups: boolean;
  transpose: boolean;

  incrementUpdate() {
    this.update++;
  }

  static isBkperFormula(formula: string): boolean {
    return formula != null && formula.replace(/ /g, '').indexOf('=BKPER') === 0;
  }

  static parseFetchStatement(fetchStatement: FetchStatement): Formula {
    let formula = new Formula();
    formula.isBookIdString = true;
    formula.isQueryString = true;
    formula.update = 1;
    formula.bookId = fetchStatement.ledgerId;
    formula.query = fetchStatement.query.replace(/\"/g, "'");;
    if (fetchStatement.fetchType === 'transactions') {
      formula.name = FormulaName.BKPER_TRANSACTIONS;
    } else if (fetchStatement.fetchType === 'balances') {
      if (fetchStatement.balanceType.toUpperCase() === BALANCE_TYPE_TOTAL_) {
        formula.name = FormulaName.BKPER_BALANCES_TOTAL;
      } else if (fetchStatement.balanceType.toUpperCase() === BALANCE_TYPE_PERIOD_) {
        formula.name = FormulaName.BKPER_BALANCES_PERIOD;
      } else if (fetchStatement.balanceType.toUpperCase() === BALANCE_TYPE_CUMULATIVE_) {
        formula.name = FormulaName.BKPER_BALANCES_CUMULATIVE;
      }
    }
    formula.expandGroups = fetchStatement.expandGroups ? true : false;
    formula.transpose = fetchStatement.transpose ? true : false;
    return formula;
  }

  private static convertToBoolean(input: string): boolean | undefined {
    try {
        return JSON.parse(input);
    } catch (e) {
        return false;
    }
}

  static parseString(formulaStr: string): Formula {
    let formula = new Formula();
    let regExp = /\(([^)]+)\)/;
    let matches = regExp.exec(formulaStr);
    let params = matches[1].split(/[,;]/);
    formula.bookId = params[0].trim();
    formula.update = +params[1];

    if (formula.bookId[0] === "\"" && formula.bookId[formula.bookId.length - 1] === "\"") {
      formula.bookId = formula.bookId.replace(/\"/g,"");
      formula.isBookIdString = true;
    } else {
      formula.isBookIdString = false;
    }

    formula.query = params[2].trim();
    if (formula.query[0] === "\"" && formula.query[formula.query.length - 1] === "\"") {
      formula.query = formula.query.replace(/\"/g,"");
      formula.isQueryString = true;
    } else {
      formula.isQueryString = false;
    }

    if (params.length > 3) { 
      formula.expandGroups = this.convertToBoolean(params[3]);
    } else {
      formula.expandGroups = false;
    }

    if (params.length > 4) {
      formula.transpose = this.convertToBoolean(params[4]);
    } else {
      formula.transpose = false;
    }


    if (formulaStr.indexOf(FormulaName.BKPER_TRANSACTIONS) >= 0) {
      formula.name = FormulaName.BKPER_TRANSACTIONS;
    } else if (formulaStr.indexOf(FormulaName.BKPER_BALANCES_TOTAL) >= 0) {
      formula.name = FormulaName.BKPER_BALANCES_TOTAL;
    } else if (formulaStr.indexOf(FormulaName.BKPER_BALANCES_PERIOD) >= 0) {
      formula.name = FormulaName.BKPER_BALANCES_PERIOD;
    } else if (formulaStr.indexOf(FormulaName.BKPER_BALANCES_CUMULATIVE) >= 0) {
      formula.name = FormulaName.BKPER_BALANCES_CUMULATIVE;
    }
    return formula;
  }

  toString() {
    let bookIdQuotes = this.isBookIdString ? '"' : '';
    let queryQuotes = this.isQueryString ? '"' : '';
    return `=${this.name}(${bookIdQuotes}${this.bookId}${bookIdQuotes}; ${this.update}; ${queryQuotes}${this.query}${queryQuotes}; ${this.expandGroups}; ${this.transpose})`;
  }
}
