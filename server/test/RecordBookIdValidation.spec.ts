var expect = require('chai').expect;

interface ValidationDialogMock_ {
    getMessage(): string;
    restore(): void;
}

function installValidationDialogMock_(): ValidationDialogMock_ {
    let message = '';
    const utilities = Utilities_ as unknown as {
        getErrorHtmlOutput: (message: string) => GoogleAppsScript.HTML.HtmlOutput;
    };
    const originalGetErrorHtmlOutput = utilities.getErrorHtmlOutput;
    utilities.getErrorHtmlOutput = (errorMessage: string) => {
        message = errorMessage;
        return {} as GoogleAppsScript.HTML.HtmlOutput;
    };

    const runtime = globalThis as unknown as {
        SpreadsheetApp: {
            getUi: () => { showModalDialog: () => void };
        };
    };
    const originalSpreadsheetApp = runtime.SpreadsheetApp;
    runtime.SpreadsheetApp = {
        getUi: () => ({ showModalDialog: () => {} }),
    };

    return {
        getMessage: () => message,
        restore: () => {
            utilities.getErrorHtmlOutput = originalGetErrorHtmlOutput;
            runtime.SpreadsheetApp = originalSpreadsheetApp;
        },
    };
}

describe('Book ID validation', () => {
    it('should reject and highlight an invalid Book ID when recording accounts', () => {
        const backgroundWrites: (string | null)[][][] = [];
        let writes = 0;
        const dialog = installValidationDialogMock_();
        const book = {
            getId: () => 'agtzfmJrcGVyLWhyZHI-default',
            getAccount: (): null => {
                writes++;
                return null;
            },
        };
        const range = {
            getSheet: () => ({
                getFrozenRows: () => 1,
                getSheetValues: () => [['Name', 'BookId']],
            }),
            getColumn: () => 1,
            getNumColumns: () => 2,
            getValues: () => [['Checking', 123]],
            getBackgrounds: () => [['#ffffff', '#ffffff']],
            setBackgrounds: (backgrounds: (string | null)[][]) => {
                backgroundWrites.push(backgrounds);
            },
        };
        const spreadsheet = {
            getSpreadsheetTimeZone: () => 'UTC',
        };

        try {
            const result = RecordAccountsService.recordAccounts(
                book as unknown as Bkper.Book,
                range as unknown as GoogleAppsScript.Spreadsheet.Range,
                spreadsheet as unknown as GoogleAppsScript.Spreadsheet.Spreadsheet,
                false
            );

            expect(result).to.be.false;
            expect(writes).to.equal(0);
            expect(backgroundWrites).to.deep.equal([
                [['#ffffff', '#ea9999']],
            ]);
            expect(dialog.getMessage()).to.contain('123');
        } finally {
            dialog.restore();
        }
    });

    it('should reject and highlight an invalid Book ID when recording groups', () => {
        const backgroundWrites: (string | null)[][][] = [];
        let writes = 0;
        const dialog = installValidationDialogMock_();
        const book = {
            getId: () => 'agtzfmJrcGVyLWhyZHI-default',
            getGroup: (): null => {
                writes++;
                return null;
            },
        };
        const range = {
            getSheet: () => ({
                getFrozenRows: () => 1,
                getSheetValues: () => [['Name', 'BookId']],
            }),
            getColumn: () => 1,
            getNumColumns: () => 2,
            getValues: () => [['Operations', false]],
            getBackgrounds: () => [['#ffffff', '#ffffff']],
            setBackgrounds: (backgrounds: (string | null)[][]) => {
                backgroundWrites.push(backgrounds);
            },
        };
        const spreadsheet = {
            getSpreadsheetTimeZone: () => 'UTC',
        };

        try {
            const result = RecordGroupsService.recordGroups(
                book as unknown as Bkper.Book,
                range as unknown as GoogleAppsScript.Spreadsheet.Range,
                spreadsheet as unknown as GoogleAppsScript.Spreadsheet.Spreadsheet,
                false
            );

            expect(result).to.be.false;
            expect(writes).to.equal(0);
            expect(backgroundWrites).to.deep.equal([
                [['#ffffff', '#ea9999']],
            ]);
            expect(dialog.getMessage()).to.contain('false');
        } finally {
            dialog.restore();
        }
    });
});
