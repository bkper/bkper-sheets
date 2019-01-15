
function showSidebar() {
  if (bkperSpreadsheetsAddonLib.isUserAuthorized()) {
    bkperSpreadsheetsAddonLib.showSidebar();
  } else {
    showAuthorizeView_();
  }
}

function loadLedgers() {
  try {
    var ledgers = bkperSpreadsheetsAddonLib.loadLedgers();
    var lastSelectedLedger = loadLastSelectedLedger();
    if (lastSelectedLedger != null) {
      for (var i = 0; i < ledgers.length; i++) {
        if (ledgers[i].id == lastSelectedLedger) {
          ledgers[i].selected = true;
        }
      }
    }
    return ledgers;
  } catch (err) {
    if (!bkperSpreadsheetsAddonLib.isUserAuthorized()) {
      showAuthorizeView_();
      throw err;
    }
  }  
}

function recordLines(ledgerId, highlight) {
  return bkperSpreadsheetsAddonLib.recordLines(ledgerId, highlight);
}


function loadQueries(ledgerId) {
  return bkperSpreadsheetsAddonLib.loadQueries(ledgerId);
}

function fetchQuery(fetchStatement) {
  var spreadsheet = getActiveSpreadsheet();
  var properties = getDocumentProperties();
  bkperSpreadsheetsAddonLib.fetchQuery(spreadsheet, properties, fetchStatement);
}


function getRecordTemplatesKey() {
  return "LAST_SELECTED_LEDGER_ID_" + Session.getEffectiveUser().getEmail();
}

function loadLastSelectedLedger() {
  return getDocumentProperties().getProperty(getRecordTemplatesKey());
}

function saveLastSelectedLedger(ledgerId) {
  if (ledgerId != null) {
    getDocumentProperties().setProperty(getRecordTemplatesKey(), ledgerId);
  } else {
    getDocumentProperties().deleteProperty(getRecordTemplatesKey())
  }
}

