namespace RecordTabActivity {

	export function init() {

	}

	export function recordLines() {
		SidebarView.loading(true);
		RecordTabView.disableRecordButton(true);
		google.script.run.withSuccessHandler(recorded).withFailureHandler(handleRecordError).saveLines(RecordTabView.getForm());
	}

	function handleRecordError(error) {
		RecordTabView.disableRecordButton(false);
		SidebarView.showError(error);
	}

	function recorded(recorded) {
		SidebarView.loading(false);
		RecordTabView.disableRecordButton(false);
		if (recorded) {
			RecordTabView.notifyTransactionsRecorded();
		}
	}

};
