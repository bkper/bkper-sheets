var RECORD_BACKGROUND_ = '#b0ddbc';
var ERROR_BACKGROUND_ = '#ea9999';

namespace RecordTransactionsService {
    interface PreparedTransactionRow_ {
        row: any[];
        rowIndex: number;
        batch: RecordTransactionBatch;
        transactionId: string | null;
    }

    export function recordTransactions(
        book: Bkper.Book,
        selectedRange: GoogleAppsScript.Spreadsheet.Range,
        activeSS: GoogleAppsScript.Spreadsheet.Spreadsheet,
        highlight: boolean
    ): boolean {
        const timezone = activeSS.getSpreadsheetTimeZone();

        const success = batchSaveTransactions(
            book,
            selectedRange,
            selectedRange.getValues(),
            timezone
        );

        if (highlight && success) {
            selectedRange.setBackground(RECORD_BACKGROUND_);
        }

        return success;
    }

    export function batchSaveTransactions(
        book: Bkper.Book,
        range: GoogleAppsScript.Spreadsheet.Range,
        values: any[][],
        timezone: string
    ): boolean {
        let header = new TransactionsHeader(range);

        if (findDuplicatedRemoteIds(header, range)) {
            const htmlOutput = Utilities_.getErrorHtmlOutput(
                'There are transactions with the same ID. Please review duplicates (marked in red) and try again.'
            );
            SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Error');
            return false;
        }

        let bookIdHeaderColumn = header.getBookIdHeaderColumn();
        let transactionIdHeaderColumn = header.getTransactionIdHeaderColumn();

        // MAP: Group rows by book before retrieving or writing transactions.
        let transactionsBatch: { [bookId: string]: RecordTransactionBatch } = {};
        transactionsBatch[book.getId()] = new RecordTransactionBatch(book);
        const preparedRows: PreparedTransactionRow_[] = [];

        for (let rowIndex = 0; rowIndex < values.length; rowIndex++) {
            const row = values[rowIndex];
            const batch = getBatchForRow(row, book, bookIdHeaderColumn, transactionsBatch);
            preparedRows.push({
                row: row,
                rowIndex: rowIndex,
                batch: batch,
                transactionId: getTransactionIdFromRow(row, transactionIdHeaderColumn),
            });
        }

        if (findDuplicatedTransactionIds_(preparedRows, transactionIdHeaderColumn, range)) {
            showTransactionIdError_(
                'There are duplicate Transaction IDs. Please review the cells marked in red and try again.'
            );
            return false;
        }

        // Load every Book's complete update transactions before performing any writes.
        const existingTransactionsByBook: {
            [bookId: string]: { [transactionId: string]: Bkper.Transaction };
        } = {};
        for (const bookId in transactionsBatch) {
            const batch = transactionsBatch[bookId];
            const transactionIds = preparedRows
                .filter(preparedRow => preparedRow.batch === batch && preparedRow.transactionId)
                .map(preparedRow => preparedRow.transactionId as string);
            let existingTransactions: Bkper.Transaction[] = [];
            if (transactionIds.length == 0) {
                existingTransactionsByBook[bookId] = {};
                continue;
            }
            try {
                existingTransactions = batch.getBook().getTransactionsByIds(transactionIds);
            } catch (error) {
                const missingIds = parseMissingTransactionIds_(error);
                if (missingIds.length == 0) {
                    throw error;
                }
                highlightTransactionIds_(
                    preparedRows,
                    batch,
                    missingIds,
                    transactionIdHeaderColumn,
                    range
                );
                showTransactionIdError_(
                    `Transaction IDs not found: ${missingIds.join(', ')}. Please correct the cells marked in red and try again.`
                );
                return false;
            }

            const transactionsById: { [transactionId: string]: Bkper.Transaction } = {};
            for (const transaction of existingTransactions) {
                transactionsById[transaction.getId()] = transaction;
            }
            const missingIds = transactionIds.filter(id => transactionsById[id] == null);
            if (missingIds.length > 0) {
                highlightTransactionIds_(
                    preparedRows,
                    batch,
                    missingIds,
                    transactionIdHeaderColumn,
                    range
                );
                showTransactionIdError_(
                    `Transaction IDs not found: ${missingIds.join(', ')}. Please correct the cells marked in red and try again.`
                );
                return false;
            }
            existingTransactionsByBook[bookId] = transactionsById;
        }

        for (const preparedRow of preparedRows) {
            const rowBook = preparedRow.batch.getBook();
            if (preparedRow.transactionId) {
                const existingTransaction =
                    existingTransactionsByBook[rowBook.getId()][preparedRow.transactionId];
                applyRowToTransaction_(
                    existingTransaction,
                    preparedRow.row,
                    rowBook,
                    header,
                    timezone
                );
                preparedRow.batch.pushUpdate(existingTransaction);
            } else {
                preparedRow.batch.pushCreate(
                    arrayToTransaction_(preparedRow.row, rowBook, header, timezone)
                );
            }
        }

        // REDUCE: Execute batch operations for each book
        for (const key in transactionsBatch) {
            let batch = transactionsBatch[key];
            let toCreate = batch.getTransactionsToCreate();
            let toUpdate = batch.getTransactionsToUpdate();

            if (toCreate.length > 0) {
                batch.getBook().batchCreateTransactions(toCreate);
            }
            if (toUpdate.length > 0) {
                batch.getBook().batchUpdateTransactions(toUpdate);
            }
        }

        return true;
    }

