
function showAutoUpdatePopup() {
  if (BkperApp.isUserAuthorized()) {
    var ui = HtmlService.createTemplateFromFile('AutoUpdateView').evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setWidth(550).setHeight(150);
    SpreadsheetApp.getUi().showModalDialog(ui, 'Auto-update spreadsheet every hour?');
  } else {
    showAuthorizeView_();
  }  
}

/**
 * @public
 */
function loadAutoUpdateConfig() {
  var spreadsheet = getActiveSpreadsheet();
  var properties = getDocumentProperties();  
  
  var config = {
    enabled: AutoUpdateTrigger.isEnabled(),
    statusText: UpdateService_.getLastUpdate(spreadsheet, properties)
  }
  return config;
}

/**
 * @public
 */
function enableAutoUpdate(enable: boolean): { enabled: boolean, statusText: string}   {
  
  if (enable) {
    AutoUpdateTrigger.enableTrigger();
  } else {
    AutoUpdateTrigger.disable();
  }
  
  var spreadsheet = getActiveSpreadsheet();
  var properties = getDocumentProperties();  

  var config = {
    enabled: enable,
    statusText: UpdateService_.getLastUpdate(spreadsheet, properties)
  }  
  
  return config;
}


