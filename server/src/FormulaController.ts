
/**
 * Fetch Transactions
 *
 * @param {string} bookId The universal Book Id.
 * @param {number} cache Increase to clean cache and fetch fresh data.
 * @param {string} query The transactions query.
 * @param {boolean} properties True to include transaction properties.
 * @param {boolean} ids True to include transaction ids.
 * 
 * @customfunction
 */
function BKPER_TRANSACTIONS(bookId: string, cache: number, query: string, properties: boolean, ids: boolean): any[][] {
  return BookService.getBook(bookId)
  .createTransactionsDataTable(query)
  .includeUrls(true)
  .includeProperties(properties)
  .includeIds(ids)
  .build();
}

/**
 * Fetch Accounts
 *
 * @param {string} bookId The universal Book Id.
 * @param {number} cache Increase to clean cache and fetch fresh data.
 * @param {boolean} groups True to include account groups.
 * @param {boolean} properties True to include account properties.
 * 
 * @customfunction
 * 
 */
function BKPER_ACCOUNTS(bookId: string, cache: number, groups?: boolean, properties?: boolean): any[][] {
  return BookService.getBook(bookId)
  .createAccountsDataTable()
  .groups(groups)
  .properties(properties)
  .build();
}

/**
 * Fetch Groups
 *
 * @param {string} bookId The universal Book Id.
 * @param {number} cache Increase to clean cache and fetch fresh data.
 * @param {boolean} properties True to include group properties.
 * 
 * @customfunction
 * 
 */
function BKPER_GROUPS(bookId: string, cache: number, properties?: boolean): any[][] {
  return BookService.getBook(bookId)
  .createGroupsDataTable()
  .properties(properties)
  .build();
}

/**
 * Fetch Trial Balances
 * 
 * @param {string} bookId The universal Book Id.
 * @param {number} cache Increase to clean cache and fetch fresh data.
 * @param {string} query The balances query.
 * @param {boolean} expanded Expand group accounts
 * @param {boolean} transposed Transpose the result
 * @param {boolean} hideNames Hide account/group names
 * 
 * @customfunction
 */
function BKPER_BALANCES_TRIAL(bookId: string, cache: number, query: string, expanded?: boolean|number, transposed?: boolean, hideNames?: boolean): any[][] {
  let balanceReport = BookService.getBook(bookId).getBalancesReport(query);

  query = query.toLowerCase();

  let period = false;

  if (query.indexOf('after:') >= 0) {
    period = true;
  }

  let table = balanceReport.createDataTable()
  .type(BkperApp.BalanceType.TOTAL)
  .expanded(expanded)
  .transposed(transposed)
  .hideNames(hideNames)
  .period(period)
  .trial(true)
  .build();
  if (table == null || table.length == 0) {
    return [['']]
  }
  return table;
}

/**
 * Fetch Total Balances
 * 
 * @param {string} bookId The universal Book Id.
 * @param {number} cache Increase to clean cache and fetch fresh data.
 * @param {string} query The balances query.
 * @param {boolean|number} expanded Expand group accounts
 * @param {boolean} transposed Transpose the result
 * @param {boolean} hideNames Hide account/group names
 * 
 * @customfunction
 */
function BKPER_BALANCES_TOTAL(bookId: string, cache: number, query: string, expanded?: boolean|number, transposed?: boolean, hideNames?: boolean): any[][] {
  let balanceReport = BookService.getBook(bookId).getBalancesReport(query);

  query = query.toLowerCase();

  let period = false;

  if (query.indexOf('after:') >= 0) {
    period = true;
  }

  let table = balanceReport.createDataTable()
  .type(BkperApp.BalanceType.TOTAL)
  .expanded(expanded)
  .transposed(transposed)
  .hideNames(hideNames)
  .period(period)
  .build();
  if (table == null || table.length == 0) {
    return [['']]
  }
  return table;
}

/**
 * Fetch Period Balances
 *
 * @param {string} bookId The universal Book Id.
 * @param {number} cache Increase to clean cache and fetch fresh data.
 * @param {string} query The balances query.
 * @param {boolean} expanded Expand group accounts
 * @param {boolean} transposed Transpose the result
 * @param {boolean} hideDates Hide dates row/column
 * 
 * @customfunction
 */
function BKPER_BALANCES_PERIOD(bookId: string, cache: number, query: string, expanded?: boolean|number, transposed?: boolean, hideDates?: boolean): any[][] {
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
 * @param {number} cache Increase to clean cache and fetch fresh data.
 * @param {string} query The balances query.
 * @param {boolean} expanded Expand group accounts
 * @param {boolean} transposed Transpose the result
 * @param {boolean} hideDates Hide dates row/column
 * 
 * @customfunction
 */
function BKPER_BALANCES_CUMULATIVE(bookId: string, cache: number, query: string, expanded?: boolean|number, transposed?: boolean, hideDates?: boolean): any[][] {
  let balanceReport = BookService.getBook(bookId).getBalancesReport(query);
  return balanceReport.createDataTable()
  .type(BkperApp.BalanceType.CUMULATIVE)
  .expanded(expanded)
  .hideDates(hideDates)
  .transposed(transposed)
  .build();
}
