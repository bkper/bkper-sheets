var expect = require('chai').expect;

describe('RecordService', () => {
    describe('#record()', () => {
        it('should clear validation errors in one batch before saving', () => {
            const backgroundWrites: (string | null)[][][] = [];
            const range = {
                isBlank: () => false,
                getBackgrounds: () => [
                    ['#EA9999', '#ffffff'],
                    ['#123456', '#ea9999'],
                ],
                setBackgrounds: (backgrounds: (string | null)[][]) => {
                    backgroundWrites.push(backgrounds);
                },
            };
            const spreadsheet = {
                getActiveRange: () => range,
            };
            const runtime = globalThis as unknown as {
                SpreadsheetApp: {
                    getActiveSpreadsheet: () => GoogleAppsScript.Spreadsheet.Spreadsheet;
                };
            };
            const originalSpreadsheetApp = runtime.SpreadsheetApp;
            const bookService = BookService as unknown as {
                getBook: (bookId: string) => Bkper.Book;
            };
            const originalGetBook = bookService.getBook;
            const transactionService = RecordTransactionsService as unknown as {
                recordTransactions: () => boolean;
            };
            const originalRecordTransactions = transactionService.recordTransactions;
            runtime.SpreadsheetApp = {
                getActiveSpreadsheet: () =>
                    spreadsheet as unknown as GoogleAppsScript.Spreadsheet.Spreadsheet,
            };
            bookService.getBook = () => ({}) as Bkper.Book;
            transactionService.recordTransactions = () => {
                expect(backgroundWrites).to.have.length(1);
                return true;
            };

            try {
                const result = RecordService.record({
                    ledgerId: 'book-123',
                    recordType: 'transactions',
                    highlight: false,
                });

                expect(result).to.be.true;
                expect(backgroundWrites).to.deep.equal([
                    [
                        [null, '#ffffff'],
                        ['#123456', null],
                    ],
                ]);
            } finally {
                runtime.SpreadsheetApp = originalSpreadsheetApp;
                bookService.getBook = originalGetBook;
                transactionService.recordTransactions = originalRecordTransactions;
            }
        });

        it('should skip the clear write when there are no validation errors', () => {
            let backgroundWrites = 0;
            const range = {
                isBlank: () => false,
                getBackgrounds: () => [['#ffffff']],
                setBackgrounds: () => {
                    backgroundWrites++;
                },
            };
            const spreadsheet = {
                getActiveRange: () => range,
            };
            const runtime = globalThis as unknown as {
                SpreadsheetApp: {
                    getActiveSpreadsheet: () => GoogleAppsScript.Spreadsheet.Spreadsheet;
                };
            };
            const originalSpreadsheetApp = runtime.SpreadsheetApp;
            const bookService = BookService as unknown as {
                getBook: (bookId: string) => Bkper.Book;
            };
            const originalGetBook = bookService.getBook;
            const groupService = RecordGroupsService as unknown as {
                recordGroups: () => boolean;
            };
            const originalRecordGroups = groupService.recordGroups;
            runtime.SpreadsheetApp = {
                getActiveSpreadsheet: () =>
                    spreadsheet as unknown as GoogleAppsScript.Spreadsheet.Spreadsheet,
            };
            bookService.getBook = () => ({}) as Bkper.Book;
            groupService.recordGroups = () => false;

            try {
                const result = RecordService.record({
                    ledgerId: 'book-123',
                    recordType: 'groups',
                    highlight: false,
                });

                expect(result).to.be.false;
                expect(backgroundWrites).to.equal(0);
            } finally {
                runtime.SpreadsheetApp = originalSpreadsheetApp;
                bookService.getBook = originalGetBook;
                groupService.recordGroups = originalRecordGroups;
            }
        });
    });
});
