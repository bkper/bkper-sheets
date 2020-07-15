
namespace FetchTabActivity {

	export function init() {

	}

	export function loadQueries(ledgerId) {
		FetchTabView.showQueryError(false);
		FetchTabView.verifyFormState();
		if (ledgerId != null && ledgerId.trim() != "") {
			var ledgerQueriesKey = "ledgerQueries_" + ledgerId;
			var cachedQueries = CacheController.get(ledgerQueriesKey);
			if (cachedQueries != null) {
				FetchTabView.setQueries(cachedQueries);
			} else {

				FetchTabView.setQueryInput("");
				FetchTabView.verifyFormState();
				FetchTabView.disableQueryInput(true);
				SidebarView.disableLedgerSelect(true);
				SidebarView.loading(true);
				if (!DEV_MODE) {
					google.script.run.withSuccessHandler(queriesLoaded).withFailureHandler(SidebarView.showError).loadQueries(ledgerId);
				}
			}
			if (DEV_MODE) {
				FetchTabView.setQueries(cachedQueries);
			}
		}
	}

	export function fetchQuery() {
		FetchTabView.showQueryError(false);
		SidebarView.loading(true);
		var form = FetchTabView.getForm();
		google.script.run.withSuccessHandler(fetched).withFailureHandler(FetchTabView.showQueryError).fetchQuery(form);
	}

	//CALLBACKS
	function queriesLoaded(ledgerQueries) {
		var queries = ledgerQueries.queries;
		var ledgerId = ledgerQueries.ledgerId;
		var ledgerQueriesKey = "ledgerQueries_" + ledgerId;
		CacheController.put(ledgerQueriesKey, queries);
		FetchTabView.setQueries(queries);
		SidebarView.disableLedgerSelect(false);
		FetchTabView.verifyFormState();
		SidebarView.loading(false);
	}

	function fetched(ledgers) {
		SidebarView.loading(false);
	}

};
