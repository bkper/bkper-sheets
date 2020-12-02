/**
 * @public
 */
interface AutorecordConfig {
  bookName: string,
  enabled: boolean
}

namespace AutoRecordService {
  
  export function createAutoRecordBinding(sheet: GoogleAppsScript.Spreadsheet.Sheet, bookId: string, properties: GoogleAppsScript.Properties.Properties): AutorecordConfig {
    var binding = {
      sheetId: sheet.getSheetId(),
      bookId: bookId,
      currentRow: getLastRow_(sheet),
      retries: 0,
    }
    var autoRecordSheetsBindingDAO = new AutoRecordSheetBindingDAO(properties);
    autoRecordSheetsBindingDAO.saveBinding(binding);
    var config = createAutoRecordConfig_(bookId, true);
    sheet.setTabColor(RECORD_BACKGROUND_);
    return config;    
  }

  export function deleteAutoRecordBinding(sheet: GoogleAppsScript.Spreadsheet.Sheet, bookId: string, properties: GoogleAppsScript.Properties.Properties): AutorecordConfig {
    var autoRecordSheetsBindingDAO = new AutoRecordSheetBindingDAO(properties);
    autoRecordSheetsBindingDAO.deleteBinding(sheet.getSheetId());
    var config = createAutoRecordConfig_(bookId, false);
    var bindingsForSameTab = autoRecordSheetsBindingDAO.getBindingsForSheet(sheet.getSheetId());
    if (bindingsForSameTab.length == 0) {
      sheet.setTabColor(null);
    }
    return config;
  }
  
  export function loadAutoRecordConfig(sheet: GoogleAppsScript.Spreadsheet.Sheet, bookId: string, properties: GoogleAppsScript.Properties.Properties): AutorecordConfig {
    var autoRecordSheetsBindingDAO = new AutoRecordSheetBindingDAO(properties);
    var binding = autoRecordSheetsBindingDAO.loadBinding(sheet.getSheetId());
    var config;
    if (binding != null) {
      config = createAutoRecordConfig_(binding.bookId, true)
    } else {
      config = createAutoRecordConfig_(bookId, false);
    }
    return config;
  }
  
  function createAutoRecordConfig_(bookId: string, enabled: boolean): AutorecordConfig {
    var book = BookService.getBook(bookId);
    var config;
    try {
      config = {
        bookName: book.getName(),
        enabled: enabled
      }
    } catch (error) {
      config = {
        bookName: error,
        enabled: false
      }
    }
    return config;
  }
  
  export function processAutoRecord(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, properties: GoogleAppsScript.Properties.Properties): void {
    var autoRecordSheetsBindingDAO = new AutoRecordSheetBindingDAO(properties);
    var bindings = autoRecordSheetsBindingDAO.getBindings();
    var timeZone = spreadsheet.getSpreadsheetTimeZone();
    for (var i = 0; i < bindings.length; i++) {
      var binding = bindings[i];
      var sheet = getSheetById_(spreadsheet, binding.sheetId);
      if (sheet != null && binding.retries < 50) {
        try {
          recordLines_(sheet, binding, autoRecordSheetsBindingDAO, timeZone);
        } catch (error) {
          Utilities_.logError(error);
          binding.retries++;
          autoRecordSheetsBindingDAO.saveBinding(binding);          
        }
      } else {
        if (sheet == null) {
          Logger.log("Sheet null! Deleting binding.")
        } else {
          Logger.log("Too many retries! Deleting binding.")
        }
        autoRecordSheetsBindingDAO.deleteBinding(binding.sheetId);
      }
    }
    
  }
  
  function recordLines_(sheet: GoogleAppsScript.Spreadsheet.Sheet, binding: AutorecordBinding, autoRecordSheetsBindingDAO: AutoRecordSheetBindingDAO, timeZone: string) {
    var currentRow = binding.currentRow;
    var lastRow = getLastRow_(sheet);
    if (lastRow > currentRow) {
      var book = BookService.getBook(binding.bookId);
      var lastColumn = sheet.getLastColumn();
      var numberOfRowsToRecord = lastRow - currentRow;
      var range = sheet.getRange(currentRow + 1, 1, numberOfRowsToRecord, lastColumn);
      
      const values = range.getValues();

      if (binding.id != null) {
        for (var i = 0; i < values.length; i++) {
          let row = values[i];
          
          if (hasMoreThanOneDate_(row)) {
            //Hack to avoid record form response date, when other dates were provided
            row[0] = '';
          }

          let rowNum = currentRow + 1 + i;
          let id = `auto_record_${binding.id}_row_${rowNum}`;
          row.push(`id:${id}`)



        }
      }
      
      RecordTransactionsService.batchCreateTransactions(book, range, timeZone);

      range.setBackground(RECORD_BACKGROUND_);
      binding.currentRow = lastRow;
      binding.retries = 0;
      autoRecordSheetsBindingDAO.saveBinding(binding);
      insertLogNote_(book, range, timeZone);
    }
  }

  function hasMoreThanOneDate_(row: any[]): boolean {
    if (row == null || row.length == 0) {
      return false;
    }
    let firstValue = row[0];
    for (var i = 1; i < row.length; i++) {
      if (Utilities_.isDate(firstValue) && Utilities_.isDate(row[i])) {
        return true;
      }
    }
    return false;
  }
  
  function insertLogNote_(book: Bkper.Book, range: GoogleAppsScript.Spreadsheet.Range, timeZone: string) {
    var note = range.getNote();
    if (note != null && note != "") {
      note += " | ";
    }
    var dateFormat = book.getDatePattern() + " HH:mm:ss";
    note += "recorded in "+ book.getName() + " on " + Utilities.formatDate(new Date(), timeZone, dateFormat) + " by " + Session.getEffectiveUser().getEmail();
    
    var values = range.getValues();
    var notes = new Array();
    
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      var noteRow = new Array();
      noteRow[0] = note;
      for (var j = 1; j < row.length; j++) {
        noteRow[j] = null;
      }
      notes[i] = noteRow;
    }
    
    range.setNotes(notes);
    
  }
  
  function getLastRow_(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    var values = sheet.getDataRange().getValues();
    values = Utilities_.removeEmptyRowsAtEnd(values, isRowEmpty_);
    return values.length;
  }
  
  function getSheetById_(ss: GoogleAppsScript.Spreadsheet.Spreadsheet, id: number) {
    var sheets = ss.getSheets();
    for (var i=0; i<sheets.length; i++) {
      if (sheets[i].getSheetId() == id) {
        return sheets[i];
      }
    }
    return;
  }
  
  function isRowEmpty_(row: any[]): boolean {
    var rowStr = row.join("").trim();
    
    if (rowStr == "") {
      return true;
    }
    
    if (rowStr == '0') {
      return true;
    }
    
    return false;
  }
  
  
}
