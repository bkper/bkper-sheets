class RecordGroupBatch {

    private book: Bkper.Book;
    private groups: Bkper.Group[] = [];

    // Parent groups map - [groupName]: parentName
    private parentGroupsMap: { [groupName: string]: string } = {};

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

    addToParentGroupsMap(groupName: string, parentName: string) {
        if (!this.parentGroupsMap[groupName]) {
            this.parentGroupsMap[groupName] = parentName;
        }
    }

    getParentGroupsMap() {
        return this.parentGroupsMap;
    }

}
