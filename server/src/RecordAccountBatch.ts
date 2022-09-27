class RecordAccountBatch {

    private book: Bkper.Book;
    private accounts: Bkper.Account[] = [];

    constructor(book: Bkper.Book) {
        this.book = book;
    }

    push(account: Bkper.Account) {
        this.accounts.push(account);
    }

    getBook() {
        return this.book;
    }

    getAccounts() {
        return this.accounts;
    }

}
