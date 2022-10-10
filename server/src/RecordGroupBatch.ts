class RecordGroupBatch {

    private book: Bkper.Book;
    private groups: BatchGroup[] = [];
    private parentNames: string[] = [];

    // Groups map - [rowIndex]: groupName
    private groupsMap: { [rowIndex: string]: string } = {};

    constructor(book: Bkper.Book) {
        this.book = book;
    }

    getBook() {
        return this.book;
    }

    pushGroup(group: BatchGroup) {
        this.groups.push(group);
    }

    pushParentName(parentName: string) {
        if (this.parentNames.indexOf(parentName) < 0) {
            this.parentNames.push(parentName);
        }
    }

    addToGroupsMap(rowIndex: string, groupName: string) {
        if (!this.groupsMap[rowIndex]) {
            this.groupsMap[rowIndex] = groupName;
        }
    }

    getGroupsMap() {
        return this.groupsMap;
    }

    private createNewParentGroups() {
        let newParentGroups: Bkper.Group[] = [];
        for (const parentName of this.parentNames) {
            if (!parentName) {
                continue;
            }
            const parentGroup = this.book.getGroup(parentName);
            if (!parentGroup) {
                newParentGroups.push(this.book.newGroup().setName(parentName));
            }
        }
        if (newParentGroups.length > 0) {
            this.book.batchCreateGroups(newParentGroups);
        }
    }

    record() {
        // Make sure new parent groups are created first
        this.createNewParentGroups();
        // Create new groups and update existing groups
        let newGroups: Bkper.Group[] = [];
        for (const group of this.groups) {
            if (group.isNew()) {
                newGroups.push(group.build());
            } else {
                group.update();
            }
        }
        this.book.batchCreateGroups(newGroups);
    }

}

class BatchGroup {

    private book: Bkper.Book;
    private groupName: string
    private parentName: string;
    private properties: { [key: string]: string };

    constructor(book: Bkper.Book, groupName: string, parentName: string, properties: { [key: string]: string }) {
        this.book = book;
        this.groupName = groupName;
        this.parentName = parentName;
        this.properties = properties;
    }

    isNew(): boolean {
        return this.book.getGroup(this.groupName) ? false : true;
    }

    private shouldAddProperty(currentProperties: { [key: string]: string }, key: string, value: string): boolean {
        return (!currentProperties[key] && value) || (currentProperties[key] && currentProperties[key] !== value) ? true : false;
    }

    update(): Bkper.Group | null {
        const group = this.book.getGroup(this.groupName);
        if (group) {
            let currentProperties = group.getProperties();
            let currentParent = group.getParent();
            let needToUpdate = false;
            for (const key of Object.keys(this.properties)) {
                const value = this.properties[key];
                if (this.shouldAddProperty(currentProperties, key, value)) {
                    group.setProperty(key, value);
                    needToUpdate = true;
                }
            }
            if (!currentParent || (currentParent && currentParent.getName() !== this.parentName)) {
                const parentGroup = this.book.getGroup(this.parentName);
                if (parentGroup) {
                    group.setParent(parentGroup);
                    needToUpdate = true;
                }
            }
            return needToUpdate ? group.update() : group;
        }
        return null;
    }

    build(): Bkper.Group | null {
        const group = this.book.getGroup(this.groupName);
        if (!group) {
            let newGroup = this.book.newGroup().setName(this.groupName);
            const parentGroup = this.book.getGroup(this.parentName);
            if (!parentGroup) {
                return newGroup.setProperties(this.properties);
            }
            return newGroup.setParent(parentGroup).setProperties(this.properties);
        }
        return null;
    }

}