    function findDuplicatedTransactionIds_(
        preparedRows: PreparedTransactionRow_[],
        transactionIdHeaderColumn: TransactionsHeaderColumn,
        range: GoogleAppsScript.Spreadsheet.Range
    ): boolean {
        if (!transactionIdHeaderColumn) {
            return false;
        }

        const firstRowById = new Map<string, PreparedTransactionRow_>();
        const duplicateRows = new Set<PreparedTransactionRow_>();
        for (const preparedRow of preparedRows) {
            if (!preparedRow.transactionId) {
                continue;
            }
            const firstRow = firstRowById.get(preparedRow.transactionId);
            if (firstRow) {
                duplicateRows.add(firstRow);
                duplicateRows.add(preparedRow);
            } else {
                firstRowById.set(preparedRow.transactionId, preparedRow);
            }
        }

        for (const duplicateRow of Array.from(duplicateRows.values())) {
            range
                .getCell(duplicateRow.rowIndex + 1, transactionIdHeaderColumn.getIndex() + 1)
                .setBackground(ERROR_BACKGROUND_);
        }
        return duplicateRows.size > 0;
    }

    function highlightTransactionIds_(
        preparedRows: PreparedTransactionRow_[],
        batch: RecordTransactionBatch,
        transactionIds: string[],
        transactionIdHeaderColumn: TransactionsHeaderColumn,
        range: GoogleAppsScript.Spreadsheet.Range
    ): void {
        if (!transactionIdHeaderColumn) {
            return;
        }
        const transactionIdSet = new Set(transactionIds);
        for (const preparedRow of preparedRows) {
            if (
                preparedRow.batch === batch &&
                preparedRow.transactionId &&
                transactionIdSet.has(preparedRow.transactionId)
            ) {
                range
                    .getCell(preparedRow.rowIndex + 1, transactionIdHeaderColumn.getIndex() + 1)
                    .setBackground(ERROR_BACKGROUND_);
            }
        }
    }

