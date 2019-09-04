var SCRIPT_URI = "https://script.google.com/macros/d/Mm0M0c7U_BuVSGlucwH0ytAoOxUd2qb-3"

function showAuthorizeView_() {
  var ui = HtmlService.createTemplateFromFile('AuthorizeView').evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setTitle('Bkper Sheets');
  SpreadsheetApp.getUi().showSidebar(ui);
}

function authorizationCallback(e: any) {
  if (e.parameter && e.parameter.code) {
    Authorizer_.storeTokenData(e.parameter.code, getCallbackURL_());
    return Authorizer_.getAuthorizedCloseWindow();
  } else {
    return HtmlService.createHtmlOutput("Unauthorized!");
  }
}

function getAuthorizationURL() {
  return Authorizer_.createAuthorizationURL(getCallbackURL_(), getStateToken_('authorizationCallback'));
}

 function getCallbackURL_() {
   var scriptUrl = SCRIPT_URI;
   var urlSuffix = '/usercallback';
   return scriptUrl + urlSuffix;
 }

function getStateToken_(callbackFunction: string): string {
     var stateToken = ScriptApp.newStateToken()
       .withMethod(callbackFunction)
       .withTimeout(3600)
       .createToken();
  return stateToken;
}

namespace Authorizer_ {
  export function storeTokenData(code: string, redirectUri: string): void {
    //@ts-ignore
    BkperApp.storeTokenData(code, redirectUri);
  }
  
  export function createAuthorizationURL(redirectUri: string, state: string): string {
    //@ts-ignore
    return BkperApp.createAuthorizationURL(redirectUri, state);
  }
  
  export function getAuthorizedCloseWindow(): GoogleAppsScript.HTML.HtmlOutput {
    //@ts-ignore
    return BkperApp.getAuthorizedCloseWindow();
  }
}
