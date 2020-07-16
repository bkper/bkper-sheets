namespace SaveTabActivity {

	export function init() {

	}

	export function recordLines() {
		SidebarView.loading(true);
		SaveTabView.disableRecordButton(true);
		google.script.run.withSuccessHandler(recorded).withFailureHandler(SidebarView.showError).saveLines(SaveTabView.getForm());
	}

	function recorded(recorded) {
		SidebarView.loading(false);
		SaveTabView.disableRecordButton(false);
		if (recorded) {
			SaveTabView.notifyTransactionsRecorded();
		}
	}

};
