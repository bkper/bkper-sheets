/**
 * @OnlyCurrentDoc
 */

function onOpen() {
  bkperSpreadsheetsAddonLib.onOpen();
}

function onInstall() {
  bkperSpreadsheetsAddonLib.onInstall();
}


function getActiveSpreadsheet() {
  return BkperUtils.retry(function() {
    return SpreadsheetApp.getActiveSpreadsheet();
  });
}


function getDocumentProperties() {
  return BkperUtils.retry(function() {
    return PropertiesService.getDocumentProperties();
  });
}



