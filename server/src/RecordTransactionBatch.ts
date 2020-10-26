class RecordTransactionBatch {

  private book: Bkper.Book;
  private transactions: Bkper.Transaction[] = [];

  constructor(book: Bkper.Book) {
    this.book = book;
  }

  push(transaction: Bkper.Transaction) {
    this.transactions.push(transaction);
  }

  getBook() {
    return this.book;
  }

  getTransactions() {
    return this.transactions;
  }

}