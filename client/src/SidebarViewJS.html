var NO_DATA_URL = "https://storage.googleapis.com/bkper-public/addons/notada-280x172.png";

var DEV_MODE = false;

$(function() {
	SidebarView.init();
	RecordTabView.init();
	FetchTabView.init();

	SidebarActivity.init();
	RecordTabActivity.init();
	FetchTabActivity.init();
});

var view;

var SidebarView = {

	selectedTab : 0,

	view : {
		sidebarWrapper : $('#sidebarWrapper'),
		ledgerSelect : $('#ledgerSelect'),
		createOpenLedgerLink : $('#createOpenLedgerLink'),
		openLinkFetch : $('#openLinkFetch'),
		openLinkRecord : $('#openLinkRecord'),
		opeButton : $('#opeButton'),
		tabBar : $('#tab-bar'),
		tabBarItem1 : $('#tabBarItem1'),
		tabBarItem2 : $('#tabBarItem2'),
		tab2Content : $('#tab2Content'),
		tab1Content : $('#tab1Content'),
		contentWrapper : $('#contentWrapper'),
		generalError : $('#generalError'),
		loadPanel : $('#loadPanel'),

	},

	init : function() {
		view = this.view;
		SidebarView.bindUIActions();
	},

	bindUIActions : function() {
		view.ledgerSelect.change(SidebarView.onLedgerChange);
		view.loadPanel.click(SidebarView.onClickReload);
		view.tabBarItem1.click(SidebarView.onClickTabBarItem1);
		view.tabBarItem2.click(SidebarView.onClickTabBarItem2);
	},

	setLedgers : function(ledgers) {

		if (DEV_MODE) {
			ledgers = [
			           {id : 'id1', name:'My ledger', permission : 'EDITOR', selected: false},
			           {id : 'id2', name:'Company ledger', permission: 'OWNER', selected: true},
			           {id : 'id3', name:'blablabla', permission: 'VIEWER'}
			           ];
		}



		$("option", view.ledgerSelect).remove();
		view.ledgerSelect.append(new Option("Select a book...", ""));

		var ledgerSelected = false;

		$.each(ledgers, function(index, value) {
			var valueJSON = JSON.stringify(value);
			var opt = new Option(value.name, valueJSON);
			if (value.selected) {
				opt.selected = value.selected;
				ledgerSelected = true;

			}
			view.ledgerSelect.append(opt);
		});

		if (ledgerSelected) {
			SidebarView.configureSelectedLedger();
		}
	},

	onClickReload : function() {
		view.generalError.hide();
		SidebarActivity.reload();
		SidebarView.selectRecordTab();
		SidebarView.showContentWrapper(false);
		SidebarView.disableLedgerSelect(true);

		FetchTabView.disableFetchButton(true);
		RecordTabView.disableRecordButton(true);
	},

	onLedgerChange : function() {
		SidebarActivity.saveLastSelectedLedger();
		SidebarView.configureSelectedLedger();
	},

	configureSelectedLedger : function() {
		var ledger = SidebarView.getSelectedLedger();

		FetchTabView.disableFetchButton(true);
		SidebarView.configureOpenCreateButton();

		if (ledger) {
			if (ledger.id) {
				SidebarView.showContentWrapper(true);
				if (ledger.permission != "VIEWER") {
					RecordTabView.disableRecordButton(false);
					SidebarView.showTabBar(true);
				} else {
					SidebarView.selectFetchTab();
					SidebarView.showTabBar(false);
				}
				if (FetchTabView.isFetchVisible()) {
					FetchTabActivity.loadQueries(ledger.id);
				}
			} else {
				RecordTabView.disableRecordButton(true);
				SidebarView.showContentWrapper(false);
			}
		} else {
			RecordTabView.disableRecordButton(true);
			SidebarView.showContentWrapper(false);
		}
	},

	loading : function(loading) {
		if (loading) {
			view.loadPanel.removeClass("loadPanelLoadingLink");
			view.loadPanel.addClass("loadPanelLoading");

		} else {
			view.loadPanel.addClass("loadPanelLoadingLink");
			view.loadPanel.removeClass("loadPanelLoading");
		}
	},

	disableLedgerSelect : function(disable) {
		view.ledgerSelect.attr('disabled', disable);
		SidebarView.configureOpenCreateButton();
	},

	// GENERAL

	configureOpenButton : function(form) {
		var appendQuery = (SidebarView.selectedTab == 1);
		var url = SidebarActivity.getOpenURL(form, appendQuery);
		view.createOpenLedgerLink.attr('href', url);
		$("button", view.createOpenLedgerLink).text('Open');
		$("button", view.createOpenLedgerLink).removeClass('create');

	},

	configureCreateButton : function() {
		view.createOpenLedgerLink.attr('href',
				'https://app.bkper.com/create');
		$("button", view.createOpenLedgerLink).text('Create');
		$("button", view.createOpenLedgerLink).addClass('create');
	},

	configureOpenCreateButton : function() {
		var form = FetchTabView.getForm();
		var ledgerId = form.ledgerId;

		if (ledgerId != null && ledgerId.trim() != "") {
			SidebarView.configureOpenButton(form);
		} else {
			SidebarView.configureCreateButton();
		}
	},

	showError : function(msg) {
		SidebarView.disableLedgerSelect(true);
		SidebarView.loading(false);
		view.generalError.show();
	},

	onClickTabBarItem1 : function() {
		SidebarView.selectRecordTab();
	},

	onClickTabBarItem2 : function() {
		SidebarView.selectFetchTab();
	},

	selectRecordTab : function() {
		SidebarView.selectedTab = 0;
		view.tabBarItem1.addClass("tab-bar-item-selected");
		view.tabBarItem2.removeClass("tab-bar-item-selected");
		view.tab2Content.removeClass("hiddenContent");
		view.tab1Content.addClass("hiddenContent");
		SidebarView.configureOpenCreateButton();
	},

	selectFetchTab : function() {
		SidebarView.selectedTab = 1;
		var ledger = SidebarView.getSelectedLedger();
		FetchTabView.disableFetchButton(true);
		if (ledger) {
			FetchTabActivity.loadQueries(ledger.id);
			view.tabBarItem2.addClass("tab-bar-item-selected");
			view.tabBarItem1.removeClass("tab-bar-item-selected");
			view.tab1Content.removeClass("hiddenContent");
			view.tab2Content.addClass("hiddenContent");
		}
	},

	getSelectedLedger : function() {
		var ledgerJSON = view.ledgerSelect.val();
		if (ledgerJSON) {
			var ledger = JSON.parse(ledgerJSON);
			return ledger;
		}
		return null;
	},


	showContentWrapper : function(show) {
		if (show) {
			view.contentWrapper.show();
		} else {
			view.contentWrapper.hide();
		}
	},

	showSidebarWrapper : function(show) {
		if (show) {
			view.sidebarWrapper.show();
		} else {
			view.sidebarWrapper.hide();
		}
	},

	showTabBar : function(show) {
		if (show) {
			view.tabBar.show();
		} else {
			view.tabBar.hide();
		}
	},

	disableRadio : function(radio) {
		radio.attr('disabled', true);
		radio.prop('checked', false);
	},

	enableRadio : function(radio) {
		radio.attr('disabled', false);
	},

	getForm : function() {
		var ledger = SidebarView.getSelectedLedger();
		var ledgerkey = "";
		if (ledger != null) {
			ledgerkey = ledger.id;
		}
		var form = {
			ledgerId : ledgerkey,
		}
		return form;
	},
};