    function parseMissingTransactionIds_(error: unknown): string[] {
        const message = error instanceof Error ? error.message : `${error}`;
        const match = message.match(/Ids:\s*\[([^\]]*)\]/);
        if (!match) {
            return [];
        }
        return match[1]
            .split(',')
            .map(id => id.trim())
            .filter(id => id != '');
    }

    function showTransactionIdError_(message: string): void {
        const htmlOutput = Utilities_.getErrorHtmlOutput(message);
        SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Error');
    }

    function getBatchForRow(
        row: any[],
        defaultBook: Bkper.Book,
        bookIdHeaderColumn: TransactionsHeaderColumn,
        transactionsBatch: { [bookId: string]: RecordTransactionBatch }
    ): RecordTransactionBatch {
        if (!bookIdHeaderColumn) {
            return transactionsBatch[defaultBook.getId()];
        }

        let bookId = row[bookIdHeaderColumn.getIndex()];
        if (bookId != null && typeof bookId == 'string' && bookId.trim() != '') {
            if (!Utilities_.hasBookIdPrefix(bookId)) {
                throw `Selected range has invalid book id: '${bookId}'`;
            }
            let batch = transactionsBatch[bookId];
            if (batch == null) {
                let rowBook = BkperApp.getBook(bookId);
                batch = new RecordTransactionBatch(rowBook);
                transactionsBatch[bookId] = batch;
            }
            return batch;
        }

        return transactionsBatch[defaultBook.getId()];
    }

    function getTransactionIdFromRow(
        row: any[],
        transactionIdHeaderColumn: TransactionsHeaderColumn
    ): string | null {
        if (!transactionIdHeaderColumn) {
            return null;
        }

        let transactionId = row[transactionIdHeaderColumn.getIndex()];
        if (
            transactionId != null &&
            typeof transactionId == 'string' &&
            transactionId.trim() != ''
        ) {
            return transactionId.trim();
        }

        return null;
    }

    function formatValue(book: Bkper.Book, cell: any, timezone?: string) {
        if (Utilities_.isDate(cell)) {
            return book.formatDate(cell, timezone);
        } else if (!isNaN(cell)) {
            return book.formatAmount(cell);
        }
        return cell;
    }

    function formatProperty(book: Bkper.Book, cell: any, timezone?: string): string {
        if (Utilities_.isDate(cell)) {
            return book.formatDate(cell, timezone);
        }
        return `${cell}`;
    }

    function arrayToTransaction_(
        row: any[],
        book: Bkper.Book,
        header: TransactionsHeader,
        timezone?: string
    ): Bkper.Transaction {
        let transaction = book.newTransaction();
        let descriptionRow = [];
        if (header.isValid()) {
            for (const column of header.getColumns()) {
                let value = row[column.getIndex()];

                if ((value && value != '') || value === 0) {
                    if (createAccountIfNeeded(book, column, value)) {
                        descriptionRow.push(value);
                    } else if (column.isCreditAccount()) {
                        transaction.setCreditAccount(value);
                    } else if (column.isDebitAccount()) {
                        transaction.setDebitAccount(value);
                    } else if (column.isDate()) {
                        transaction.setDate(value);
                    } else if (column.isAmount()) {
                        transaction.setAmount(value);
                    } else if (column.isDescription()) {
                        transaction.setDescription(value);
                    } else if (column.isAttachment()) {
                        transaction.addUrl(value);
                    } else if (column.isProperty()) {
                        transaction.setProperty(
                            column.getName(),
                            formatProperty(book, value, timezone)
                        );
                    } else if (column.isId()) {
                        transaction.addRemoteId(value);
                    } else if (
                        column.isTransactionId() ||
                        column.isStatus() ||
                        column.isRecordedAt()
                    ) {
                        // Skip read-only columns
                    } else if (!column.isBookId()) {
                        descriptionRow.push(formatValue(book, value, timezone));
                    }
                }
            }
        } else {
            for (var j = 0; j < row.length; j++) {
                var cell = row[j];
                descriptionRow.push(formatValue(book, cell, timezone));
            }
        }

        if (transaction.getDescription() == '') {
            let descrition = descriptionRow.join(' ');
            if (descrition.trim().length > 0) {
                transaction.setDescription(descrition);
            }
        }

        return transaction;
    }

    function applyRowToTransaction_(
        transaction: Bkper.Transaction,
        row: any[],
        book: Bkper.Book,
        header: TransactionsHeader,
        timezone?: string
    ): void {
        let descriptionRow: any[] = [];

        if (header.isValid()) {
            for (const column of header.getColumns()) {
                let value = row[column.getIndex()];

                if ((value && value != '') || value === 0) {
                    if (createAccountIfNeeded(book, column, value)) {
                        descriptionRow.push(value);
                    } else if (column.isCreditAccount()) {
                        transaction.setCreditAccount(value);
                    } else if (column.isDebitAccount()) {
                        transaction.setDebitAccount(value);
                    } else if (column.isDate()) {
                        transaction.setDate(value);
                    } else if (column.isAmount()) {
                        transaction.setAmount(value);
                    } else if (column.isDescription()) {
                        transaction.setDescription(value);
                    } else if (column.isProperty()) {
                        transaction.setProperty(
                            column.getName(),
                            formatProperty(book, value, timezone)
                        );
                    } else if (column.isId()) {
                        transaction.addRemoteId(value);
                    } else if (
                        column.isTransactionId() ||
                        column.isStatus() ||
                        column.isRecordedAt() ||
                        column.isAttachment()
                    ) {
                        // Skip read-only columns
                    } else if (!column.isBookId()) {
                        descriptionRow.push(formatValue(book, value, timezone));
                    }
                }
            }
        }

        if (transaction.getDescription() == '' && descriptionRow.length > 0) {
            let description = descriptionRow.join(' ');
            if (description.trim().length > 0) {
                transaction.setDescription(description);
            }
        }
    }

    function createAccountIfNeeded(
        book: Bkper.Book,
        column: TransactionsHeaderColumn,
        value: any
    ): boolean {
        let group = book.getGroup(column.getName());
        if (group) {
            try {
                book.createAccount(value, group.getName());
            } catch (error) {
                //Ok! Maybe account already exists
                Logger.log(error);
            }
            return true;
        } else {
            return false;
        }
    }

    function findDuplicatedRemoteIds(
        header: TransactionsHeader,
        transactionsDataRange: GoogleAppsScript.Spreadsheet.Range
    ): boolean {
        const columns = header.getColumns();

        let findDuplicatedTransactionIds = false;

        // search for ID header
        for (const column of columns) {
            if (column.isId()) {
                const idColumnIndex = column.getIndex();
                const transactionsData = transactionsDataRange.getValues();
                let idsMap = new Map<string, string>();
                let errorBackgroundsSet = new Set<string>();
                // look for duplicates
                for (let i = 0; i < transactionsData.length; i++) {
                    const transactionId = `${transactionsData[i][idColumnIndex]}`.trim();
                    if (transactionId != '') {
                        const duplicatedIdRow = idsMap.get(transactionId);
                        if (duplicatedIdRow != undefined) {
                            findDuplicatedTransactionIds = true;
                            // flag both rows
                            errorBackgroundsSet.add(`${i + 1}`);
                            errorBackgroundsSet.add(`${duplicatedIdRow}`);
                        } else {
                            idsMap.set(transactionId, `${i + 1}`);
                        }
                    }
                }
                // set backgrounds
                for (const rowIndex of Array.from(errorBackgroundsSet.values())) {
                    const cell = transactionsDataRange.getCell(+rowIndex, idColumnIndex + 1);
                    if (cell.getBackground() !== RECORD_BACKGROUND_) {
                        cell.setBackground(ERROR_BACKGROUND_);
                    }
                }
            }
        }

        return findDuplicatedTransactionIds;
    }
}
