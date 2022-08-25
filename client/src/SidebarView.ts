var NO_DATA_URL = "https://storage.googleapis.com/bkper-public/addons/notada-280x172.png";

var DEV_MODE = false;

var cachedLedgers = {};

$(function() {
	SidebarView.init();
	RecordTabView.init();
	FetchTabView.init();

	SidebarActivity.init();
	RecordTabActivity.init();
	FetchTabActivity.init();
});

 namespace SidebarView {

	var selectedTab = 0;

     var view: {
         sidebarWrapper: JQuery,
         ledgerSelect: JQuery,
         newLedgerButton: JQuery,
         openLinkFetch: JQuery,
         openLinkRecord: JQuery,
         opeButton: JQuery,
         tabBar: JQuery,
         tabBarItem1: JQuery,
         tabBarItem2: JQuery,
         tab2Content: JQuery,
         tab1Content: JQuery,
         contentWrapper: JQuery,
         generalError: JQuery,
         loadPanel: JQuery
     };

	export function init() {

	view = {
      sidebarWrapper: $('#sidebarWrapper'),
      ledgerSelect: $('#ledgerSelect'),
      newLedgerButton: $('#newLedgerButton'),
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
		view.newLedgerButton.on("mouseenter", onMouseEnterOpenCreateButton);
		view.newLedgerButton.on("mouseleave", onMouseLeaveOpenCreateButton);
		view.newLedgerButton.on("click", onClickOpenCreateButton);
		view.ledgerSelect.on("change", onLedgerChange);
		view.loadPanel.on("click", onClickReload);
		view.tabBarItem1.on("click", onClickTabBarItem1);
		view.tabBarItem2.on("click", onClickTabBarItem2);
	}

	export function setLedgers(ledgers: google.script.ClientBook[]) {

		if (DEV_MODE) {
			ledgers = [
			           {id : 'id1', name:'My ledger', viewer : false, selected: false},
			           {id : 'id2', name:'Company ledger', viewer: false, selected: true},
			           {id : 'id3', name:'blablabla', viewer: true, selected: false}
			           ];
		}
        cachedLedgers = {}
        for (const ledger of ledgers) {
            cachedLedgers[ledger.id] = ledger;
        }


		$("option", view.ledgerSelect).remove();
		view.ledgerSelect.append(new Option("Select a book...", ""));

		var ledgerSelected = false;

		$.each(ledgers, function(index, value) {
			var opt = new Option(value.name, value.id);
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
		RecordTabView.disableRecordButton(true);
	}

    export function setSelectedLedger(ledgerId: string) {
        disableLedgerSelect(false)
        if (!ledgerId) {
            return;
        }
        if (view.ledgerSelect.find(`option[value="${ledgerId}"]`).length > 0) {
            view.ledgerSelect.val(ledgerId).trigger("change");
        }
    }

	function onLedgerChange() {
		SidebarActivity.saveLastSelectedLedger();
		configureSelectedLedger();
	}

	function configureSelectedLedger() {
		var ledgerId = getSelectedLedgerId();

		FetchTabView.disableFetchButton(true);
		configureOpenCreateButton();

        if (ledgerId) {
                showContentWrapper(true);
                if (cachedLedgers[ledgerId] && cachedLedgers[ledgerId].viewer) {
                    RecordTabView.disableRecordButton(false);
                    showTabBar(true);
                } else {
                    selectFetchTab();
                    showTabBar(false);
                }
                if (FetchTabView.isQuerySearchEnabled()) {
                    FetchTabActivity.loadQueries(ledgerId);
                }
        } else {
            RecordTabView.disableRecordButton(true);
            showContentWrapper(false);
        }
	}

	export function loading(loading: boolean) {
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

    function onMouseEnterOpenCreateButton(event: JQuery.Event) {
        if (event.shiftKey) {
            var ledgerId = FetchTabView.getForm().ledgerId;
            if (ledgerId != null && ledgerId.trim() != "") {
                view.newLedgerButton.text('Insert');
                view.newLedgerButton.removeClass('create');
            }
        } else if (event.altKey) {
            view.newLedgerButton.text('Load');
            view.newLedgerButton.removeClass('create');
        }
    }

    function onMouseLeaveOpenCreateButton(event: JQuery.Event) {
        configureOpenCreateButton();
    }


    function onClickOpenCreateButton(event: JQuery.Event) {
        var form = FetchTabView.getForm();
		var ledgerId = form.ledgerId;

        if (event.shiftKey) {
            if (ledgerId != null && ledgerId.trim() != "") {
                event.preventDefault();
                SidebarActivity.insertBookId(ledgerId);
            }
        } else if (event.altKey) {
            event.preventDefault();
            SidebarActivity.loadBookId();
        } else {
            if (ledgerId != null && ledgerId.trim() != "") {
                var appendQuery = (selectedTab == 1);
                var url = SidebarActivity.getOpenURL(form, appendQuery);
                openInNewTab(url)
            } else {
                var url = 'https://app.bkper.com/create';
                openInNewTab(url)
            }
        }


    }

    function openInNewTab(url: string) {
        window.open(url, '_blank').focus();
       }

	export function configureOpenCreateButton() {
		var ledgerId = FetchTabView.getForm().ledgerId;
		if (ledgerId != null && ledgerId.trim() != "") {
            view.newLedgerButton.text('Open');
            view.newLedgerButton.removeClass('create');
		} else {
            view.newLedgerButton.text('Create');
            view.newLedgerButton.addClass('create');
		}
	}

	export function showError(error) {
		disableLedgerSelect(true);
		loading(false);
    view.generalError.text(error)
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
		var ledgerId = getSelectedLedgerId();
    FetchTabView.verifyFormState();
		if (ledgerId) {
			view.tabBarItem2.addClass("tab-bar-item-selected");
			view.tabBarItem1.removeClass("tab-bar-item-selected");
			view.tab1Content.removeClass("hiddenContent");
			view.tab2Content.addClass("hiddenContent");
		}
	}

	export function getSelectedLedgerId(): string {
		return view.ledgerSelect.val() as string;
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
		var form = {
			ledgerId : getSelectedLedgerId(),
		}
		return form;
	}
};
