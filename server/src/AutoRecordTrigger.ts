var AUTORECORD_TRIGGER_FUNCTION = 'triggerBkperAutoRecord';

namespace AutoRecordTrigger {

  export function enableTrigger() {
    ScriptApp.newTrigger(AUTORECORD_TRIGGER_FUNCTION).timeBased().everyHours(1).create();
    ScriptApp.newTrigger(AUTORECORD_TRIGGER_FUNCTION).forSpreadsheet(getActiveSpreadsheet()).onChange().create();
    ScriptApp.newTrigger(AUTORECORD_TRIGGER_FUNCTION).forSpreadsheet(getActiveSpreadsheet()).onFormSubmit().create();
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
  let sleepMin = 300;
  let sleepMax = 1500;
  let rumpUp = 1;
  let maxRetries = 20;
  try {
    var lock = Utilities_.retry<GoogleAppsScript.Lock.Lock>(() => LockService.getDocumentLock(), sleepMin, sleepMax, maxRetries, rumpUp);
    Utilities_.retry<GoogleAppsScript.Lock.Lock>(() => lock.waitLock(120000), sleepMin, sleepMax, maxRetries, rumpUp);    
    var spreadsheet = getActiveSpreadsheet();
    var properties = getDocumentProperties();
    AutoRecordService.processAutoRecord(spreadsheet, properties)
    Utilities.sleep(500);
    Utilities_.retry<GoogleAppsScript.Lock.Lock>(() => lock.releaseLock(), sleepMin, sleepMax, maxRetries, rumpUp);        
  } catch (e) {
    Utilities_.logError(e);
  }
  
}
