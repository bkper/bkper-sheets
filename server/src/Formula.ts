enum FormulaName {
  BKPER_ACCOUNTS = "BKPER_ACCOUNTS",
  BKPER_GROUPS = "BKPER_GROUPS",
  BKPER_TRANSACTIONS = "BKPER_TRANSACTIONS",
  BKPER_BALANCES_TOTAL = "BKPER_BALANCES_TOTAL",
  BKPER_BALANCES_PERIOD = "BKPER_BALANCES_PERIOD",
  BKPER_BALANCES_TRIAL = "BKPER_BALANCES_TRIAL",
  BKPER_BALANCES_CUMULATIVE = "BKPER_BALANCES_CUMULATIVE"
}

class Formula {

  name: FormulaName;
  bookId: string;
  cache: number;
  param1: string | boolean;
  param2: string | boolean | number;
  param3: string | boolean;
  param4: string | boolean;
  isBookIdString: boolean;
  isQueryString: boolean;
  locale: string;
  COMMA_LOCALES = ["en_US", "en_AU", "en_CA", "zh_CN", "ar_EG", "zh_HK", "hi_IN", "bn_IN", "gu_IN", "kn_IN", "ml_IN", "mr_IN", "pa_IN", "ta_IN", "te_IN", "en_IE", "iw_IL", "ja_JP", "es_MX", "mn_MN", "my_MM", "fil_PH", "ko_KR", "de_CH", "zh_TW", "th_TH", "en_GB", "cy_GB"];

  static isBkperFormula(formula: string): boolean {
    return formula != null && formula.replace(/ /g, '').indexOf('=BKPER') === 0;
  }  

  incrementUpdate() {
    this.cache++;
  }

