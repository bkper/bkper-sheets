var QUERY_CATEGORY_SAVED_ = "Saved Queries";
var QUERY_CATEGORY_ACCOUNT_ = "Accounts";
var QUERY_CATEGORY_GROUP_ = "Groups";

/**
 * @public
 */
interface Query {
  title?: string,
  query?: string,
  category?: string
}

/**
 * @public
 */
interface LedgerQueries {
  ledgerId: string,
  queries: Query[]
}

namespace QueryService {

  export function loadQueries(ledgerId: string): LedgerQueries {
    var ledger = BookService.getBook(ledgerId);

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

  function filterBalanceSavedQueries_(ledger: Bkper.Book): Query[] {
    return ledger.getSavedQueries().map(query => {return {...query, category: QUERY_CATEGORY_SAVED_}}).sort(queryComparator_);
  }

  function createAccountQueries_(ledger: Bkper.Book): Query[] {
    return ledger.getAccounts().filter(account => account.isActive()).map(account => {
      return {
        title: account.getName(),
        query: `account:'${account.getName()}'`,
        category: QUERY_CATEGORY_ACCOUNT_
      }
    }).sort(queryComparator_);
  }
  
  function createGroupQueries_(ledger: Bkper.Book): Query[] {
    return ledger.getGroups().filter(group => group.hasAccounts()).map(group => {
      return {
        title: group.getName(),
        query: `group:'${group.getName()}'`,
        category: QUERY_CATEGORY_GROUP_
      }
    }).sort(queryComparator_);
  }
  
  function queryComparator_(query1: Query, query2: Query) {
    if ( query1.title < query2.title)
      return -1;
    if ( query1.title > query2.title)
      return 1;
    return 0;
  }

};
