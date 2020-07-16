var NO_DATA_URL = "https://storage.googleapis.com/bkper-public/addons/notada-280x172.png";

var DEV_MODE = false;

$(function() {
	SidebarView.init();
	SaveTabView.init();
	FetchTabView.init();

	SidebarActivity.init();
	SaveTabActivity.init();
	FetchTabActivity.init();
});

 namespace SidebarView {

	var selectedTab = 0;

	var view;

	export function init() {

		view = {
      sidebarWrapper: $('#sidebarWrapper'),
      ledgerSelect: $('#ledgerSelect'),
      createOpenLedgerLink: $('#createOpenLedgerLink'),
      openLinkFetch: $('#openLinkFetch'),
      openLinkRecord: $('#openLinkRecord'),
      opeButton: $('#opeButton'),
      tabBar: $('#tab-bar'),
      tabBarItem1: $('#tabBarItem1'),
      tabBarItem2: $('#tabBarItem2'),
      tab2Content: $('#tab2Content'),
      tab1Content: $('#tab1Content'),
      contentWrapper: $('#contentWrapper'),
      generalError: $('#generalError'),
      loadPanel: $('#loadPanel'),
    };

		bindUIActions();
	}

	function bindUIActions() {
		view.ledgerSelect.change(onLedgerChange);
		view.loadPanel.click(onClickReload);
		view.tabBarItem1.click(onClickTabBarItem1);
		view.tabBarItem2.click(onClickTabBarItem2);
	}

	export function setLedgers(ledgers?) {

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
			configureSelectedLedger();
		}
	}

	function onClickReload() {
		view.generalError.hide();
		SidebarActivity.reload();
		selectRecordTab();
		showContentWrapper(false);
		disableLedgerSelect(true);

		FetchTabView.disableFetchButton(true);
		SaveTabView.disableRecordButton(true);
	}

	function onLedgerChange() {
		SidebarActivity.saveLastSelectedLedger();
		configureSelectedLedger();
	}

	function configureSelectedLedger() {
		var ledger = getSelectedLedger();

		FetchTabView.disableFetchButton(true);
		configureOpenCreateButton();

		if (ledger) {
			if (ledger.id) {
				showContentWrapper(true);
				if (ledger.permission != "VIEWER") {
					SaveTabView.disableRecordButton(false);
					showTabBar(true);
				} else {
					selectFetchTab();
					showTabBar(false);
        }
        if (FetchTabView.isQuerySearchEnabled()) {
					FetchTabActivity.loadQueries(ledger.id);
				}
			} else {
				SaveTabView.disableRecordButton(true);
				showContentWrapper(false);
			}
		} else {
			SaveTabView.disableRecordButton(true);
			showContentWrapper(false);
		}
	}

	export function loading(loading) {
		if (loading) {
			view.loadPanel.removeClass("loadPanelLoadingLink");
			view.loadPanel.addClass("loadPanelLoading");

		} else {
			view.loadPanel.addClass("loadPanelLoadingLink");
			view.loadPanel.removeClass("loadPanelLoading");
		}
	}

	export function disableLedgerSelect(disable) {
		view.ledgerSelect.attr('disabled', disable);
		configureOpenCreateButton();
	}

	// GENERAL

	function configureOpenButton(form) {
		var appendQuery = (selectedTab == 1);
		var url = SidebarActivity.getOpenURL(form, appendQuery);
		view.createOpenLedgerLink.attr('href', url);
		$("button", view.createOpenLedgerLink).text('Open');
		$("button", view.createOpenLedgerLink).removeClass('create');

	}

	function configureCreateButton() {
		view.createOpenLedgerLink.attr('href',
				'https://app.bkper.com/create');
		$("button", view.createOpenLedgerLink).text('Create');
		$("button", view.createOpenLedgerLink).addClass('create');
	}

	export function configureOpenCreateButton() {
		var form = FetchTabView.getForm();
		var ledgerId = form.ledgerId;

		if (ledgerId != null && ledgerId.trim() != "") {
			configureOpenButton(form);
		} else {
			configureCreateButton();
		}
	}

	export function showError() {
		disableLedgerSelect(true);
		loading(false);
		view.generalError.show();
	}

	function onClickTabBarItem1() {
		selectRecordTab();
	}

	function onClickTabBarItem2() {
		selectFetchTab();
	}

	function selectRecordTab() {
		selectedTab = 0;
		view.tabBarItem1.addClass("tab-bar-item-selected");
		view.tabBarItem2.removeClass("tab-bar-item-selected");
		view.tab2Content.removeClass("hiddenContent");
		view.tab1Content.addClass("hiddenContent");
		configureOpenCreateButton();
	}

	function selectFetchTab() {
		selectedTab = 1;
		var ledger = getSelectedLedger();
    FetchTabView.verifyFormState();
		if (ledger) {
			view.tabBarItem2.addClass("tab-bar-item-selected");
			view.tabBarItem1.removeClass("tab-bar-item-selected");
			view.tab1Content.removeClass("hiddenContent");
			view.tab2Content.addClass("hiddenContent");
		}
	}

	export function getSelectedLedger() {
		var ledgerJSON = view.ledgerSelect.val();
		if (ledgerJSON) {
			var ledger = JSON.parse(ledgerJSON);
			return ledger;
		}
		return null;
	}


	function showContentWrapper(show) {
		if (show) {
			view.contentWrapper.show();
		} else {
			view.contentWrapper.hide();
		}
	}

	export function showSidebarWrapper(show) {
		if (show) {
			view.sidebarWrapper.show();
		} else {
			view.sidebarWrapper.hide();
		}
	}

	function showTabBar(show) {
		if (show) {
			view.tabBar.show();
		} else {
			view.tabBar.hide();
		}
	}


	export function getForm(): {ledgerId: string} {
		var ledger = getSelectedLedger();
		var ledgerkey = "";
		if (ledger != null) {
			ledgerkey = ledger.id;
		}
		var form = {
			ledgerId : ledgerkey,
		}
		return form;
	}
};
