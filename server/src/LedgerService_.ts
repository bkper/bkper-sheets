var LEDGER_LAST_UPDATE_PREFIX_ = "bkper_ledger_last_update_";

namespace LedgerService_ {

  var booksCache: any;
  
  export function loadBooks(): bkper.Book[] {
    return BkperApp.getBooks();
  }

  export function loadBook(bookId: string): bkper.Book {
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

