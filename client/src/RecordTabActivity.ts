namespace RecordTabActivity {

	export function init() {

	}

	export function recordLines() {
		SidebarView.loading(true);
		RecordTabView.disableRecordButton(true);
		google.script.run.withSuccessHandler(recorded).withFailureHandler(SidebarView.showError).recordLines(RecordTabView.getForm().ledgerId, RecordTabView.getForm().highlight);
	}

	function recorded(recorded) {
		SidebarView.loading(false);
		RecordTabView.disableRecordButton(false);
		if (recorded) {
			RecordTabView.notifyTransactionsRecorded();
		}
	}

};
