enum FormulaName {
  BKPER_ACCOUNTS = "BKPER_ACCOUNTS",
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
  expanded: boolean;
  transposed: boolean;
  hideDatesOrNames: boolean;
  trial: boolean;
  locale: string;
  COMMA_LOCALES = ["en_US", "en_AU", "en_CA", "zh_CN", "ar_EG", "zh_HK", "hi_IN", "bn_IN", "gu_IN", "kn_IN", "ml_IN", "mr_IN", "pa_IN", "ta_IN", "te_IN", "en_IE", "iw_IL", "ja_JP", "es_MX", "mn_MN", "my_MM", "fil_PH", "ko_KR", "de_CH", "zh_TW", "th_TH", "en_GB", "cy_GB"];

  static isBkperFormula(formula: string): boolean {
    return formula != null && formula.replace(/ /g, '').indexOf('=BKPER') === 0;
  }  

  incrementUpdate() {
    this.update++;
  }

  static parseFetchStatement(fetchStatement: FetchStatement, locale: string): Formula {
    let formula = new Formula();
    formula.locale = locale;
    formula.isBookIdString = true;
    formula.isQueryString = true;
    formula.update = 1;
    formula.bookId = fetchStatement.ledgerId;
    formula.query = fetchStatement.query.replace(/\"/g, "'");;
    if (fetchStatement.fetchType === 'accounts') {
      formula.name = FormulaName.BKPER_ACCOUNTS;
    } else if (fetchStatement.fetchType === 'transactions') {
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
    formula.expanded = fetchStatement.expanded ? true : false;
    formula.transposed = fetchStatement.transposed ? true : false;
    formula.hideDatesOrNames = fetchStatement.hideDates ? true : false;
    formula.trial = fetchStatement.trial ? true : false;
    return formula;
  }

  private static convertToBoolean(input: string): boolean | undefined {
    try {
        return JSON.parse(input.toLocaleLowerCase());
    } catch (e) {
        return false;
    }
}

  static parseString(formulaStr: string, locale: string): Formula {
    let formula = new Formula();
    formula.locale = locale;
    let init = formulaStr.indexOf('(');
    let end = formulaStr.lastIndexOf(')')

    let formulaParams = formulaStr.substr(init+1,end-init-1);

    // Parenteses OK - https://stackoverflow.com/questions/39647555/how-to-split-string-while-ignoring-portion-in-parentheses
    // let params = formulaParams.split(/[,;](?![^(]*\)) /);

    
    // Aspas OK - https://stackoverflow.com/questions/23582276/split-string-by-comma-but-ignore-commas-inside-quotes/23582323
    // let params = formulaParams.split(/[,;](?=(?:(?:[^"]*"){2})*[^"]*$)/);
    
    //Combining both
    let params = formulaParams.split(/[,;]((?=(?:(?:[^"]*"){2})*[^"]*$)(?![^(]*\)))/);
    params = params.filter(n => n);

    formula.bookId = params[0].trim();
    formula.update = +params[1];

    if (formula.bookId[0] === "\"" && formula.bookId[formula.bookId.length - 1] === "\"") {
      formula.bookId = formula.bookId.replace(/\"/g,"");
      formula.isBookIdString = true;
    } else {
      formula.isBookIdString = false;
    }

    if (params.length > 2) {
      formula.query = params[2].trim();
      if (formula.query[0] === "\"" && formula.query[formula.query.length - 1] === "\"") {
        formula.query = formula.query.replace(/\"/g, "");
        formula.isQueryString = true;
      } else {
        formula.isQueryString = false;
      }
    }

    if (params.length > 3) { 
      formula.expanded = this.convertToBoolean(params[3]);
    } else {
      formula.expanded = false;
    }

    if (params.length > 4) {
      formula.transposed = this.convertToBoolean(params[4]);
    } else {
      formula.transposed = false;
    }

    if (params.length > 5) {
      formula.hideDatesOrNames = this.convertToBoolean(params[5]);
    } else {
      formula.hideDatesOrNames = false;
    }

    if (params.length > 6) {
      formula.trial = this.convertToBoolean(params[6]);
    } else {
      formula.trial = false;
    }


    if (formulaStr.indexOf(FormulaName.BKPER_ACCOUNTS) >= 0) {
      formula.name = FormulaName.BKPER_ACCOUNTS;
    } else if (formulaStr.indexOf(FormulaName.BKPER_TRANSACTIONS) >= 0) {
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
    let sep = this.getSep();
    let transposed = (''+this.transposed).toUpperCase();
    let expanded = (''+this.expanded).toUpperCase();
    let hideDatesOrNames = (''+this.hideDatesOrNames).toUpperCase();
    let trial = (''+this.trial).toUpperCase();

    if (this.name === FormulaName.BKPER_ACCOUNTS) {
      return `=${this.name}(${bookIdQuotes}${this.bookId}${bookIdQuotes}${sep} ${this.update})`;
    } else if (this.name === FormulaName.BKPER_TRANSACTIONS) {
      return `=${this.name}(${bookIdQuotes}${this.bookId}${bookIdQuotes}${sep} ${this.update}${sep} ${queryQuotes}${this.query}${queryQuotes})`;
    } else if (this.name === FormulaName.BKPER_BALANCES_TOTAL) {
      return `=${this.name}(${bookIdQuotes}${this.bookId}${bookIdQuotes}${sep} ${this.update}${sep} ${queryQuotes}${this.query}${queryQuotes}${sep} ${expanded}${sep} ${transposed}${sep} ${hideDatesOrNames}${sep} ${trial})`;
    } else {
      return `=${this.name}(${bookIdQuotes}${this.bookId}${bookIdQuotes}${sep} ${this.update}${sep} ${queryQuotes}${this.query}${queryQuotes}${sep} ${expanded}${sep} ${transposed}${sep} ${hideDatesOrNames})`;
    }
  }

  getSep() {
    for (const locale of this.COMMA_LOCALES) {
      if (locale === this.locale) {
        return ','
      }
    }  
    return ';'
  }

}
