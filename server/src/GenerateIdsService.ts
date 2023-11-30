namespace GenerateIdsService {

    // Generate unique IDs for non-empty rows and returns the ID column starting from 1 = column A
    export function generate(sheet: GoogleAppsScript.Spreadsheet.Sheet): number {
        // Find ID column if it exists
        const idColumn = findIdColumn(sheet);
        // Fill ID column with unique IDs and return idColumn index
        return fillIdColumn(sheet, idColumn);
    }

    export function findDuplicatedIds() {

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
    function fillIdColumn(sheet: GoogleAppsScript.Spreadsheet.Sheet, idColumn: number | undefined): number {
        const columnToFill =  idColumn ? idColumn : sheet.getLastColumn() + 1;
        const sheetHeader = idColumn ? 1 : 0;

        let idColumnData = sheet.getRange(sheetHeader + 1, columnToFill, sheet.getLastRow(), 1).getValues();
        let idColumnNewData: any[][] = [];

        // Sheet has an ID header but seems to have no transitions
        const sheetHasIdHeaderButnoTransactions = (idColumn && idColumnData.length == 0) ? true : false;
        if (sheetHasIdHeaderButnoTransactions) {
            throw "Sheet has an ID header but no transitions bellow it";
        }

        for (let i = 0; i < idColumnData.length; i++) {
            let cellValue = idColumnData[i][0];
            if (cellValue) {
                idColumnNewData.push([cellValue]);
            } else {
                // Only generate ID to non-empty rows
                const emptyRow = sheet.getRange(i + (sheetHeader+1), 1, 1, sheet.getLastColumn()).isBlank();
                if (!emptyRow) {
                    const incrementedTimestamp = new Date().getTime() + i;
                    idColumnNewData.push([Utilities.getUuid() + `-${incrementedTimestamp}`]);
                } else {
                    idColumnNewData.push(['']);
                }
            }
        }

        sheet.getRange(sheetHeader + 1, columnToFill, idColumnNewData.length, 1).setValues(idColumnNewData).setBackground(null);

        // Return idColumn index
        return columnToFill;
    }
}