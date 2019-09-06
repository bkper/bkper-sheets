var recordTab;

var RecordTabView = {

	view : {
		recordButton : $('#recordButton'),
		highlight : $('#highlight'),
		recordedStatus : $('#recordedStatus'),
	},

	init : function() {
		recordTab = this.view;
		RecordTabView.bindUIActions();
	},

	bindUIActions : function() {
		recordTab.recordButton.click(RecordTabView.onClickRecordButton);
	},

	onClickRecordButton : function() {
		RecordTabActivity.recordLines();
	},

	getHighlight : function() {
		return recordTab.highlight.is(':checked');
	},

	disableRecordButton : function(disable) {
		recordTab.recordButton.attr('disabled', disable);
	},


    notifyTransactionsRecorded : function() {
    	RecordTabView.highlightRecordedStatus(true);
        setTimeout(function(){RecordTabView.highlightRecordedStatus(false)}, 2000);
	},

    highlightRecordedStatus : function(highlight) {
		if (highlight) {
			recordTab.recordedStatus.addClass('recordedStatusHighlighted');
		} else {
			recordTab.recordedStatus.removeClass('recordedStatusHighlighted');
		}
	},

	//GENERAL
	getForm : function() {
		var form = SidebarView.getForm();
		form.highlight = RecordTabView.getHighlight();
		return form;
	},

};
