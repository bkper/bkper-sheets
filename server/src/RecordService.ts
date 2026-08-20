var RECORD_BACKGROUND_ = '#B0DDBC';

namespace RecordService {
    export function record(recordStatement: SaveStatement): boolean {
        var activeSS = SpreadsheetApp.getActiveSpreadsheet();
        var selectedRange = activeSS.getActiveRange();
        var book = BookService.getBook(recordStatement.ledgerId);

        if (selectedRange.isBlank()) {
            Browser.msgBox('No data to record. Select a valid cell range.');
            return false;
        }

        RangeHighlightService.clearValidationErrors(selectedRange);

        let recorded = false;
        if (recordStatement.recordType == 'transactions') {
            recorded = RecordTransactionsService.recordTransactions(
                book,
                selectedRange,
                activeSS,
                recordStatement.highlight
            );
        } else if (recordStatement.recordType == 'accounts') {
            recorded = RecordAccountsService.recordAccounts(
                book,
                selectedRange,
                activeSS,
                recordStatement.highlight
            );
        } else if (recordStatement.recordType == 'groups') {
            recorded = RecordGroupsService.recordGroups(
                book,
                selectedRange,
                activeSS,
                recordStatement.highlight
            );
        }

        return recorded;
    }
}
