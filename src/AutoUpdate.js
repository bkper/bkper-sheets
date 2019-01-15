
function showAutoUpdatePopup() {
  if (bkperSpreadsheetsAddonLib.isUserAuthorized()) {
    bkperSpreadsheetsAddonLib.showAutoUpdatePopup();
  } else {
    showAuthorizeView_();
  }  
}

function loadAutoUpdateConfig() {
  var spreadsheet = getActiveSpreadsheet();
  var properties = getDocumentProperties();  
  
  var config = {
    enabled: AutoUpdateTrigger.isEnabled(),
    statusText: bkperSpreadsheetsAddonLib.getLastUpdate(spreadsheet, properties)
  }
  return config;
}

function enableAutoUpdate(enable) {
  
  if (enable) {
    AutoUpdateTrigger.enableTrigger();
  } else {
    AutoUpdateTrigger.disable();
  }
  
  var spreadsheet = getActiveSpreadsheet();
  var properties = getDocumentProperties();  

  var config = {
    enabled: enable,
    statusText: bkperSpreadsheetsAddonLib.getLastUpdate(spreadsheet, properties)
  }  
  
  return config;
}


