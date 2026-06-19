namespace SidebarActivity {
    var saveRetries = 0;
    var GOOGLE_SHEETS_ADDON_SOURCE = 'google_sheets_addon';

    export function init() {
        if (DEV_MODE) {
            SidebarView.setLedgers([]);
            SidebarView.showSidebarWrapper(true);
            SidebarView.disableLedgerSelect(false);
        } else {
            loadLedgers();
        }
    }

    //SERVICE FUNCTIONS
    function loadLedgers() {
        google.script.run
            .withSuccessHandler(ledgersLoaded)
            .withFailureHandler(SidebarView.showError)
            .loadLedgers();
    }

    export function insertBookId(bookId: string) {
        SidebarView.loading(true);
        google.script.run
            .withSuccessHandler(() => SidebarView.loading(false))
            .withFailureHandler(SidebarView.showError)
            .insertBookId(bookId);
    }

    export function loadBookId() {
        SidebarView.disableLedgerSelect(true);
        google.script.run
            .withSuccessHandler(SidebarView.setSelectedLedger)
            .withFailureHandler(SidebarView.showError)
            .loadBookId();
    }

    export function saveLastSelectedLedger() {
        var ledgerId = SidebarView.getSelectedLedgerId();
        google.script.run
            .withSuccessHandler(lastSelectedLedgerSaved)
            .withFailureHandler(lastSelectedLedgerSavedError)
            .saveLastSelectedLedger(ledgerId);
    }

    export function reload() {
        SidebarView.loading(true);
        CacheController.clear();
        loadLedgers();
    }

    function ledgersLoaded(ledgers) {
        saveRetries = 0;
        SidebarView.setLedgers(ledgers);
        SidebarView.showSidebarWrapper(true);
        if (ledgers.length > 0) {
            SidebarView.disableLedgerSelect(false);
        }
        SidebarView.loading(false);
    }

    function lastSelectedLedgerSaved() {
        saveRetries = 0;
    }

    function lastSelectedLedgerSavedError() {
        if (saveRetries < 10) {
            saveRetries++;
            saveLastSelectedLedger();
        } else {
            SidebarView.showError('Error. Refresh pressing button below.');
        }
    }

    function fetched(ledgers) {
        SidebarView.loading(false);
    }

    function isFormFullfilled(form) {
        return form.ledgerId != null && form.ledgerId.trim() != '';
    }

    export function getOpenURL(form, isFetch) {
        var url = new URL('https://bkper.app/books/' + encodeURIComponent(form.ledgerId) + '/transactions');
        if (isFetch && form.query != null && form.query.trim() != '') {
            url.searchParams.set('query', form.query);
        }
        if (isFetch && form.fetchType == 'balances') {
            url.searchParams.set('charts', 'true');
        }
        appendGoogleSheetsAddonAttribution(url, 'open_book_button', true);
        return url.toString();
    }

    export function getCreateURL() {
        var url = new URL('https://app.bkper.com/create');
        appendGoogleSheetsAddonAttribution(url, 'open_book_button', false);
        return url.toString();
    }

    function appendGoogleSheetsAddonAttribution(url: URL, utmContent: string, includeLegacySource: boolean) {
        if (includeLegacySource) {
            url.searchParams.set('source', GOOGLE_SHEETS_ADDON_SOURCE);
        }
        url.searchParams.set('utm_source', GOOGLE_SHEETS_ADDON_SOURCE);
        url.searchParams.set('utm_medium', 'addon');
        url.searchParams.set('utm_content', utmContent);
    }
}
