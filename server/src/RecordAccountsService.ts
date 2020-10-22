namespace RecordAccountsService {

  export function recordAccounts(book: Bkper.Book, selectedRange: GoogleAppsScript.Spreadsheet.Range, highlight: boolean): boolean {

    let values = selectedRange.getValues();

    let nameRowIndexMap: any = {};
    let maxLength = 0;

    let groups: Bkper.Group[] = []
    for (let i = 0; i < values.length; i++) {
      const row = values[i]
      const name = row[0] + '';
      nameRowIndexMap[name] = i;
      if (row.length >= maxLength) {
        maxLength = row.length;
      }

      if (row.length > 1) {
        for (let j = 1; j < row.length; j++) {
          const cell = row[j];
          if (!isType(cell) && !book.getGroup(cell)) {
            let group = book.newGroup().setName(cell);
            groups.push(group);
          }
        }
      }
    }

    if (groups.length > 0) {
      book.batchCreateGroups(groups);
    }

    let accounts: Bkper.Account[] = []

    for (let i = 0; i < values.length; i++) {
      const row = values[i]
      // const account: bkper.Account = {
      //   name: row[0],
      //   type: AccountType.ASSET,
      //   groups: []
      // }
      let account = book.newAccount()
      .setName(row[0])
      .setType(BkperApp.AccountType.ASSET)

      if (book.getAccount(account.getName())) {
        //Account already created. Skip.
        continue;
      }

      if (row.length > 1) {
        for (let j = 1; j < row.length; j++) {
          const cell = row[j];
          if (this.isType(cell)) {
            account.setType(cell as Bkper.AccountType);
          } else {
            let group = this.getGroup(cell);
            if (group != null) {
              account.addGroup(group);
            }
          }
        }
      }
      accounts.push(account)
    }
    
    book.batchCreateAccounts(accounts);


    if (highlight) {
      let backgrounds: any[][] = initilizeMatrix(new Array(values.length), maxLength);
      let accounts = book.getAccounts();
      for (const account of accounts) {
        const index = nameRowIndexMap[account.getName()];
        if (index != null) {
          backgrounds[index] = fill(new Array(maxLength), getTypeColor(account.getType()));
        }
      }
      selectedRange.setBackgrounds(backgrounds);
    }
    return false;
  }

  function fill(array: any[], value: string): any[] {
    for (let i = 0; i < array.length; i++) {
      array[i] = value;
    }
    return array;
  }

  function initilizeMatrix(matrix: any[], columns: number): any[] {
    for (let i = 0; i < matrix.length; i++) {
      matrix[i] = new Array(columns);
    }
    return matrix;
  }

  function getTypeColor(type: Bkper.AccountType): string {
    if (type == BkperApp.AccountType.ASSET) {
      return '#dfedf6';
    }
    if (type == BkperApp.AccountType.LIABILITY) {
      return '#fef3d8';
    }
    if (type == BkperApp.AccountType.INCOMING) {
      return '#e2f3e7';
    }
    return '#f6deda';
  }

  function isType(groupOrType: string): boolean {
    if (groupOrType == BkperApp.AccountType.ASSET) {
      return true;
    }
    if (groupOrType == BkperApp.AccountType.LIABILITY) {
      return true;
    }
    if (groupOrType == BkperApp.AccountType.INCOMING) {
      return true;
    }
    if (groupOrType == BkperApp.AccountType.OUTGOING) {
      return true;
    }
    return false;
  }

}