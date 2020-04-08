
function showAuthorizeView_() {
  var template = HtmlService.createTemplateFromFile('AuthorizeView');
  template.authorizationUrl = Authorizer.getAuthorizationUrl();
  var ui = template.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setTitle('Bkper');
  SpreadsheetApp.getUi().showSidebar(ui);
}

/**
 * WARNING - Used as OAuth calllback. Do NOT change function name.
 */
function authorizationCallback(request: any) {
  let authorized = Authorizer.handleCallback(request);
  if (authorized) {
    return HtmlService.createTemplateFromFile('AuthorizedViewClose').evaluate().setTitle('Bkper authorized');;
  } else {
    return HtmlService.createHtmlOutput("Unauthorized!");
  }
}


