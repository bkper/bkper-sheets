class RecordTransactionBatch {

  private book: Bkper.Book;
  private transactionsToCreate: Bkper.Transaction[] = [];
  private transactionsToUpdate: Bkper.Transaction[] = [];

  constructor(book: Bkper.Book) {
    this.book = book;
  }

  pushCreate(transaction: Bkper.Transaction) {
    this.transactionsToCreate.push(transaction);
  }

  pushUpdate(transaction: Bkper.Transaction) {
    this.transactionsToUpdate.push(transaction);
  }

  getBook() {
    return this.book;
  }

  getTransactionsToCreate() {
    return this.transactionsToCreate;
  }

  getTransactionsToUpdate() {
    return this.transactionsToUpdate;
  }

}