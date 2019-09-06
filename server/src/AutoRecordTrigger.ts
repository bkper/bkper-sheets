var AUTORECORD_TRIGGER_FUNCTION = 'triggerBkperAutoRecord';

namespace AutoRecordTrigger {

  export function enableTrigger() {
    ScriptApp.newTrigger(AUTORECORD_TRIGGER_FUNCTION).forSpreadsheet(getActiveSpreadsheet()).onChange().create();
    ScriptApp.newTrigger(AUTORECORD_TRIGGER_FUNCTION).forSpreadsheet(getActiveSpreadsheet()).onFormSubmit().create();
    ScriptApp.newTrigger(AUTORECORD_TRIGGER_FUNCTION).forSpreadsheet(getActiveSpreadsheet()).onEdit().create();
  }

  export function isEnabled() {
    return get_() != null;   
  }
  
  function get_() {
    var triggers = Utilities_.retry<GoogleAppsScript.Script.Trigger[]>(function() {
      return ScriptApp.getUserTriggers(getActiveSpreadsheet());
    });
    
    for (var i = 0; i < triggers.length; i++) {
      if (isAutoRecordTrigger(triggers[i])) {
        return triggers[i];
      }
    }
    return null;    
  }
  
  function isAutoRecordTrigger(trigger: GoogleAppsScript.Script.Trigger) {
    return trigger.getHandlerFunction() == AUTORECORD_TRIGGER_FUNCTION;
  }
  
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
    AutoRecordService_.processAutoRecord(spreadsheet, properties)
    Utilities.sleep(2000);
    lock.releaseLock();
  } catch (e) {
    Utilities_.logError(e);
  }
  
}
