var BOOK_ID_ERROR_BACKGROUND_ = '#ea9999';

namespace BookIdValidationService {
    export interface HeaderColumn {
        getIndex(): number;
    }

    export interface Result {
        valid: boolean;
        booksById: { [bookId: string]: Bkper.Book };
    }

    export function validate(
        defaultBook: Bkper.Book,
        range: GoogleAppsScript.Spreadsheet.Range,
        values: any[][],
        bookIdHeaderColumn: HeaderColumn,
        startAt: number = 0
    ): Result {
        const booksById: { [bookId: string]: Bkper.Book } = {};
        booksById[defaultBook.getId()] = defaultBook;

        if (!bookIdHeaderColumn) {
            return { valid: true, booksById: booksById };
        }

        const rowsByBookId = new Map<string, number[]>();
        for (let rowIndex = startAt; rowIndex < values.length; rowIndex++) {
            const bookId = normalize(values[rowIndex][bookIdHeaderColumn.getIndex()]);
            if (bookId == '') {
                continue;
            }
            const rows = rowsByBookId.get(bookId) || [];
            rows.push(rowIndex);
            rowsByBookId.set(bookId, rows);
        }

        const invalidBookIds: string[] = [];
        for (const bookId of Array.from(rowsByBookId.keys())) {
            if (bookId == defaultBook.getId()) {
                continue;
            }
            if (!Utilities_.hasBookIdPrefix(bookId)) {
                invalidBookIds.push(bookId);
                continue;
            }
            try {
                const book = BkperApp.getBook(bookId);
                book.getName();
                booksById[bookId] = book;
            } catch (error) {
                invalidBookIds.push(bookId);
            }
        }

        if (invalidBookIds.length == 0) {
            return { valid: true, booksById: booksById };
        }

        for (const bookId of invalidBookIds) {
            const rows = rowsByBookId.get(bookId) || [];
            for (const rowIndex of rows) {
                range
                    .getCell(rowIndex + 1, bookIdHeaderColumn.getIndex() + 1)
                    .setBackground(BOOK_ID_ERROR_BACKGROUND_);
            }
        }

        const escapedBookIds = invalidBookIds.map(bookId => escapeHtml_(bookId));
        const htmlOutput = Utilities_.getErrorHtmlOutput(
            `Invalid or inaccessible Book IDs: ${escapedBookIds.join(', ')}. Please correct the cells marked in red and try again.`
        );
        SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Error');
        return { valid: false, booksById: booksById };
    }

    export function normalize(value: any): string {
        return value == null ? '' : `${value}`.trim();
    }

    function escapeHtml_(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
