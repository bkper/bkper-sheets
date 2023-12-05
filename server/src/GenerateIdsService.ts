var ERROR_BACKGROUND_ = '#ea9999';

namespace GenerateIdsService {

    // Generate unique IDs for non-empty rows
    export function generate(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
        // Validate header
        const header = new TransactionsHeader(sheet.getDataRange());
        if (!header.isValid()) {
            const bkperHelpUrl = "https://help.bkper.com/en/articles/2569151-bkper-add-on-for-google-sheets#h_73cf0eaf6c";
            const errorMsg = `You must set a frozen header with an ID column. Learn more in <a target='_blank' href='${bkperHelpUrl}'>Bkper Help</a>.`;
            const htmlOutput = Utilities_.getErrorHtmlOutput(errorMsg);
            SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Error');
            return;
        }

        // Try to find ID column
        const columns = header.getColumns();
        let idColumn = 0;
        for (const column of columns) {
            if (column.isId()) {
                idColumn = column.getIndex() + 1;
            }
        }
        if (idColumn == 0) {
            const htmlOutput = Utilities_.getErrorHtmlOutput('Could not find an ID column in the header.');
            SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Error');
            return;
        }

        // Fill ID column with unique IDs
        fillIdColumn(sheet, header.getRowNum() + 1, idColumn);
    }

    function fillIdColumn(sheet: GoogleAppsScript.Spreadsheet.Sheet, headerRowNum: number, idColumn: number): void {      
        // Sheet has an ID header but seems to have no transitions
        const transactionsRange = sheet.getRange(headerRowNum, 1, sheet.getLastRow(), sheet.getLastColumn());

        if (transactionsRange.isBlank()) {
            const htmlOutput = Utilities_.getErrorHtmlOutput('Sheet appears to contain no transactions below the header.');
            SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Error');
            return;
        }
        
        const idColumnData = sheet.getRange(headerRowNum, idColumn, sheet.getLastRow(), 1).getValues();
        const idColumnBackgrounds = sheet.getRange(headerRowNum, idColumn, sheet.getLastRow(), 1).getBackgrounds();
        let idColumnNewData: any[][] = [];
        let idColumnNewBackgrounds: string[][] = [];
        for (let i = 0; i < idColumnData.length; i++) {
            const cellValue = idColumnData[i][0];
            const cellBackground = idColumnBackgrounds[i][0];
            if (cellValue) {
                idColumnNewData.push([cellValue]);
                idColumnNewBackgrounds.push([cellBackground]);
            } else {
                // Only generate ID to non-empty rows
                const emptyRow = sheet.getRange(headerRowNum + i, 1, 1, sheet.getLastColumn()).isBlank();
                if (!emptyRow) {
                    const incrementedTimestamp = new Date().getTime() + i;
                    // Data
                    idColumnNewData.push([Utilities.getUuid() + `-${incrementedTimestamp}`]);
                    // Background
                    cellBackground === ERROR_BACKGROUND_ ? idColumnNewBackgrounds.push([undefined]) : idColumnNewBackgrounds.push([cellBackground]);
                } else {
                    // Data
                    idColumnNewData.push(['']);
                    // Background
                    idColumnNewBackgrounds.push([cellBackground]);
                }
            }
        }

        sheet.getRange(headerRowNum, idColumn, idColumnNewData.length, 1).setValues(idColumnNewData).setBackgrounds(idColumnNewBackgrounds);
    }
}