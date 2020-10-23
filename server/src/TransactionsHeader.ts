class TransactionsHeader {

  private book: Bkper.Book;
  private range: GoogleAppsScript.Spreadsheet.Range;

  private valid = false;

  private columns: TransactionsHeaderColumn[];
  private rowNum: number;

  constructor(book: Bkper.Book, range: GoogleAppsScript.Spreadsheet.Range) {
    this.book = book;
    this.range = range;
    this.parse();
  }

  private parse() {
    var frozenRows = this.range.getSheet().getFrozenRows();
    this.rowNum = frozenRows > 0 ? frozenRows : 1;
    var headerValues = this.range.getSheet().getSheetValues(1, this.range.getColumn(), this.rowNum, this.range.getNumColumns());
    this.columns = [];
    for (var i = 0; i < headerValues.length; i++) {
      for (var j = 0; j < headerValues[i].length; j++) {
        this.columns.push(new TransactionsHeaderColumn(this.book, headerValues[i][j], j))
      }
    }
    if (frozenRows > 0) {
      this.valid = true;
    } else {
      for (const column of this.columns) {
        if (column.getGroup() || column.isDate() || column.isDescription() || column.isAttachment() || column.isCreditAccount() || column.isDebitAccount()) {
          this.valid = true;
          break
        }
      }
    }
  }

  getBook(): Bkper.Book {
    return this.book;
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

  getColumns(): TransactionsHeaderColumn[] {
    return this.columns;
  }
}

class TransactionsHeaderColumn {

  private book: Bkper.Book;
  private name: any;
  private group: Bkper.Group;
  private index: number;

  constructor(book: Bkper.Book, name: any, index: number) {
    this.book = book;
    this.name = name;
    this.index = index;
    this.group = this.book.getGroup(this.name);
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

  getGroup(): Bkper.Group {
    return this.group;
  }

  isDate(): boolean {
    return this.isValid() && this.name.toLowerCase() == 'date';
  }

  isDescription(): boolean {
    return this.isValid() && this.name.toLowerCase() == 'description';
  }

  isAmount(): boolean {
    return this.isValid() && this.name.toLowerCase() == 'amount';
  }
  
  isAttachment(): boolean {
    return this.isValid() && this.name.toLowerCase() == 'attachment';

  }

  isCreditAccount(): boolean {
    const nameLower = this.name.toLowerCase();
    return this.isValid() && (nameLower == 'credit account' || nameLower == 'origin' || nameLower == 'from');
  }

  isDebitAccount(): boolean {
    const nameLower = this.name.toLowerCase();
    return this.isValid() && (nameLower == 'debit account' || nameLower == 'destination' || nameLower == 'to') 
  }

  isProperty(): boolean {
    return this.isValid() 
      && !this.getGroup()
      && !this.isDate()
      && !this.isDescription()
      && !this.isAmount()
      && !this.isAttachment()
      && !this.isCreditAccount()
      && !this.isDebitAccount()
      ;
  }
}