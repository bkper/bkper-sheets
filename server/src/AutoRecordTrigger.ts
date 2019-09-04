var AUTORECORD_TRIGGER_FUNCTION = 'triggerBkperAutoRecord';

var AutoRecordTrigger = {

  enableTrigger: function() {
    ScriptApp.newTrigger(AUTORECORD_TRIGGER_FUNCTION).forSpreadsheet(getActiveSpreadsheet()).onChange().create();
    ScriptApp.newTrigger(AUTORECORD_TRIGGER_FUNCTION).forSpreadsheet(getActiveSpreadsheet()).onFormSubmit().create();
    ScriptApp.newTrigger(AUTORECORD_TRIGGER_FUNCTION).forSpreadsheet(getActiveSpreadsheet()).onEdit().create();
    
  },
  
  get_: function() {
    var triggers = Utilities_.retry<GoogleAppsScript.Script.Trigger[]>(function() {
      return ScriptApp.getUserTriggers(getActiveSpreadsheet());
    });
    
    for (var i = 0; i < triggers.length; i++) {
      if (AutoRecordTrigger.isAutoRecordTrigger(triggers[i])) {
        return triggers[i];
      }
    }
    return null;    
  },

  
  isEnabled: function() {
    return AutoRecordTrigger.get_() != null;   
  },
  
  isAutoRecordTrigger:function(trigger) {
    return trigger.getHandlerFunction() == AUTORECORD_TRIGGER_FUNCTION;
  },
  
}

/**
  Trigger function. DO NOT RENAME!!!!
*/
function triggerBkperAutoRecord() {
  
  try {
    var lock = LockService.getDocumentLock();
    lock.waitLock(120000);  
    var spreadsheet = getActiveSpreadsheet();
    var properties = getDocumentProperties();
    bkperSpreadsheetsAddonLib.processAutoRecord(spreadsheet, properties)
    Utilities.sleep(2000);
    lock.releaseLock();
  } catch (e) {
    Utilities_.logError(e);
  }
  
}
