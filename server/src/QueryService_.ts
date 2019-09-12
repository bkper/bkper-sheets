var QUERY_CATEGORY_SAVED_ = "Saved Queries";
var QUERY_CATEGORY_ACCOUNT_ = "Accounts";
var QUERY_CATEGORY_GROUP_ = "Groups";

/**
 * @public
 */
interface Query {
  title: string,
  query: string,
  category: string
}

/**
 * @public
 */
interface LedgerQueries {
  ledgerId: string,
  queries: Query[]
}

namespace QueryService_ {

  export function loadQueries(ledgerId: string): LedgerQueries {
    var ledger = LedgerService_.loadLedger(ledgerId);

    var queries = filterBalanceSavedQueries_(ledger);
    var groupQueries = createGroupQueries_(ledger);
    queries = queries.concat(groupQueries);
    var accountQueries = createAccountQueries_(ledger)
    queries = queries.concat(accountQueries);
    
    var ledgerQueries = {
      ledgerId: ledgerId,
      queries: queries
    };

    return ledgerQueries;

  }

  function filterBalanceSavedQueries_(ledger: GoogleAppsScript.Bkper.Book): Query[] {
    return ledger.getSavedQueries().map(query => {return {...query, category: QUERY_CATEGORY_SAVED_}}).sort(queryComparator_);
  }

  function createAccountQueries_(ledger: GoogleAppsScript.Bkper.Book): Query[] {
    return ledger.getAccounts().filter(account => account.isActive()).map(account => {
      return {
        title: account.getName(),
        query: `acc:'${account.getName()}'`,
        category: QUERY_CATEGORY_ACCOUNT_
      }
    }).sort(queryComparator_);
  }
  
  function createGroupQueries_(ledger: GoogleAppsScript.Bkper.Book): Query[] {
    return ledger.getGroups().filter(group => group.hasAccounts()).map(group => {
      return {
        title: group.getName(),
        query: `group:'${group.getName()}'`,
        category: QUERY_CATEGORY_GROUP_
      }
    }).sort(queryComparator_);
  }
  
  function getFirstAccountNameOnString_(queryString: string, accountsArray: GoogleAppsScript.Bkper.Account[]): GoogleAppsScript.Bkper.Account {
    var correctAccount: GoogleAppsScript.Bkper.Account;
    var largestAccountName = 0;
    
    for (var j = 0; j < accountsArray.length; j++) {
      var account = accountsArray[j];
      var accountName = account.getName();
      if (queryString.length >= accountName.length) {
        var possibleMatch = queryString.substring(0, accountName.length);
        if (possibleMatch.indexOf(accountName) == 0) {
          if (accountName.length > largestAccountName) {          
            largestAccountName = accountName.length;
            correctAccount = account;
          }
        } else if (queryString.length > accountName.length) {
          possibleMatch = queryString.substring(1, accountName.length+1);
          if (possibleMatch.indexOf(accountName) == 0) {
            if (accountName.length > largestAccountName) {
              largestAccountName = accountName.length;
              correctAccount = account;
            }
          }
        }
      }
    }
    return correctAccount;
  }

  function queryComparator_(query1: Query, query2: Query) {
    if ( query1.title < query2.title)
      return -1;
    if ( query1.title > query2.title)
      return 1;
    return 0;
  }

};
