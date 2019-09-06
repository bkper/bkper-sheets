
namespace SidebarActivity {

  var saveRetries = 0;

	export function init() {
		if (DEV_MODE) {
			SidebarView.setLedgers();
			SidebarView.showSidebarWrapper(true);
			SidebarView.disableLedgerSelect(false);
		} else {
			loadLedgers();
		}
	}

	//SERVICE FUNCTIONS
	function loadLedgers() {
		google.script.run.withSuccessHandler(ledgersLoaded).withFailureHandler(SidebarView.showError).loadLedgers();
  }
  
	export function saveLastSelectedLedger() {
		var ledger = SidebarView.getSelectedLedger();
		var ledgerId = null;
		if (ledger != null) {
			ledgerId = ledger.id;
		}
		google.script.run.withSuccessHandler(lastSelectedLedgerSaved).withFailureHandler(lastSelectedLedgerSavedError).saveLastSelectedLedger(ledgerId);
	}

	export function reload() {
		SidebarView.loading(true);
		CacheController.clear();
		loadLedgers();
	}

	function ledgersLoaded(ledgers) {
		saveRetries = 0;
		SidebarView.setLedgers(ledgers);
		SidebarView.showSidebarWrapper(true);
		if (ledgers.length > 0) {
			SidebarView.disableLedgerSelect(false);
		}
		SidebarView.loading(false);
	}

	function lastSelectedLedgerSaved() {
		saveRetries = 0;
	}

	function lastSelectedLedgerSavedError() {
		if (saveRetries < 10) {
			saveRetries++;
			saveLastSelectedLedger();
		} else {
			SidebarView.showError();
		}
	}

	function fetched(ledgers) {
		SidebarView.loading(false);
	}

	function isFormFullfilled(form) {
		return form.ledgerId != null && form.ledgerId.trim() != "";
	}

	export function getOpenURL(form, isFetch) {
		var place = "#transactions:";

		if (isFetch && form.fetchType == "balances") {
			place = "#report:";
		}

		var url = "https://app.bkper.com/"+ place + "ledgerId=" + form.ledgerId;
		if (isFetch && form.query != null && form.query.trim() != "") {
			url += "&query=" + encodeURIComponent(encodeURIComponent(form.query));
		}
		return url;
	}

};

