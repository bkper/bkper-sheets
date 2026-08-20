var RECORD_BACKGROUND_ = '#b0ddbc';
var ERROR_BACKGROUND_ = '#ea9999';

namespace RecordTransactionsService {
    interface PreparedTransactionRow_ {
        row: any[];
        rowIndex: number;
        batch: RecordTransactionBatch;
        transactionId: string | null;
    }

    interface TrashedTransactionDetails_ {
        transactionId: string;
        merged: boolean;
        activeSuccessorIds: string[];
    }

    export function recordTransactions(
        book: Bkper.Book,
        selectedRange: GoogleAppsScript.Spreadsheet.Range,
        activeSS: GoogleAppsScript.Spreadsheet.Spreadsheet,
        highlight: boolean
    ): boolean {
        const timezone = activeSS.getSpreadsheetTimeZone();

        return batchSaveTransactions(
            book,
            selectedRange,
            selectedRange.getValues(),
            timezone,
            highlight
        );
    }

    export function batchSaveTransactions(
        book: Bkper.Book,
        range: GoogleAppsScript.Spreadsheet.Range,
        values: any[][],
        timezone: string,
        highlight: boolean = false
    ): boolean {
        let header = new TransactionsHeader(range);

        if (findDuplicatedRemoteIds(header, range, values)) {
            const htmlOutput = Utilities_.getErrorHtmlOutput(
                'There are transactions with the same ID. Please review duplicates (marked in red) and try again.'
            );
            SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Error');
            return false;
        }

        let bookIdHeaderColumn = header.getBookIdHeaderColumn();
        let transactionIdHeaderColumn = header.getTransactionIdHeaderColumn();
        const bookIdValidation = BookIdValidationService.validate(
            book,
            range,
            values,
            bookIdHeaderColumn
        );
        if (!bookIdValidation.valid) {
            return false;
        }

        // MAP: Group rows by book before retrieving or writing transactions.
        let transactionsBatch: { [bookId: string]: RecordTransactionBatch } = {};
        transactionsBatch[book.getId()] = new RecordTransactionBatch(book);
        const preparedRows: PreparedTransactionRow_[] = [];

        for (let rowIndex = 0; rowIndex < values.length; rowIndex++) {
            const row = values[rowIndex];
            const batch = getBatchForRow(
                row,
                book,
                bookIdHeaderColumn,
                transactionsBatch,
                bookIdValidation.booksById
            );
            preparedRows.push({
                row: row,
                rowIndex: rowIndex,
                batch: batch,
                transactionId: getTransactionIdFromRow(row, transactionIdHeaderColumn),
            });
        }

        if (findDuplicatedTransactionIds_(preparedRows, transactionIdHeaderColumn, range)) {
            showTransactionIdError_(
                'Duplicate transactions found. Please correct the Transaction ID cells marked in red and try again.'
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

            const trashedTransactions = existingTransactions.filter(transaction =>
                transaction.isTrashed()
            );
            if (trashedTransactions.length > 0) {
                const details = trashedTransactions.map(transaction =>
                    getTrashedTransactionDetails_(batch.getBook(), transaction.getId())
                );
                highlightTransactionIds_(
                    preparedRows,
                    batch,
                    details.map(detail => detail.transactionId),
                    transactionIdHeaderColumn,
                    range
                );
                showTransactionIdError_(formatTrashedTransactionError_(details));
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
        const updatedTransactionIdsByBatch = new Map<RecordTransactionBatch, Set<string>>();
        for (const key in transactionsBatch) {
            let batch = transactionsBatch[key];
            let toCreate = batch.getTransactionsToCreate();
            let toUpdate = batch.getTransactionsToUpdate();

            if (toCreate.length > 0) {
                batch.getBook().batchCreateTransactions(toCreate);
            }
            if (toUpdate.length > 0) {
                const updatedTransactions = batch.getBook().batchUpdateTransactions(toUpdate);
                if (highlight) {
                    updatedTransactionIdsByBatch.set(
                        batch,
                        new Set(updatedTransactions.map(transaction => transaction.getId()))
                    );
                }
            }
        }

        if (highlight) {
            highlightRecordedRows_(preparedRows, updatedTransactionIdsByBatch, range);
        }

        return true;
    }

    function highlightRecordedRows_(
        preparedRows: PreparedTransactionRow_[],
        updatedTransactionIdsByBatch: Map<RecordTransactionBatch, Set<string>>,
        range: GoogleAppsScript.Spreadsheet.Range
    ): void {
        const recordedRows: number[] = [];
        for (const preparedRow of preparedRows) {
            const updatedTransactionIds = updatedTransactionIdsByBatch.get(preparedRow.batch);
            if (
                preparedRow.transactionId == null ||
                (updatedTransactionIds && updatedTransactionIds.has(preparedRow.transactionId))
            ) {
                recordedRows.push(preparedRow.rowIndex);
            }
        }
        RangeHighlightService.highlightRows(range, recordedRows, RECORD_BACKGROUND_);
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

        const duplicateCells = Array.from(duplicateRows.values()).map(duplicateRow => ({
            row: duplicateRow.rowIndex,
            column: transactionIdHeaderColumn.getIndex(),
        }));
        RangeHighlightService.highlightErrors(range, duplicateCells);
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
        const invalidCells: RangeHighlightService.Cell[] = [];
        for (const preparedRow of preparedRows) {
            if (
                preparedRow.batch === batch &&
                preparedRow.transactionId &&
                transactionIdSet.has(preparedRow.transactionId)
            ) {
                invalidCells.push({
                    row: preparedRow.rowIndex,
                    column: transactionIdHeaderColumn.getIndex(),
                });
            }
        }
        RangeHighlightService.highlightErrors(range, invalidCells);
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

    function getTrashedTransactionDetails_(
        book: Bkper.Book,
        transactionId: string
    ): TrashedTransactionDetails_ {
        const activeSuccessorIds = new Set<string>();
        const visitedIds = new Set<string>([transactionId]);
        const merged = collectMergeSuccessors_(
            book,
            transactionId,
            activeSuccessorIds,
            visitedIds
        );
        return {
            transactionId: transactionId,
            merged: merged,
            activeSuccessorIds: Array.from(activeSuccessorIds.values()),
        };
    }

    function collectMergeSuccessors_(
        book: Bkper.Book,
        transactionId: string,
        activeSuccessorIds: Set<string>,
        visitedIds: Set<string>
    ): boolean {
        const remoteIdQuery = `remoteId:'merged_${transactionId}'`;
        let merged = false;

        const activeTransactions = getTransactions_(book, remoteIdQuery);
        for (const transaction of activeTransactions) {
            merged = true;
            activeSuccessorIds.add(transaction.getId());
        }

        const trashedTransactions = getTransactions_(book, `${remoteIdQuery} is:trashed`);
        for (const transaction of trashedTransactions) {
            merged = true;
            const successorId = transaction.getId();
            if (!visitedIds.has(successorId)) {
                visitedIds.add(successorId);
                if (
                    collectMergeSuccessors_(
                        book,
                        successorId,
                        activeSuccessorIds,
                        visitedIds
                    )
                ) {
                    merged = true;
                }
            }
        }
        return merged;
    }

    function getTransactions_(book: Bkper.Book, query: string): Bkper.Transaction[] {
        const iterator = book.getTransactions(query);
        const transactions: Bkper.Transaction[] = [];
        while (iterator.hasNext()) {
            transactions.push(iterator.next());
        }
        return transactions;
    }

    function formatTrashedTransactionError_(details: TrashedTransactionDetails_[]): string {
        const messages: string[] = [];
        const mergedDetails = details.filter(detail => detail.merged);
        const otherTrashedIds = details
            .filter(detail => !detail.merged)
            .map(detail => detail.transactionId);

        if (mergedDetails.length > 0) {
            const replacements = mergedDetails.map(detail => {
                if (detail.activeSuccessorIds.length == 0) {
                    return detail.transactionId;
                }
                return `${detail.transactionId} → ${detail.activeSuccessorIds.join(', ')}`;
            });
            messages.push(
                `These transactions were merged and can no longer be updated: ${replacements.join('; ')}.`
            );
        }
        if (otherTrashedIds.length > 0) {
            messages.push(
                `These transactions are trashed and can no longer be updated: ${otherTrashedIds.join(', ')}.`
            );
        }
        messages.push('Refresh or re-fetch the transactions before saving again.');
        return messages.join(' ');
    }

    function getBatchForRow(
        row: any[],
        defaultBook: Bkper.Book,
        bookIdHeaderColumn: TransactionsHeaderColumn,
        transactionsBatch: { [bookId: string]: RecordTransactionBatch },
        booksById: { [bookId: string]: Bkper.Book }
    ): RecordTransactionBatch {
        if (!bookIdHeaderColumn) {
            return transactionsBatch[defaultBook.getId()];
        }

        const bookId = BookIdValidationService.normalize(row[bookIdHeaderColumn.getIndex()]);
        if (bookId != '') {
            let batch = transactionsBatch[bookId];
            if (batch == null) {
                batch = new RecordTransactionBatch(booksById[bookId]);
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
        transactionsDataRange: GoogleAppsScript.Spreadsheet.Range,
        transactionsData: any[][]
    ): boolean {
        const columns = header.getColumns();
        const duplicateCells: RangeHighlightService.Cell[] = [];

        // search for ID header
        for (const column of columns) {
            if (column.isId()) {
                const idColumnIndex = column.getIndex();
                const idsMap = new Map<string, number>();
                const duplicateRows = new Set<number>();
                // look for duplicates
                for (let i = 0; i < transactionsData.length; i++) {
                    const transactionId = `${transactionsData[i][idColumnIndex]}`.trim();
                    if (transactionId != '') {
                        const duplicatedIdRow = idsMap.get(transactionId);
                        if (duplicatedIdRow != undefined) {
                            duplicateRows.add(i);
                            duplicateRows.add(duplicatedIdRow);
                        } else {
                            idsMap.set(transactionId, i);
                        }
                    }
                }
                for (const row of Array.from(duplicateRows.values())) {
                    duplicateCells.push({ row: row, column: idColumnIndex });
                }
            }
        }

        RangeHighlightService.highlightErrors(transactionsDataRange, duplicateCells);
        return duplicateCells.length > 0;
    }
}
