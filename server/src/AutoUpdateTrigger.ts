var AUTOSEND_TRIGGER_FUNCTION = 'triggerBkperAutoUpdate';

var AutoUpdateTrigger = {

  disable: function() {
    var trigger = AutoUpdateTrigger.get();
    if (trigger != null) {
      ScriptApp.deleteTrigger(trigger);
    }
  },
  
  enableTrigger: function() {
    ScriptApp.newTrigger(AUTOSEND_TRIGGER_FUNCTION).timeBased().everyHours(1).create();
  },
  
  get: function() {
    var triggers = Utilities_.retry<GoogleAppsScript.Script.Trigger[]>(function() {
      return ScriptApp.getUserTriggers(getActiveSpreadsheet());
    });
    
    for (var i = 0; i < triggers.length; i++) {
      if (AutoUpdateTrigger.isAutoUpdateTrigger(triggers[i])) {
        return triggers[i];
      }
    }
    return null;    
  },

  
  isEnabled: function() {
    return AutoUpdateTrigger.get() != null;   
  },
  
  isAutoUpdateTrigger:function(trigger) {
    return trigger.getEventType() == ScriptApp.EventType.CLOCK && trigger.getHandlerFunction() == AUTOSEND_TRIGGER_FUNCTION;
  },
  
}

/**
  Trigger function. DO NOT RENAME!!!!
*/
function triggerBkperAutoUpdate() {
  try {
    var lock = LockService.getDocumentLock();
    lock.waitLock(120000);  
    
    var spreadsheet = getActiveSpreadsheet();
    var properties = getDocumentProperties();
    
    bkperSpreadsheetsAddonLib.update(spreadsheet, properties, true);  
    
    lock.releaseLock();
  } catch (e) {
    Utilities_.logError(e);
  }
  
  triggerBkperAutoRecord()
  
}
