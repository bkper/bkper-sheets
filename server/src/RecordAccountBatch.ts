class RecordAccountBatch {

    private book: Bkper.Book;

    private newAccounts: BatchNewAccount[] = [];
    private existingAccounts: BatchExistingAccount[] = [];

    private groupNames: string[] = [];

    // Account types map - [rowIndex]: accountType
    private accountTypesMap: { [rowIndex: string]: string } = {};

    constructor(book: Bkper.Book) {
        this.book = book;
    }

    getBook() {
        return this.book;
    }

    pushNewAccount(account: BatchNewAccount) {
        this.newAccounts.push(account);
    }

    pushExistingAccount(account: BatchExistingAccount) {
        this.existingAccounts.push(account);
    }

    pushGroupName(groupName: string) {
        if (this.groupNames.indexOf(groupName) < 0) {
            this.groupNames.push(groupName);
        }
    }

    addToAccountTypesMap(rowIndex: string, accountType: string) {
        if (!this.accountTypesMap[rowIndex]) {
            this.accountTypesMap[rowIndex] = accountType;
        }
    }

    getAccountTypesMap() {
        return this.accountTypesMap;
    }

    private createNewGroups() {
        let newGroups: Bkper.Group[] = [];
        for (const groupName of this.groupNames) {
            if (!groupName) {
                continue;
            }
            const group = this.book.getGroup(groupName);
            if (!group) {
                newGroups.push(this.book.newGroup().setName(groupName));
            }
        }
        if (newGroups.length > 0) {
            this.book.batchCreateGroups(newGroups);
        }
    }

    private createNewAccounts() {
        let newAccounts: Bkper.Account[] = [];
        for (const newAccount of this.newAccounts) {
            newAccounts.push(newAccount.build());
        }
        if (newAccounts.length > 0) {
            this.book.batchCreateAccounts(newAccounts);
        }
    }

    private updateExistingAccounts() {
        for (const existingAccount of this.existingAccounts) {
            existingAccount.update();
        }
    }

    record() {
        // Make sure new groups are created first
        this.createNewGroups();
        // Create new accounts
        this.createNewAccounts();
        // Update existing accounts
        this.updateExistingAccounts();
    }

}

class BatchExistingAccount {

    private book: Bkper.Book;
    private account: Bkper.Account;
    private groupNames: string[];
    private properties: { [key: string]: string };

    constructor(book: Bkper.Book, account: Bkper.Account, groupNames: string[], properties: { [key: string]: string }) {
        this.book = book;
        this.account = account;
        this.groupNames = groupNames;
        this.properties = properties;
    }

    private getGroups(): Bkper.Group[] {
        let groups: Bkper.Group[] = [];
        for (const groupName of this.groupNames) {
            if (!groupName) {
                continue;
            }
            const group = this.book.getGroup(groupName);
            if (group) {
                groups.push(group);
            }
        }
        return groups;
    }

    private shouldAddProperty(currentProperties: { [key: string]: string }, key: string, value: string): boolean {
        return (!currentProperties[key] && value) || (currentProperties[key] && currentProperties[key] !== value) ? true : false;
    }

    update(): Bkper.Account {
        let currentProperties = this.account.getProperties();
        let currentGroupNames = this.account.getGroups().map(g => g.getName());
        let needToUpdate = false;
        for (const key of Object.keys(this.properties)) {
            const value = this.properties[key];
            if (this.shouldAddProperty(currentProperties, key, value)) {
                this.account.setProperty(key, value);
                needToUpdate = true;
            }
        }
        for (const group of this.getGroups()) {
            if (currentGroupNames.indexOf(group.getName()) < 0) {
                this.account.addGroup(group);
                needToUpdate = true;
            }
        }
        return needToUpdate ? this.account.update() : this.account;
    }

}

class BatchNewAccount {

    private book: Bkper.Book;
    private account: Bkper.Account;
    private groupNames: string[];
    private properties: { [key: string]: string };

    constructor(book: Bkper.Book, account: Bkper.Account, groupNames: string[], properties: { [key: string]: string }) {
        this.book = book;
        this.account = account;
        this.groupNames = groupNames;
        this.properties = properties;
    }

    private getGroups(): Bkper.Group[] {
        let groups: Bkper.Group[] = [];
        for (const groupName of this.groupNames) {
            if (!groupName) {
                continue;
            }
            const group = this.book.getGroup(groupName);
            if (group) {
                groups.push(group);
            }
        }
        return groups;
    }

    build(): Bkper.Account {
        return this.account.setGroups(this.getGroups()).setProperties(this.properties);
    }

}
