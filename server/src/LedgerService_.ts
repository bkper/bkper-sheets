var LEDGER_LAST_UPDATE_PREFIX_ = "bkper_ledger_last_update_";

namespace LedgerService_ {

  var booksCache: any;
  
  export function loadLedgers(): GoogleAppsScript.Bkper.Book[] {
    return BkperApp.getBooks();
  }

  export function loadLedger(bookId: string): GoogleAppsScript.Bkper.Book {
    if (booksCache == null) {
      booksCache = new Object();
    }
    
    var book = booksCache[bookId];
    
    if (book == null) {
      book = BkperApp.getBook(bookId);
      booksCache[bookId] = book;
    }
    
    return book;
  }

}

