/**
 * Fetch Transactions
 *
 * @param {string} bookId The universal Book Id.
 * @param {string} query The transactions query.
 * 
 * @customfunction
 */
function BKPER_TRANSACTIONS(bookId: string, query: string): any[][] {
  return BkperApp.getBook(bookId).createTransactionsDataTable(query).build();
}

/**
 * Fetch Total Balances
 *
 * @param {string} bookId The universal Book Id.
 * @param {string} query The balances query.
 * 
 * @customfunction
 */
function BKPER_BALANCES_TOTAL(bookId: string, query: string): any[][] {
  let balanceReport = BkperApp.getBook(bookId).getBalanceReport(query);
  return balanceReport.createDataTable().setBalanceType(BkperApp.BalanceType.TOTAL).build();
}

/**
 * Fetch Period Balances
 *
 * @param {string} bookId The universal Book Id.
 * @param {string} query The balances query.
 * 
 * @customfunction
 */
function BKPER_BALANCES_PERIOD(bookId: string, query: string): any[][] {
  try {
    let balanceReport = BkperApp.getBook(bookId).getBalanceReport(query);
    return balanceReport.createDataTable().setBalanceType(BkperApp.BalanceType.PERIOD).build();
  } catch(error) {
    Logger.log(JSON.stringify(error))
    throw error;
  }
}

/**
 * Fetch Cumulative Balances
 *
 * @param {string} bookId The universal Book Id.
 * @param {string} query The balances query.
 * 
 * @customfunction
 */
function BKPER_BALANCES_CUMULATIVE(bookId: string, query: string): any[][] {
  let balanceReport = BkperApp.getBook(bookId).getBalanceReport(query);
  return balanceReport.createDataTable().setBalanceType(BkperApp.BalanceType.CUMULATIVE).build();
}
