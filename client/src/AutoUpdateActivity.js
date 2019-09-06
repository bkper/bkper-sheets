var triggerEnabled = false;

var AutoUpdateActivity = {

	init : function() {
		AutoUpdateActivity.loadConfig();
	},

	loadConfig : function() {
		if (DEV_MODE) {
			AutoUpdateActivity.configLoaded(false)
		} else {
			google.script.run.withSuccessHandler(AutoUpdateActivity.configLoaded).withFailureHandler(AutoUpdateActivity.configLoadError).loadAutoUpdateConfig();
		}
	},

	toggle : function() {
		var enable = !triggerEnabled;
		AutoUpdateView.waiting(true);        

		if (DEV_MODE) {
			AutoUpdateActivity.toggled(enable);
		} else {
			google.script.run.withSuccessHandler(AutoUpdateActivity.toggled).withFailureHandler(AutoUpdateActivity.enabledError).enableAutoUpdate(enable);
		}
	},

	toggled : function(autoUpdateConfig) {
		triggerEnabled = autoUpdateConfig.enabled;
		AutoUpdateView.waiting(false);
		AutoUpdateView.setEnabled(triggerEnabled, autoUpdateConfig.statusText);
	},

	// CALLBACK FUNCTIONS

	configLoaded : function(autoUpdateConfig) {
		triggerEnabled = autoUpdateConfig.enabled;
		AutoUpdateView.waiting(false);
		AutoUpdateView.setEnabled(triggerEnabled, autoUpdateConfig.statusText);
	},
    
	enabledError : function(e) {
        var errorMsg = e + "";
        AutoUpdateView.waiting(false);
        AutoUpdateView.setEnabled(false, errorMsg);   
        AutoUpdateView.setOnOffLabel("SORRY");        
	},
	configLoadError : function(e) {
 
		//TODO
	},

};