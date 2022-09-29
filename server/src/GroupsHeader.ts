class GroupsHeader {

    private range: GoogleAppsScript.Spreadsheet.Range;

    private valid = false;

    private columns: GroupsHeaderColumn[];
    private rowNum: number;

    private bookIdHeaderColumn: GroupsHeaderColumn;

    constructor(range: GoogleAppsScript.Spreadsheet.Range) {
        this.range = range;
        this.parse();
    }

    private parse() {
        let frozenRows = this.range.getSheet().getFrozenRows();
        this.rowNum = frozenRows > 0 ? frozenRows : 1;
        let headerValues = this.range.getSheet().getSheetValues(this.rowNum, this.range.getColumn(), 1, this.range.getNumColumns());
        this.columns = [];
        for (let i = 0; i < headerValues.length; i++) {
            for (let j = 0; j < headerValues[i].length; j++) {
                const header = new GroupsHeaderColumn(headerValues[i][j], j);
                this.columns.push(header);
                if (header.isBookId()) {
                    this.bookIdHeaderColumn = header;
                }
            }
        }
        if (frozenRows > 0) {
            this.valid = true;
        }
    }

    getBookIdHeaderColumn(): GroupsHeaderColumn {
        return this.bookIdHeaderColumn;
    }

    getRange(): GoogleAppsScript.Spreadsheet.Range {
        return this.range;
    }

    isValid(): boolean {
        return this.valid;
    }

    getRowNum(): number {
        return this.rowNum;
    }

    getColumns(): GroupsHeaderColumn[] {
        return this.columns;
    }

}

class GroupsHeaderColumn {

    private name: any;
    private index: number;

    constructor(name: any, index: number) {
        this.name = name;
        this.index = index;
    }

    private isValid(): boolean {
        return this.name != null && typeof this.name == "string" && this.name.trim() != '';
    }

    getName(): string {
        return this.name;
    }

    getIndex(): number {
        return this.index;
    }

    isName(): boolean {
        return this.isValid() && this.name.trim().toLowerCase() == 'name';
    }

    isType(): boolean {
        return this.isValid() && this.name.trim().toLowerCase() == 'type';
    }

    isParent(): boolean {
        return this.isValid() && this.name.trim().toLowerCase() == 'parent';
    }

    isChildren(): boolean {
        return this.isValid() && this.name.trim().toLowerCase() == 'children';
    }

    isAccounts(): boolean {
        return this.isValid() && this.name.trim().toLowerCase() == 'accounts';
    }

    isBookId(): boolean {
        return this.isValid() && this.name.trim().toLowerCase() == 'bookid';
    }

    isProperty(): boolean {
        return this.isValid() && !this.isName() && !this.isType() && !this.isParent() && !this.isChildren() && !this.isAccounts() && !this.isBookId();
    }

}
