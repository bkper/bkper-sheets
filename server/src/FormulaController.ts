/**
 * Fetch Transactions
 *
 * @param {string} bookId The universal Book Id.
 * @param {number} updateCount Starts in 1 and increase on every update.
 * @param {string} query The transactions query.
 * 
 * @customfunction
 */
function BKPER_TRANSACTIONS(bookId: string, updateCount: number, query: string): any[][] {
  return BkperApp.getBook(bookId).createTransactionsDataTable(query).addUrls().build();
}

/**
 * Fetch Total Balances
 * 
 * @param {string} bookId The universal Book Id.
 * @param {number} updateCount Starts in 1 and increase on every update.
 * @param {string} query The balances query.
 * @param {boolean=} expanded Expand group accounts
 * @param {boolean=} transposed Transpose the result
 * 
 * @customfunction
 */
function BKPER_BALANCES_TOTAL(bookId: string, updateCount: number, query: string, expanded?: boolean, transposed?: boolean): any[][] {
  let balanceReport = BkperApp.getBook(bookId).getBalanceReport(query);
  const builder = balanceReport.createDataTable().setBalanceType(BkperApp.BalanceType.TOTAL);
  if (expanded) {
    builder.expandGroups();
  }
  if (transposed) {
    builder.transpose();
  }
  return builder.build();
}

/**
 * Fetch Period Balances
 *
 * @param {string} bookId The universal Book Id.
 * @param {number} updateCount Starts in 1 and increase on every update.
 * @param {string} query The balances query.
 * @param {boolean=} expanded Expand group accounts
 * @param {boolean=} transposed Transpose the result
 * 
 * 
 * @customfunction
 */
function BKPER_BALANCES_PERIOD(bookId: string, updateCount: number, query: string, expanded?: boolean, transposed?: boolean): any[][] {
  let balanceReport = BkperApp.getBook(bookId).getBalanceReport(query);
  const builder = balanceReport.createDataTable().setBalanceType(BkperApp.BalanceType.PERIOD);
  if (expanded) {
    builder.expandGroups();
  }
  if (transposed) {
    builder.transpose();
  }
  return builder.build();
}

/**
 * Fetch Cumulative Balances
 * 
 * @param {string} bookId The universal Book Id.
 * @param {number} updateCount Starts in 1 and increase on every update.
 * @param {string} query The balances query.
 * @param {boolean=} expanded Expand group accounts
 * @param {boolean=} transposed Transpose the result
 * 
 * @customfunction
 */
function BKPER_BALANCES_CUMULATIVE(bookId: string, updateCount: number, query: string, expanded?: boolean, transposed?: boolean): any[][] {
  let balanceReport = BkperApp.getBook(bookId).getBalanceReport(query);
  const builder = balanceReport.createDataTable().setBalanceType(BkperApp.BalanceType.CUMULATIVE);
  if (expanded) {
    builder.expandGroups();
  }
  if (transposed) {
    builder.transpose();
  }  
  return builder.build();
}