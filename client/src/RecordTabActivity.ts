namespace RecordTabActivity {

	export function init() {

	}

	export function recordLines() {
		SidebarView.loading(true);
		RecordTabView.disableRecordButton(true);
		google.script.run.withSuccessHandler(recorded).withFailureHandler(SidebarView.showError).saveLines(RecordTabView.getForm());
	}

	function recorded(recorded) {
		SidebarView.loading(false);
		RecordTabView.disableRecordButton(false);
		if (recorded) {
			RecordTabView.notifyTransactionsRecorded();
		}
	}

};
