/**
 * Fetch Transactions
 *
 * @param {string} bookId The universal Book Id.
 * @param {number} cache Increase to clean cache and force fetch update.
 * @param {string} query The transactions query.
 * 
 * @customfunction
 */
function BKPER_TRANSACTIONS(bookId: string, cache: number, query: string): any[][] {
  return BkperApp.getBook(bookId).createTransactionsDataTable(query).includeUrls(true).build();
}

/**
 * Fetch Total Balances
 * 
 * @param {string} bookId The universal Book Id.
 * @param {number} cache Increase to clean cache and force fetch update.
 * @param {string} query The balances query.
 * @param {boolean=} expanded Expand group accounts
 * @param {boolean=} transposed Transpose the result
 * 
 * @customfunction
 */
function BKPER_BALANCES_TOTAL(bookId: string, cache: number, query: string, expanded?: boolean, transposed?: boolean): any[][] {
  let balanceReport = BkperApp.getBook(bookId).getBalanceReport(query);
  return balanceReport.createDataTable()
  .type(BkperApp.BalanceType.TOTAL)
  .expanded(expanded)
  .transposed(transposed)
  .build();  
}

/**
 * Fetch Period Balances
 *
 * @param {string} bookId The universal Book Id.
 * @param {number} cache Increase to clean cache and force fetch update.
 * @param {string} query The balances query.
 * @param {boolean=} expanded Expand group accounts
 * @param {boolean=} transposed Transpose the result
 * 
 * 
 * @customfunction
 */
function BKPER_BALANCES_PERIOD(bookId: string, cache: number, query: string, expanded?: boolean, transposed?: boolean): any[][] {
  let balanceReport = BkperApp.getBook(bookId).getBalanceReport(query);
  return balanceReport.createDataTable()
  .type(BkperApp.BalanceType.PERIOD)
  .expanded(expanded)
  .transposed(transposed)
  .build();
}

/**
 * Fetch Cumulative Balances
 * 
 * @param {string} bookId The universal Book Id.
 * @param {number} cache Increase to clean cache and force fetch update.
 * @param {string} query The balances query.
 * @param {boolean=} expanded Expand group accounts
 * @param {boolean=} transposed Transpose the result
 * 
 * @customfunction
 */
function BKPER_BALANCES_CUMULATIVE(bookId: string, cache: number, query: string, expanded?: boolean, transposed?: boolean): any[][] {
  let balanceReport = BkperApp.getBook(bookId).getBalanceReport(query);
  return balanceReport.createDataTable()
  .type(BkperApp.BalanceType.CUMULATIVE)
  .expanded(expanded)
  .transposed(transposed)
  .build();
}
