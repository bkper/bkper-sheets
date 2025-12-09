var expect = require('chai').expect;

describe('RecordTransactionsService', () => {

  describe('#batchSaveTransactions()', () => {

    it('should separate rows with Transaction ID for update from rows without for create', () => {
      // Given
      const createdTransactions: any[] = [];
      const updatedTransactions: any[] = [];
      const fetchedTransactionIds: string[] = [];

      const mockTransaction = (id?: string) => {
        const tx: any = {
          _id: id,
          _creditAccount: '',
          _debitAccount: '',
          _date: '',
          _amount: 0,
          _description: '',
          _properties: {} as { [key: string]: string },
          _remoteIds: [] as string[],
          _urls: [] as string[],
          getId: function() { return this._id; },
          setCreditAccount: function(v: string) { this._creditAccount = v; return this; },
          setDebitAccount: function(v: string) { this._debitAccount = v; return this; },
          setDate: function(v: any) { this._date = v; return this; },
          setAmount: function(v: number) { this._amount = v; return this; },
          setDescription: function(v: string) { this._description = v; return this; },
          getDescription: function() { return this._description; },
          setProperty: function(k: string, v: string) { this._properties[k] = v; return this; },
          addRemoteId: function(v: string) { this._remoteIds.push(v); return this; },
          addUrl: function(v: string) { this._urls.push(v); return this; },
        };
        return tx;
      };

      const mockBook: any = {
        getId: () => 'book-123',
        newTransaction: () => mockTransaction(),
        getTransaction: (id: string) => {
          fetchedTransactionIds.push(id);
          return mockTransaction(id);
        },
        batchCreateTransactions: (txs: any[]) => {
          createdTransactions.push(...txs);
        },
        batchUpdateTransactions: (txs: any[]) => {
          updatedTransactions.push(...txs);
        },
        formatDate: (d: any) => d,
        formatAmount: (a: any) => a,
        getGroup: (): any => null,
      };

      const mockSheet: any = {
        getFrozenRows: () => 1,
        getSheetValues: () => [['Date', 'Description', 'Amount', 'Credit Account', 'Debit Account', 'Transaction ID']],
      };

      const mockRange: any = {
        getSheet: () => mockSheet,
        getColumn: () => 1,
        getNumColumns: () => 6,
        getCell: () => ({ getBackground: () => '#ffffff', setBackground: () => {} }),
        getValues: () => [
          ['2024-01-01', 'New Transaction 1', 100, 'Bank', 'Expenses', ''],
          ['2024-01-02', 'Update Transaction', 200, 'Bank', 'Expenses', 'tx-existing-1'],
          ['2024-01-03', 'New Transaction 2', 300, 'Bank', 'Expenses', ''],
          ['2024-01-04', 'Update Transaction 2', 400, 'Bank', 'Expenses', 'tx-existing-2'],
        ],
      };

      const values = mockRange.getValues();

      // When
      const result = RecordTransactionsService.batchSaveTransactions(mockBook, mockRange, values, 'UTC');

      // Then
      expect(result).to.be.true;
      expect(createdTransactions.length).to.equal(2);
      expect(updatedTransactions.length).to.equal(2);
      expect(fetchedTransactionIds).to.eql(['tx-existing-1', 'tx-existing-2']);
    });

    it('should call only batchCreateTransactions when no Transaction ID column exists', () => {
      // Given
      const createdTransactions: any[] = [];
      const updatedTransactions: any[] = [];

      const mockTransaction = () => {
        const tx: any = {
          _description: '',
          setCreditAccount: function() { return this; },
          setDebitAccount: function() { return this; },
          setDate: function() { return this; },
          setAmount: function() { return this; },
          setDescription: function(v: string) { this._description = v; return this; },
          getDescription: function() { return this._description; },
          setProperty: function() { return this; },
          addRemoteId: function() { return this; },
          addUrl: function() { return this; },
        };
        return tx;
      };

      const mockBook: any = {
        getId: () => 'book-123',
        newTransaction: () => mockTransaction(),
        getTransaction: () => mockTransaction(),
        batchCreateTransactions: (txs: any[]) => {
          createdTransactions.push(...txs);
        },
        batchUpdateTransactions: (txs: any[]) => {
          updatedTransactions.push(...txs);
        },
        formatDate: (d: any) => d,
        formatAmount: (a: any) => a,
        getGroup: (): any => null,
      };

      const mockSheet: any = {
        getFrozenRows: () => 1,
        getSheetValues: () => [['Date', 'Description', 'Amount', 'Credit Account', 'Debit Account']],
      };

      const mockRange: any = {
        getSheet: () => mockSheet,
        getColumn: () => 1,
        getNumColumns: () => 5,
        getCell: () => ({ getBackground: () => '#ffffff', setBackground: () => {} }),
        getValues: () => [
          ['2024-01-01', 'Transaction 1', 100, 'Bank', 'Expenses'],
          ['2024-01-02', 'Transaction 2', 200, 'Bank', 'Expenses'],
        ],
      };

      const values = mockRange.getValues();

      // When
      const result = RecordTransactionsService.batchSaveTransactions(mockBook, mockRange, values, 'UTC');

      // Then
      expect(result).to.be.true;
      expect(createdTransactions.length).to.equal(2);
      expect(updatedTransactions.length).to.equal(0);
    });

    it('should apply row values to existing transaction when updating', () => {
      // Given
      let updatedTransaction: any = null;

      const mockTransaction = (id?: string) => {
        const tx: any = {
          _id: id,
          _creditAccount: 'OldCredit',
          _debitAccount: 'OldDebit',
          _date: '2023-01-01',
          _amount: 50,
          _description: 'Old Description',
          _properties: {} as { [key: string]: string },
          _remoteIds: [] as string[],
          _urls: [] as string[],
          getId: function() { return this._id; },
          setCreditAccount: function(v: string) { this._creditAccount = v; return this; },
          setDebitAccount: function(v: string) { this._debitAccount = v; return this; },
          setDate: function(v: any) { this._date = v; return this; },
          setAmount: function(v: number) { this._amount = v; return this; },
          setDescription: function(v: string) { this._description = v; return this; },
          getDescription: function() { return this._description; },
          setProperty: function(k: string, v: string) { this._properties[k] = v; return this; },
          addRemoteId: function(v: string) { this._remoteIds.push(v); return this; },
          addUrl: function(v: string) { this._urls.push(v); return this; },
        };
        return tx;
      };

      const existingTx = mockTransaction('tx-123');

      const mockBook: any = {
        getId: () => 'book-123',
        newTransaction: () => mockTransaction(),
        getTransaction: () => existingTx,
        batchCreateTransactions: () => {},
        batchUpdateTransactions: (txs: any[]) => {
          updatedTransaction = txs[0];
        },
        formatDate: (d: any) => d,
        formatAmount: (a: any) => a,
        getGroup: (): any => null,
      };

      const mockSheet: any = {
        getFrozenRows: () => 1,
        getSheetValues: () => [['Date', 'Description', 'Amount', 'Credit Account', 'Debit Account', 'Transaction ID']],
      };

      const mockRange: any = {
        getSheet: () => mockSheet,
        getColumn: () => 1,
        getNumColumns: () => 6,
        getCell: () => ({ getBackground: () => '#ffffff', setBackground: () => {} }),
        getValues: () => [
          ['2024-06-15', 'Updated Description', 999, 'NewCredit', 'NewDebit', 'tx-123'],
        ],
      };

      const values = mockRange.getValues();

      // When
      const result = RecordTransactionsService.batchSaveTransactions(mockBook, mockRange, values, 'UTC');

      // Then
      expect(result).to.be.true;
      expect(updatedTransaction).to.not.be.null;
      expect(updatedTransaction._description).to.equal('Updated Description');
      expect(updatedTransaction._amount).to.equal(999);
      expect(updatedTransaction._creditAccount).to.equal('NewCredit');
      expect(updatedTransaction._debitAccount).to.equal('NewDebit');
      expect(updatedTransaction._date).to.equal('2024-06-15');
    });

    it('should skip balance column and not save it as a property when updating', () => {
      // Given
      let updatedTransaction: any = null;

      const mockTransaction = (id?: string) => {
        const tx: any = {
          _id: id,
          _creditAccount: '',
          _debitAccount: '',
          _date: '',
          _amount: 0,
          _description: '',
          _properties: {} as { [key: string]: string },
          _remoteIds: [] as string[],
          getId: function() { return this._id; },
          setCreditAccount: function(v: string) { this._creditAccount = v; return this; },
          setDebitAccount: function(v: string) { this._debitAccount = v; return this; },
          setDate: function(v: any) { this._date = v; return this; },
          setAmount: function(v: number) { this._amount = v; return this; },
          setDescription: function(v: string) { this._description = v; return this; },
          getDescription: function() { return this._description; },
          setProperty: function(k: string, v: string) { this._properties[k] = v; return this; },
          addRemoteId: function(v: string) { this._remoteIds.push(v); return this; },
        };
        return tx;
      };

      const existingTx = mockTransaction('tx-123');

      const mockBook: any = {
        getId: () => 'book-123',
        newTransaction: () => mockTransaction(),
        getTransaction: () => existingTx,
        batchCreateTransactions: () => {},
        batchUpdateTransactions: (txs: any[]) => {
          updatedTransaction = txs[0];
        },
        formatDate: (d: any) => d,
        formatAmount: (a: any) => a,
        getGroup: (): any => null,
      };

      const mockSheet: any = {
        getFrozenRows: () => 1,
        getSheetValues: () => [['Date', 'Description', 'Amount', 'Credit Account', 'Debit Account', 'Balance', 'Transaction ID']],
      };

      const mockRange: any = {
        getSheet: () => mockSheet,
        getColumn: () => 1,
        getNumColumns: () => 7,
        getCell: () => ({ getBackground: () => '#ffffff', setBackground: () => {} }),
        getValues: () => [
          ['2024-01-01', 'Test Transaction', 100, 'Bank', 'Expenses', 500, 'tx-123'],
        ],
      };

      const values = mockRange.getValues();

      // When
      const result = RecordTransactionsService.batchSaveTransactions(mockBook, mockRange, values, 'UTC');

      // Then
      expect(result).to.be.true;
      expect(updatedTransaction).to.not.be.null;
      expect(updatedTransaction._properties).to.not.have.property('Balance');
      expect(updatedTransaction._properties).to.not.have.property('balance');
    });

    it('should work with non-frozen headers when recognized column names exist', () => {
      // Given
      let updatedTransaction: any = null;

      const mockTransaction = (id?: string) => {
        const tx: any = {
          _id: id,
          _creditAccount: 'OldOrigin',
          _debitAccount: 'OldDestination',
          _date: '2023-01-01',
          _amount: 50,
          _description: 'Old Description',
          _properties: {} as { [key: string]: string },
          _remoteIds: [] as string[],
          _urls: [] as string[],
          getId: function() { return this._id; },
          setCreditAccount: function(v: string) { this._creditAccount = v; return this; },
          setDebitAccount: function(v: string) { this._debitAccount = v; return this; },
          setDate: function(v: any) { this._date = v; return this; },
          setAmount: function(v: number) { this._amount = v; return this; },
          setDescription: function(v: string) { this._description = v; return this; },
          getDescription: function() { return this._description; },
          setProperty: function(k: string, v: string) { this._properties[k] = v; return this; },
          addRemoteId: function(v: string) { this._remoteIds.push(v); return this; },
          addUrl: function(v: string) { this._urls.push(v); return this; },
        };
        return tx;
      };

      const existingTx = mockTransaction('tx-456');

      const mockBook: any = {
        getId: () => 'book-123',
        newTransaction: () => mockTransaction(),
        getTransaction: () => existingTx,
        batchCreateTransactions: () => {},
        batchUpdateTransactions: (txs: any[]) => {
          updatedTransaction = txs[0];
        },
        formatDate: (d: any) => d,
        formatAmount: (a: any) => a,
        getGroup: (): any => null,
      };

      // Non-frozen header (getFrozenRows returns 0)
      const mockSheet: any = {
        getFrozenRows: () => 0,
        getSheetValues: () => [['Date', 'Description', 'Amount', 'Origin', 'Destination', 'Transaction ID']],
      };

      const mockRange: any = {
        getSheet: () => mockSheet,
        getColumn: () => 1,
        getNumColumns: () => 6,
        getCell: () => ({ getBackground: () => '#ffffff', setBackground: () => {} }),
        getValues: () => [
          ['2024-07-20', 'Updated via non-frozen header', 500, 'NewOrigin', 'NewDestination', 'tx-456'],
        ],
      };

      const values = mockRange.getValues();

      // When
      const result = RecordTransactionsService.batchSaveTransactions(mockBook, mockRange, values, 'UTC');

      // Then
      expect(result).to.be.true;
      expect(updatedTransaction).to.not.be.null;
      expect(updatedTransaction._description).to.equal('Updated via non-frozen header');
      expect(updatedTransaction._amount).to.equal(500);
      expect(updatedTransaction._creditAccount).to.equal('NewOrigin');
      expect(updatedTransaction._debitAccount).to.equal('NewDestination');
      expect(updatedTransaction._date).to.equal('2024-07-20');
    });

  });

});
