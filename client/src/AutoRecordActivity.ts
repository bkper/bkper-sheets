
var triggerEnabled = false;

namespace AutoRecordActivity {

  export function init() {
    loadConfig();
  }

  function loadConfig() {
    if (DEV_MODE) {
      configLoaded(false)
    } else {
      google.script.run.withSuccessHandler(configLoaded).withFailureHandler(configLoadError).loadAutoRecordConfig();
    }
  }

  export function toggle() {
    var enable = !triggerEnabled;
    AutoRecordView.waiting(true);

    if (DEV_MODE) {
      toggled(enable);
    } else {
      google.script.run.withSuccessHandler(toggled).withFailureHandler(enabledError).enableAutoRecord(enable);
    }
  }

  function toggled(config) {
    triggerEnabled = config.enabled;
    AutoRecordView.waiting(false);
    AutoRecordView.setEnabled(triggerEnabled, "Target book: " + config.bookName);
  }

  // CALLBACK FUNCTIONS

  function configLoaded(config) {
    triggerEnabled = config.enabled;
    AutoRecordView.waiting(false);
    AutoRecordView.setEnabled(triggerEnabled, "Target book: " + config.bookName);
  }

  function enabledError(e) {
    var errorMsg = e + "";
    AutoRecordView.waiting(false);
    AutoRecordView.setEnabled(false, errorMsg);
    AutoRecordView.setOnOffLabel("SORRY");
  }

  function configLoadError(e) {
    //TODO
  }

};