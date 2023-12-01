namespace GenerateIdsService {

    // Generate unique IDs for non-empty rows and returns the ID column starting from 1 = column A
    export function generate(sheet: GoogleAppsScript.Spreadsheet.Sheet): number {
        // Try to find ID column
        const idColumn = findIdColumn(sheet);
        if (!idColumn) {
            throw "Error: cannot find an 'ID' column header in the first row of this sheet";
        }
        // Fill ID column with unique IDs and return idColumn index
        return fillIdColumn(sheet, idColumn);
    }

    function findIdColumn(sheet: GoogleAppsScript.Spreadsheet.Sheet): number | undefined {
        if (sheet.getDataRange().isBlank()) {
            throw "Error: empty sheet";
        }
        let sheetValues = sheet.getDataRange().getValues();
        let idColumn = 0;
        let hasIdColumn = false;
        for (let i = 0; i < sheetValues[0].length; i++) {
            if (!hasIdColumn && `${sheetValues[0][i]}`.toLowerCase() == 'id') {
                idColumn = i + 1;
                hasIdColumn = true;
            }
        }
        return hasIdColumn ? idColumn : undefined;
    }

    // Fill ID column with unique IDs
    function fillIdColumn(sheet: GoogleAppsScript.Spreadsheet.Sheet, idColumn: number): number {        
        // Sheet has an ID header but seems to have no transitions
        const transactionsRange = sheet.getRange(2, 1, sheet.getLastRow(), sheet.getLastColumn());
        if (transactionsRange.isBlank()) {
            throw "Sheet has an 'ID' header but appears to have no transactions in the rows below it";
        }
        
        let idColumnData = sheet.getRange(2, idColumn, sheet.getLastRow(), 1).getValues();
        let idColumnNewData: any[][] = [];
        for (let i = 0; i < idColumnData.length; i++) {
            let cellValue = idColumnData[i][0];
            if (cellValue) {
                idColumnNewData.push([cellValue]);
            } else {
                // Only generate ID to non-empty rows
                const emptyRow = sheet.getRange(2 + i, 1, 1, sheet.getLastColumn()).isBlank();
                if (!emptyRow) {
                    const incrementedTimestamp = new Date().getTime() + i;
                    idColumnNewData.push([Utilities.getUuid() + `-${incrementedTimestamp}`]);
                } else {
                    idColumnNewData.push(['']);
                }
            }
        }

        sheet.getRange(2, idColumn, idColumnNewData.length, 1).setValues(idColumnNewData).setBackground(null);

        // Return idColumn index
        return idColumn;
    }
}