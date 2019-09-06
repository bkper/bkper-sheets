var FetchTabActivity = {

	init : function() {

	},

	loadQueries : function(ledgerId) {
		FetchTabView.showQueryError(false);
		FetchTabView.verifyFormState();
		if (ledgerId != null && ledgerId.trim() != "") {
			var ledgerQueriesKey = "ledgerQueries_" + ledgerId;
			var cachedQueries = CacheController.get(ledgerQueriesKey);
			if (cachedQueries != null) {
				FetchTabView.setQueries(cachedQueries);
				FetchTabView.disableQueryInput(false);
			} else {

				FetchTabView.setQueryInput("");
				FetchTabView.verifyFormState();
				FetchTabView.disableQueryInput(true);
				SidebarView.disableLedgerSelect(true);
				SidebarView.loading(true);
				if (!DEV_MODE) {
					google.script.run.withSuccessHandler(FetchTabActivity.queriesLoaded).withFailureHandler(SidebarView.showError).loadQueries(ledgerId);
				}
			}
			if (DEV_MODE) {
				FetchTabView.setQueries(cachedQueries);
				FetchTabView.disableQueryInput(false);
			}
		} else {
			FetchTabView.hideQueryAutocomplete();
			FetchTabView.disableQueryInput(true);
		}
	},

	fetchQuery : function() {
		FetchTabView.showQueryError(false);
		SidebarView.loading(true);
		var form = FetchTabView.getForm();
		google.script.run.withSuccessHandler(FetchTabActivity.fetched).withFailureHandler(FetchTabView.showQueryError).fetchQuery(form);
	},

	//CALLBACKS
	queriesLoaded : function(ledgerQueries) {
		var queries = ledgerQueries.queries;
		var ledgerId = ledgerQueries.ledgerId;
		var ledgerQueriesKey = "ledgerQueries_" + ledgerId;
		CacheController.put(ledgerQueriesKey, queries);
		FetchTabView.setQueries(queries);
		FetchTabView.disableQueryInput(false);
		SidebarView.disableLedgerSelect(false);
		SidebarView.loading(false);
	},

	fetched : function(ledgers) {
		SidebarView.loading(false);
	},

};
