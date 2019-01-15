var SCRIPT_URI = "https://script.google.com/macros/d/Mm0M0c7U_BuVSGlucwH0ytAoOxUd2qb-3"

function showAuthorizeView_() {
  var ui = HtmlService.createTemplateFromFile('AuthorizeView').evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setTitle('Bkper Sheets');
  SpreadsheetApp.getUi().showSidebar(ui);
}

function authorizationCallback(e) {
  if (e.parameter && e.parameter.code) {
    bkperSpreadsheetsAddonLib.storeTokenData(e.parameter.code, getCallbackURL_());
    return bkperSpreadsheetsAddonLib.getAuthorizedCloseWindow();
  } else {
    return HtmlService.createHtmlOutput("Unauthorized!");
  }
}

function checkUserAuthorized() {
  if (bkperSpreadsheetsAddonLib.isUserAuthorized()) {
    bkperSpreadsheetsAddonLib.showSidebar();
  }
}

function getAuthorizationURL() {
  return bkperSpreadsheetsAddonLib.createAuthorizationURL(getCallbackURL_(), getStateToken_('authorizationCallback'));
}

 function getCallbackURL_() {
   var scriptUrl = SCRIPT_URI;
   var urlSuffix = '/usercallback';
   return scriptUrl + urlSuffix;
 }

function getStateToken_(callbackFunction) {
     var stateToken = ScriptApp.newStateToken()
       .withMethod(callbackFunction)
       .withTimeout(3600)
       .createToken();
  return stateToken;
}
