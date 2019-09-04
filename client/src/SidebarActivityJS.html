var saveRetries = 0;

var SidebarActivity = {

	init : function() {
		if (DEV_MODE) {
			SidebarView.setLedgers();
			SidebarView.showSidebarWrapper(true);
			SidebarView.disableLedgerSelect(false);
		} else {
			SidebarActivity.loadLedgers();
		}
	},

	//SERVICE FUNCTIONS
	loadLedgers : function() {
		google.script.run.withSuccessHandler(SidebarActivity.ledgersLoaded)
				.withFailureHandler(SidebarView.showError).loadLedgers();
	},
	saveLastSelectedLedger : function() {
		var ledger = SidebarView.getSelectedLedger();
		var ledgerId = null;
		if (ledger != null) {
			ledgerId = ledger.id;
		}
		google.script.run.withSuccessHandler(
				SidebarActivity.lastSelectedLedgerSaved).withFailureHandler(
				SidebarActivity.lastSelectedLedgerSavedError)
				.saveLastSelectedLedger(ledgerId);
	},

	reload : function() {
		SidebarView.loading(true);
		CacheController.clear();
		SidebarActivity.loadLedgers();
	},

	ledgersLoaded : function(ledgers) {
		saveRetries = 0;
		SidebarView.setLedgers(ledgers);
		SidebarView.showSidebarWrapper(true);
		if (ledgers.length > 0) {
			SidebarView.disableLedgerSelect(false);
		}
		SidebarView.loading(false);
	},

	lastSelectedLedgerSaved : function() {
		saveRetries = 0;
	},

	lastSelectedLedgerSavedError : function() {
		if (saveRetries < 10) {
			saveRetries++;
			SidebarActivity.saveLastSelectedLedger();
		} else {
			SidebarView.showError();
		}
	},

	fetched : function(ledgers) {
		SidebarView.loading(false);
	},

	isFormFullfilled : function(form) {
		return form.ledgerId != null && form.ledgerId.trim() != "";
	},

	getOpenURL : function(form, isFetch) {
		var place = "#transactions:";

		if (isFetch && form.fetchType == "balances") {
			place = "#report:";
		}

		var url = "https://app.bkper.com/"+ place + "ledgerId=" + form.ledgerId;
		if (isFetch && form.query != null && form.query.trim() != "") {
			url += "&query=" + encodeURIComponent(encodeURIComponent(form.query));
		}
		return url;
	},

};

var CacheController = {
	cache : new Object(),
	put : function(key, valueObject) {
		if (valueObject != null) {
			var valueJson = JSON.stringify(valueObject);
			CacheController.cache[key] = valueJson;
		}
	},
	get : function(key) {
		var valueJson = CacheController.cache[key];
		if (valueJson != null) {
			return JSON.parse(valueJson);
		} else {
			return null;
		}
	},
	clear : function() {
		CacheController.cache = new Object();
	},
};
