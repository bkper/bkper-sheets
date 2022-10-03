class RecordAccountBatch {

    private book: Bkper.Book;
    private accounts: Bkper.Account[] = [];

    // Account types map - [rowIndex]: accountType
    private accountTypesMap: { [rowIndex: string]: string } = {};

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

    addToAccountTypesMap(rowIndex: string, accountType: string) {
        if (!this.accountTypesMap[rowIndex]) {
            this.accountTypesMap[rowIndex] = accountType;
        }
    }

    getAccountTypesMap() {
        return this.accountTypesMap;
    }

}
