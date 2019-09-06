var triggerEnabled = false;

namespace AutoUpdateActivity {

	export function init() {
		loadConfig();
	}

	function loadConfig() {
		if (DEV_MODE) {
			configLoaded(false)
		} else {
			google.script.run.withSuccessHandler(configLoaded).withFailureHandler(configLoadError).loadAutoUpdateConfig();
		}
	}

	export function toggle() {
		var enable = !triggerEnabled;
		AutoUpdateView.waiting(true);        

		if (DEV_MODE) {
			toggled(enable);
		} else {
			google.script.run.withSuccessHandler(toggled).withFailureHandler(enabledError).enableAutoUpdate(enable);
		}
	}

	function toggled(autoUpdateConfig) {
		triggerEnabled = autoUpdateConfig.enabled;
		AutoUpdateView.waiting(false);
		AutoUpdateView.setEnabled(triggerEnabled, autoUpdateConfig.statusText);
	}

	// CALLBACK FUNCTIONS

	function configLoaded(autoUpdateConfig) {
		triggerEnabled = autoUpdateConfig.enabled;
		AutoUpdateView.waiting(false);
		AutoUpdateView.setEnabled(triggerEnabled, autoUpdateConfig.statusText);
	}
  
	function enabledError(e) {
        var errorMsg = e + "";
        AutoUpdateView.waiting(false);
        AutoUpdateView.setEnabled(false, errorMsg);   
        AutoUpdateView.setOnOffLabel("SORRY");        
  }
  
	function configLoadError(e) {
 
		//TODO
	}

};