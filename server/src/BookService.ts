var LEDGER_LAST_UPDATE_PREFIX_ = "bkper_ledger_last_update_";

namespace BookService {

    var booksCache: any;

    export function loadBooks(): Bkper.Book[] {
        Authorizer.initAuth();
        let books = BkperApp.getBooks();
        if (books == null) {
            books = [];
        }
        return books;
    }

    export function getBook(bookId: string): Bkper.Book {
        Authorizer.initAuth();
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

