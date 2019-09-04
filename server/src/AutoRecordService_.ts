var AutoRecordService_ = {
  
  createAutoRecordBinding: function(sheet, bookId, properties) {
    var binding = {
      sheetId: sheet.getSheetId(),
      bookId: bookId,
      currentRow: AutoRecordService_.getLastRow_(sheet),
      retries: 0,
    }
    var autoRecordSheetsBindingDAO = new AutoRecordSheetBindingDAO(properties);
    autoRecordSheetsBindingDAO.saveBinding(binding);
    var config = AutoRecordService_.createAutoRecordConfig_(bookId, true);
    sheet.setTabColor(RECORD_BACKGROUND_);
    return config;    
  },

  deleteAutoRecordBinding: function(sheet, bookId, properties) {
    var autoRecordSheetsBindingDAO = new AutoRecordSheetBindingDAO(properties);
    autoRecordSheetsBindingDAO.deleteBinding(sheet.getSheetId());
    var config = AutoRecordService_.createAutoRecordConfig_(bookId, false);
    var bindingsForSameTab = autoRecordSheetsBindingDAO.getBindingsForSheet(sheet.getSheetId());
    if (bindingsForSameTab.length == 0) {
      sheet.setTabColor(null);
    }
    return config;
  },
  
  loadAutoRecordConfig: function(sheet, bookId, properties) {
    var autoRecordSheetsBindingDAO = new AutoRecordSheetBindingDAO(properties);
    var binding = autoRecordSheetsBindingDAO.loadBinding(sheet.getSheetId());
    var config;
    if (binding != null) {
      config = AutoRecordService_.createAutoRecordConfig_(binding.bookId, true)
    } else {
      config = AutoRecordService_.createAutoRecordConfig_(bookId, false);
    }
    return config;
  },  
  
  createAutoRecordConfig_: function(bookId, enabled) {
    var book = BkperApp.openById(bookId);
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
  },
  
  processAutoRecord: function(spreadsheet, properties) {
    var autoRecordSheetsBindingDAO = new AutoRecordSheetBindingDAO(properties);
    var bindings = autoRecordSheetsBindingDAO.getBindings();
    var timeZone = spreadsheet.getSpreadsheetTimeZone();
    for (var i = 0; i < bindings.length; i++) {
      var binding = bindings[i];
      var sheet = AutoRecordService_.getSheetById_(spreadsheet, binding.sheetId);
      if (sheet != null && binding.retries < 50) {
        try {
          AutoRecordService_.recordLines_(sheet, binding, autoRecordSheetsBindingDAO, timeZone);
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
    
  },
  
  recordLines_: function(sheet, binding, autoRecordSheetsBindingDAO, timeZone) {
    var currentRow = binding.currentRow;
    var lastRow = AutoRecordService_.getLastRow_(sheet);
    if (lastRow > currentRow) {
      var book = BkperApp.openById(binding.bookId);
      var lastColumn = sheet.getLastColumn();
      var numberOfRowsToRecord = lastRow - currentRow;
      var range = sheet.getRange(currentRow + 1, 1, numberOfRowsToRecord, lastColumn);
      
      TransactionAccountService_.createAccountsIfNeeded(book, range);      
      
      book.record(range.getValues(), timeZone);
      range.setBackground(RECORD_BACKGROUND_);
      binding.currentRow = lastRow;
      binding.retries = 0;
      autoRecordSheetsBindingDAO.saveBinding(binding);
      AutoRecordService_.insertLogNote_(book, range, timeZone);
    }
  },
  
  insertLogNote_: function(book, range, timeZone) {
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
    
  },
  
  getLastRow_: function(sheet) {
    var values = sheet.getDataRange().getValues();
    values = BkperUtils.removeEmptyRowsAtEnd(values, AutoRecordService_.isRowEmpty_);
    return values.length;
  },
  
  getSheetById_: function(ss, id) {
    var sheets = ss.getSheets();
    for (var i=0; i<sheets.length; i++) {
      if (sheets[i].getSheetId() == id) {
        return sheets[i];
      }
    }
    return;
  },
  
  isRowEmpty_: function(row) {
    var rowStr = row.join("").trim();
    
    if (rowStr == "") {
      return true;
    }
    
    if (rowStr == 0) {
      return true;
    }
    
    return false;
  },
  
  
}
