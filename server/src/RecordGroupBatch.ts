class RecordGroupBatch {

    private book: Bkper.Book;
    private groups: Bkper.Group[] = [];

    constructor(book: Bkper.Book) {
        this.book = book;
    }

    push(group: Bkper.Group) {
        this.groups.push(group);
    }

    getBook() {
        return this.book;
    }

    getGroups() {
        return this.groups;
    }

}
