class RecordAccountBatch {

    private book: Bkper.Book;

    private newAccounts: NewAccount[] = [];
    private existingAccounts: ExistingAccount[] = [];

    private groupNames: string[] = [];

    // Account types map - [rowIndex]: accountType
    private accountTypesMap: { [rowIndex: string]: string } = {};

    constructor(book: Bkper.Book) {
        this.book = book;
    }

    getBook() {
        return this.book;
    }

    pushNewAccount(account: NewAccount) {
        this.newAccounts.push(account);
    }

    pushExistingAccount(account: ExistingAccount) {
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

    createNewGroups() {
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

    createNewAccounts() {
        let newAccounts: Bkper.Account[] = [];
        for (const newAccount of this.newAccounts) {
            newAccounts.push(newAccount.build());
        }
        if (newAccounts.length > 0) {
            this.book.batchCreateAccounts(newAccounts);
        }
    }

    editExistingAccounts() {
        for (const existingAccount of this.existingAccounts) {
            existingAccount.edit();
        }
    }

}

class ExistingAccount {

    private book: Bkper.Book;
    private account: Bkper.Account;
    private properties: { [key: string]: string };

    constructor(book: Bkper.Book, account: Bkper.Account, properties: { [key: string]: string }) {
        this.book = book;
        this.account = account;
        this.properties = properties;
    }

    public edit(): Bkper.Account {
        let currentProperties = this.account.getProperties();
        let needToUpdate = false;
        for (const key of Object.keys(this.properties)) {
            const value = this.properties[key];
            if (this.shouldAddProperty(currentProperties, key, value)) {
                this.account.setProperty(key, value);
                needToUpdate = true;
            }
        }
        if (needToUpdate) {
            this.account.update();
        }
        return this.account;
    }

    private shouldAddProperty(currentProperties: { [key: string]: string }, key: string, value: string): boolean {
        return (!currentProperties[key] && value) || (currentProperties[key] && currentProperties[key] !== value) ? true : false;
    }

}

class NewAccount {

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

    public build(): Bkper.Account {
        return this.account.setGroups(this.getGroups()).setProperties(this.properties);
    }

}
