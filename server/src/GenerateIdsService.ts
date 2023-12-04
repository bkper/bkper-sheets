namespace GenerateIdsService {

    // Generate unique IDs for non-empty rows and returns the ID column starting from 1 = column A
    export function generate(sheet: GoogleAppsScript.Spreadsheet.Sheet): number {
        // Validate header
        const header = new TransactionsHeader(sheet.getDataRange());
        if (!header.isValid()) {
            throw "Error: you must set a frozen header with an ID column. See https://help.bkper.com/en/articles/2569151-bkper-add-on-for-google-sheets#h_73cf0eaf6c for more information.";
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
            throw "Error: could not find an ID column in the header.";
        }

        // Fill ID column with unique IDs and return idColumn index
        return fillIdColumn(sheet, header.getRowNum() + 1, idColumn);
    }

    // Fill ID column with unique IDs
    function fillIdColumn(sheet: GoogleAppsScript.Spreadsheet.Sheet, headerRowNum: number, idColumn: number): number {      
          // Sheet has an ID header but seems to have no transitions
        const transactionsRange = sheet.getRange(headerRowNum, 1, sheet.getLastRow(), sheet.getLastColumn());
        if (transactionsRange.isBlank()) {
            throw "Sheet appears to contain no transactions below the header";
        }
        
        let idColumnData = sheet.getRange(headerRowNum, idColumn, sheet.getLastRow(), 1).getValues();
        let idColumnNewData: any[][] = [];
        for (let i = 0; i < idColumnData.length; i++) {
            let cellValue = idColumnData[i][0];
            if (cellValue) {
                idColumnNewData.push([cellValue]);
            } else {
                // Only generate ID to non-empty rows
                const emptyRow = sheet.getRange(headerRowNum + i, 1, 1, sheet.getLastColumn()).isBlank();
                if (!emptyRow) {
                    const incrementedTimestamp = new Date().getTime() + i;
                    idColumnNewData.push([Utilities.getUuid() + `-${incrementedTimestamp}`]);
                } else {
                    idColumnNewData.push(['']);
                }
            }
        }

        sheet.getRange(headerRowNum, idColumn, idColumnNewData.length, 1).setValues(idColumnNewData).setBackground(null);

        // Return idColumn index
        return idColumn;
    }
}