  static parseFetchStatement(fetchStatement: FetchStatement, locale: string): Formula {

    let formula = new Formula();
    formula.locale = locale;
    formula.isBookIdString = true;
    formula.isQueryString = true;
    formula.bookId = fetchStatement.ledgerId;
    formula.cache = 1;
    
    if (fetchStatement.fetchType === 'groups') {
      formula.name = FormulaName.BKPER_GROUPS;
    } else if (fetchStatement.fetchType === 'accounts') {
      formula.name = FormulaName.BKPER_ACCOUNTS;
    } else if (fetchStatement.fetchType === 'transactions') {
      formula.name = FormulaName.BKPER_TRANSACTIONS;
      formula.param1 = fetchStatement.query.replace(/\"/g, "'");
    } else if (fetchStatement.fetchType === 'balances') {
      formula.param1 = fetchStatement.query.replace(/\"/g, "'");
      if (typeof fetchStatement.expanded == "boolean" && fetchStatement.expanded == true) {
        formula.param2 = true;
      } else if (typeof fetchStatement.expanded == "number") {
        formula.param2 = fetchStatement.expanded;
      } else {
        formula.param2 = false;
      }
      formula.param3 = fetchStatement.transposed ? true : false;
      if (fetchStatement.balanceType.toUpperCase() === BALANCE_TYPE_TOTAL_) {
        formula.name = FormulaName.BKPER_BALANCES_TOTAL;
        formula.param4 = fetchStatement.hideNames ? true : false;
      } else if (fetchStatement.balanceType.toUpperCase() === BALANCE_TYPE_TRIAL_) {
        formula.name = FormulaName.BKPER_BALANCES_TRIAL;
        formula.param4 = fetchStatement.hideNames ? true : false;
      } else if (fetchStatement.balanceType.toUpperCase() === BALANCE_TYPE_PERIOD_) {
        formula.name = FormulaName.BKPER_BALANCES_PERIOD;
        formula.param4 = fetchStatement.hideDates ? true : false;
      } else if (fetchStatement.balanceType.toUpperCase() === BALANCE_TYPE_CUMULATIVE_) {
        formula.name = FormulaName.BKPER_BALANCES_CUMULATIVE;
        formula.param4 = fetchStatement.hideDates ? true : false;
      }
    }
    return formula;
  }

  private static convertToBoolean(input: string): boolean | string {
    try {
        return JSON.parse(input.toLocaleLowerCase());
    } catch (e) {
        return input.trim();
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
    formula.cache = +params[1];

    if (formula.bookId[0] === "\"" && formula.bookId[formula.bookId.length - 1] === "\"") {
      formula.bookId = formula.bookId.replace(/\"/g,"");
      formula.isBookIdString = true;
    } else {
      formula.isBookIdString = false;
    }

    if (params.length > 2) {
      formula.param1 = params[2].trim();
      if (formula.param1[0] === "\"" && formula.param1[formula.param1.length - 1] === "\"") {
        formula.param1 = formula.param1.substring(1, formula.param1.length - 1);
        // formula.param1 = formula.param1.replace(/\"/g, "");
        formula.isQueryString = true;
      } else {
        formula.isQueryString = false;
      }
    }

    if (params.length > 3) { 
      formula.param2 = this.convertToBoolean(params[3]);
    } else {
      formula.param2 = false;
    }

    if (params.length > 4) {
      formula.param3 = this.convertToBoolean(params[4]);
    } else {
      formula.param3 = false;
    }

    if (params.length > 5) {
      formula.param4 = this.convertToBoolean(params[5]);
    } else {
      formula.param4 = false;
    }



    if (formulaStr.indexOf(FormulaName.BKPER_ACCOUNTS) >= 0) {
      formula.name = FormulaName.BKPER_ACCOUNTS;
    } else if (formulaStr.indexOf(FormulaName.BKPER_GROUPS) >= 0) {
      formula.name = FormulaName.BKPER_GROUPS;
    } else if (formulaStr.indexOf(FormulaName.BKPER_TRANSACTIONS) >= 0) {
      formula.name = FormulaName.BKPER_TRANSACTIONS;
    } else if (formulaStr.indexOf(FormulaName.BKPER_BALANCES_TOTAL) >= 0) {
      formula.name = FormulaName.BKPER_BALANCES_TOTAL;
    } else if (formulaStr.indexOf(FormulaName.BKPER_BALANCES_TRIAL) >= 0) {
      formula.name = FormulaName.BKPER_BALANCES_TRIAL;
    } else if (formulaStr.indexOf(FormulaName.BKPER_BALANCES_PERIOD) >= 0) {
      formula.name = FormulaName.BKPER_BALANCES_PERIOD;
    } else if (formulaStr.indexOf(FormulaName.BKPER_BALANCES_CUMULATIVE) >= 0) {
      formula.name = FormulaName.BKPER_BALANCES_CUMULATIVE;
    }
    return formula;
  }

  toString() {
    let bookIdQuotes = this.isBookIdString ? '"' : '';
    let param1Quotes = this.isQueryString ? '"' : '';
    let sep = this.getSep();
    let param2 = (''+this.param2).toUpperCase();
    let param3 = (''+this.param3).toUpperCase();
    let param4 = (''+this.param4).toUpperCase();


    if (this.name === FormulaName.BKPER_GROUPS) {
      return `=${this.name}(${bookIdQuotes}${this.bookId}${bookIdQuotes}${sep} ${this.cache})`;
    } else if (this.name === FormulaName.BKPER_ACCOUNTS) {
      return `=${this.name}(${bookIdQuotes}${this.bookId}${bookIdQuotes}${sep} ${this.cache})`;
    } else if (this.name === FormulaName.BKPER_TRANSACTIONS) {
      return `=${this.name}(${bookIdQuotes}${this.bookId}${bookIdQuotes}${sep} ${this.cache}${sep} ${param1Quotes}${this.param1}${param1Quotes})`;
    } else {
      return `=${this.name}(${bookIdQuotes}${this.bookId}${bookIdQuotes}${sep} ${this.cache}${sep} ${param1Quotes}${this.param1}${param1Quotes}${sep} ${param2}${sep} ${param3}${sep} ${param4})`;
    }
  }

  toJavascript(): string {
    this.locale = "en_US";
    return this.toString().replaceAll("TRUE", "true").replaceAll("FALSE", "false").replace("=", "").trim();
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
