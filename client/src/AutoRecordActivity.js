var triggerEnabled = false;

var AutoRecordActivity = {

  init: function() {
    AutoRecordActivity.loadConfig();
  },

  loadConfig: function() {
    if (DEV_MODE) {
      AutoRecordActivity.configLoaded(false)
    } else {
      google.script.run.withSuccessHandler(AutoRecordActivity.configLoaded).withFailureHandler(AutoRecordActivity.configLoadError).loadAutoRecordConfig();
    }
  },

  toggle: function() {
    var enable = !triggerEnabled;
    AutoRecordView.waiting(true);

    if (DEV_MODE) {
      AutoRecordActivity.toggled(enable);
    } else {
      google.script.run.withSuccessHandler(AutoRecordActivity.toggled).withFailureHandler(AutoRecordActivity.enabledError).enableAutoRecord(enable);
    }
  },

  toggled: function(config) {
    triggerEnabled = config.enabled;
    AutoRecordView.waiting(false);
    AutoRecordView.setEnabled(triggerEnabled, "Target book: " + config.bookName);
  },

  // CALLBACK FUNCTIONS

  configLoaded: function(config) {
    triggerEnabled = config.enabled;
    AutoRecordView.waiting(false);
    AutoRecordView.setEnabled(triggerEnabled, "Target book: " + config.bookName);
  },

  enabledError: function(e) {
    var errorMsg = e + "";
    AutoRecordView.waiting(false);
    AutoRecordView.setEnabled(false, errorMsg);
    AutoRecordView.setOnOffLabel("SORRY");
  },

  configLoadError: function(e) {
    //TODO
  },

};