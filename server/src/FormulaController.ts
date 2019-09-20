/**
 * Fetch Transactions
 *
 * @param {0|1} update Update control to flush cache.
 * @param {string} bookId The universal Book Id.
 * @param {string} query The transactions query.
 * 
 * @customfunction
 */
function BKPER_TRANSACTIONS(update: number, bookId: string,  query: string): any[][] {
  return BkperApp.getBook(bookId).createTransactionsDataTable(query).addUrls().build();
}

/**
 * Fetch Total Balances
 * 
 * @param {0|1} update Update control to flush cache.
 * @param {string} bookId The universal Book Id.
 * @param {string} query The balances query.
 * 
 * @customfunction
 */
function BKPER_BALANCES_TOTAL(update: number, bookId: string, query: string): any[][] {
  let balanceReport = BkperApp.getBook(bookId).getBalanceReport(query);
  return balanceReport.createDataTable().setBalanceType(BkperApp.BalanceType.TOTAL).build();
}

/**
 * Fetch Period Balances
 *
 * @param {0|1} update Update control to flush cache.
 * @param {string} bookId The universal Book Id.
 * @param {string} query The balances query.
 * 
 * @customfunction
 */
function BKPER_BALANCES_PERIOD(update: number, bookId: string, query: string): any[][] {
    let balanceReport = BkperApp.getBook(bookId).getBalanceReport(query);
    return balanceReport.createDataTable().setBalanceType(BkperApp.BalanceType.PERIOD).build();
}

/**
 * Fetch Cumulative Balances
 * 
 * @param {0|1} update Update control to flush cache.
 * @param {string} bookId The universal Book Id.
 * @param {string} query The balances query.
 * 
 * @customfunction
 */
function BKPER_BALANCES_CUMULATIVE(update: number, bookId: string, query: string): any[][] {
  let balanceReport = BkperApp.getBook(bookId).getBalanceReport(query);
  return balanceReport.createDataTable().setBalanceType(BkperApp.BalanceType.CUMULATIVE).build();
}
