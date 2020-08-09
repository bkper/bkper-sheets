
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
  return BookService.getBook(bookId).createTransactionsDataTable(query).includeUrls(true).build();
}

/**
 * Fetch Accounts
 *
 * @param {string} bookId The universal Book Id.
 * @param {number} cache Increase to clean cache and force fetch update.
 * 
 * @customfunction
 * 
 */
function BKPER_ACCOUNTS(bookId: string, cache: number): any[][] {
  return BookService.getBook(bookId).createAccountsDataTable().build();
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
  let balanceReport = BookService.getBook(bookId).getBalancesReport(query);
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
 * @param {boolean=} hideDates Hide dates row/column
 * 
 * @customfunction
 */
function BKPER_BALANCES_PERIOD(bookId: string, cache: number, query: string, expanded?: boolean, transposed?: boolean, hideDates?: boolean): any[][] {
  let balanceReport = BookService.getBook(bookId).getBalancesReport(query);
  return balanceReport.createDataTable()
  .type(BkperApp.BalanceType.PERIOD)
  .expanded(expanded)
  .hideDates(hideDates)
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
 * @param {boolean=} hideDates Hide dates row/column
 * 
 * @customfunction
 */
function BKPER_BALANCES_CUMULATIVE(bookId: string, cache: number, query: string, expanded?: boolean, transposed?: boolean, hideDates?: boolean): any[][] {
  let balanceReport = BookService.getBook(bookId).getBalancesReport(query);
  return balanceReport.createDataTable()
  .type(BkperApp.BalanceType.CUMULATIVE)
  .expanded(expanded)
  .hideDates(hideDates)
  .transposed(transposed)
  .build();
}
