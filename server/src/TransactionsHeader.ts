class TransactionsHeader {

  private range: GoogleAppsScript.Spreadsheet.Range;

  private valid = false;

  private columns: TransactionsHeaderColumn[];
  private rowNum: number;

  private bookIdHeaderColumn: TransactionsHeaderColumn;

  constructor(range: GoogleAppsScript.Spreadsheet.Range) {
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
        const header = new TransactionsHeaderColumn(headerValues[i][j], j);
        this.columns.push(header)
        if (header.isBookId()) {
          this.bookIdHeaderColumn = header;
        }
      }
    }
    if (frozenRows > 0) {
      this.valid = true;
    }
  }

  getBookIdHeaderColumn(): TransactionsHeaderColumn {
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

  getColumns(): TransactionsHeaderColumn[] {
    return this.columns;
  }
}

class TransactionsHeaderColumn {

  private name: any;
  private group: Bkper.Group;
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

  getGroup(): Bkper.Group {
    return this.group;
  }

  isDate(): boolean {
    return this.isValid() && this.name.trim().toLowerCase() == 'date';
  }

  isDescription(): boolean {
    return this.isValid() && this.name.trim().toLowerCase() == 'description';
  }

  isAmount(): boolean {
    return this.isValid() && this.name.trim().toLowerCase() == 'amount';
  }
  
  isAttachment(): boolean {
    return this.isValid() && this.name.trim().toLowerCase() == 'attachment';
  }

  isBookId(): boolean {
    return this.isValid() && this.name.trim().toLowerCase() == 'bookid';
  }

  isCreditAccount(): boolean {
    if (!this.isValid()) {
      return false;
    }
    const nameLower = this.name.trim().toLowerCase();
    return nameLower == 'credit account' || nameLower == 'origin' || nameLower == 'from';
  }

  isDebitAccount(): boolean {
    if (!this.isValid()) {
      return false;
    }    
    const nameLower = this.name.trim().toLowerCase();
    return nameLower == 'debit account' || nameLower == 'destination' || nameLower == 'to'; 
  }

  isProperty(): boolean {
    return this.isValid() 
      && !this.getGroup()
      && !this.isDate()
      && !this.isDescription()
      && !this.isAmount()
      && !this.isAttachment()
      && !this.isBookId()
      && !this.isCreditAccount()
      && !this.isDebitAccount()
      ;
  }
}