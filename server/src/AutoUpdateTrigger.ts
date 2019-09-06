var AUTOSEND_TRIGGER_FUNCTION = 'triggerBkperAutoUpdate';

namespace AutoUpdateTrigger {

  export function enableTrigger(): void {
    ScriptApp.newTrigger(AUTOSEND_TRIGGER_FUNCTION).timeBased().everyHours(1).create();
  }

  export function isEnabled() {
    return get() != null;
  }

  export function disable(): void {
    var trigger = get();
    if (trigger != null) {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  function get() {
    var triggers = Utilities_.retry<GoogleAppsScript.Script.Trigger[]>(function () {
      return ScriptApp.getUserTriggers(getActiveSpreadsheet());
    });

    for (var i = 0; i < triggers.length; i++) {
      if (isAutoUpdateTrigger(triggers[i])) {
        return triggers[i];
      }
    }
    return null;
  }

  function isAutoUpdateTrigger(trigger: GoogleAppsScript.Script.Trigger) {
    return trigger.getEventType() == ScriptApp.EventType.CLOCK && trigger.getHandlerFunction() == AUTOSEND_TRIGGER_FUNCTION;
  }

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

    UpdateService_.updateDocument(spreadsheet, properties, true);

    lock.releaseLock();
  } catch (e) {
    Utilities_.logError(e);
  }

  triggerBkperAutoRecord()

}
