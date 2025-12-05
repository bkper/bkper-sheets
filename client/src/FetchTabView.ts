
namespace FetchTabView {

  var QUERY_CATEGORY_STATUS_ = "Status";

  var view;

  export function init() {
    view = {
      fetchButton: $('#fetchButton'),
      queryInput: $('#queryInput'),
      queryError: $('#queryError'),
      fetchTypeRadioGroup: $('#fetch-type-radio-group'),
      balanceTypeRadioGroup: $('#balance-type-radio-group'),
      expanded: $('#expanded'),
      transposed: $('#transposed'),
      properties: $('#properties'),
      groups: $('#groups'),
      fetchOptionRadioGroup: $('#fetch-option-radio-group')
    }
    bindUIActions();
  }

  function bindUIActions() {
    view.fetchButton.click(onClickFetchButton);
    view.queryInput.click(showQueries);
    view.queryInput.change(verifyFormState);
    view.queryInput.blur(verifyFormState);
    $('input[name=fetch-type-radio]', view.fetchTypeRadioGroup).change(fetchTypeRadioChanged);
    $('input[name=balance-type-radio]', view.balanceTypeRadioGroup).change(verifyFormState);
  }

  function fetchTypeRadioChanged() {
    var ledgerId = SidebarView.getSelectedLedgerId();
    FetchTabActivity.loadQueries(ledgerId);
  }

  function onClickFetchButton() {
    FetchTabActivity.fetchQuery();
  }

  export function disableFetchButton(disable) {
    view.fetchButton.attr('disabled', disable);
  }

  function disableExpanded(disable) {
    disableInput(disable, view.expanded);
  }
  function disableTransposed(disable) {
    disableInput(disable, view.transposed);
  }
  function disableProperties(disable) {
    disableInput(disable, view.properties);
  }
  function disableGroups(disable) {
    disableInput(disable, view.groups);
  }

  function disableFetchOption(disable) {
    disableInput(disable, view.fetchOptionRadioGroup);
  }

  function resetOptionalParams() {
    $('input:checkbox:not("#highlight")').prop('checked', false);
  }
  function resetBalancesOptions() {
    $("input[name=balance-type-radio]:checked").prop('checked', false);
  }
  function resetQuery() {
    $("#queryInput").val('');
  }

  function autoSelectBalanceOption() {
    $("#balance-type-radio-total").prop('checked', true);
  }

  export function verifyFormState() {

    SidebarView.configureOpenCreateButton();
    
    resetOptionalParams();

    var form: any = getForm();

    disableQueryInput(true)
    disableBalanceType(true);
    disableExpanded(true);
    disableTransposed(true);
    disableProperties(true);
    disableGroups(true);
    disableFetchOption(true);
    disableFetchButton(true);

    if (form.fetchType == "accounts") {
      disableProperties(false);
      disableGroups(false);
      disableFetchOption(false);
      disableFetchButton(false);

      resetBalancesOptions();
      resetQuery();
      return;
    }

    if (form.fetchType == "groups") {
      disableProperties(false);
      disableFetchOption(false);
      disableFetchButton(false);

      resetBalancesOptions();
      resetQuery();
      return;
    }

    if (form.fetchType == "transactions") {

      disableQueryInput(false)
      disableProperties(false);

      resetBalancesOptions();

      if (form.query != null && form.query.trim() != "") {
        disableFetchOption(false);
        disableFetchButton(false);
      }

      return;
    }

    if (form.fetchType == "balances") {

      disableQueryInput(false)
      disableBalanceType(false);
      disableTransposed(false);

      if (form.query.indexOf("group:") >= 0) {
        disableExpanded(false);
      } else {
        setExpanded(false)
      }

      if (form.balanceType == null) {
        autoSelectBalanceOption();
      }

      if (form.balanceType == 'PERIOD' || form.balanceType == 'CUMULATIVE') {
        setTransposed(true);
      }

      disableFetchOption(false);
      disableFetchButton(false);



      return;
    }

  }

  export function isQuerySearchEnabled() {
    var form: any = getForm();
    return form.fetchType == "transactions" || form.fetchType == "balances";
  }

  //fetch type
  function getFetchType(): "transactions" | "balances" | "accounts" | "groups" {
    //@ts-ignore
    return $("input[name=fetch-type-radio]:checked", view.fetchTypeRadioGroup).val();
  }

  //balance type
  function getBalanceType(): "CUMULATIVE" | "PERIOD" | "TOTAL" {
    //@ts-ignore
    return $("input[name=balance-type-radio]:checked", view.balanceTypeRadioGroup).val();
  }

  function disableBalanceType(disable) {
    let el = $("input[name=balance-type-radio]", view.balanceTypeRadioGroup);
    disableInput(disable, el);
  }

  function getExpanded(): boolean | number {
    var expanded = view.expanded.find(":selected").val();
    if (expanded == "true") {
        return true;
    }
    if (expanded == "false") {
        return false;
    }
    return +expanded;
  }

  function setExpanded(expanded: boolean|number):void {
    view.expanded.val(expanded + '');
  }

  function getTransposed(): boolean {
    return view.transposed.is(":checked")
  }

  function setTransposed(transposed: boolean) {
    view.transposed.prop('checked', transposed);
  }

  function getGroups(): boolean {
    return view.groups.is(":checked");
  }

  function getProperties(): boolean {
    return view.properties.is(":checked");
  }

  function getIds(): boolean {
    return $("input[name=fetch-type-radio]:checked", view.fetchTypeRadioGroup).val() === "transactions";
  }

  export function shouldFetchValues(): boolean {
    return $("input[name=fetch-option-radio]:checked", view.fetchOptionRadioGroup).val() === "VALUES" ? true : false;
  }

  //query
  export function setQueryInput(query) {
    view.queryInput.val(query);
  }

  function getQueryInput() {
    return view.queryInput.val();
  }

  export function disableQueryInput(disable) {
    disableInput(disable, view.queryInput);    
  }

  function disableInput(disable: any, el: any) {
    if (disable) {
      // el.parent().css('visibility', 'hidden');
      el.attr("disabled", true);
    } else {
      // el.parent().css('visibility', 'visible');
      el.removeAttr("disabled");
    }
  }

  export function hideQueryAutocomplete() {
    try {
      view.queryInput.autocomplete("close");
    } catch (e) {
      // If autocomplete component isn't initialized, it cant be closed;
    }
  }

  function showQueries() {
    view.queryInput.autocomplete("search", "");
  }

  export function setQueries(queries) {
    if (DEV_MODE) {
      queries = [
        { title: 'id1', query: 'aaaa', category: 'Group' },
        { title: 'id2', query: 'bbbb', category: 'Group' },
        { title: 'id3', query: 'ccccc', category: 'Account' }
      ];
    }

    //@ts-ignore
    $.widget("custom.catcomplete", $.ui.autocomplete, {
      _renderMenu: function (ul, items) {
        var that = this, currentCategory = "";
        $.each(items, function (index, item) {
          if (item.category != currentCategory) {
            ul.append("<li class='ui-autocomplete-category'>"
              + item.category + "</li>");
            currentCategory = item.category;
          }
          that._renderItemData(ul, item);
        });
      }
    });

    var widget = view.queryInput.autocomplete(
      {

        source: function (request, response) {
          //@ts-ignore
          var matcher = new RegExp($.ui.autocomplete
            .escapeRegex(request.term), "i");
          var filteredQueries = queries;
          if (getFetchType() !== "transactions") {
            filteredQueries = queries.filter((q: any) => q.category !== QUERY_CATEGORY_STATUS_);
          }
          var matching = $.grep(filteredQueries, function (value: any) {
            var title = value.title;
            return matcher.test(title);
          });
          response(matching);
        },

        focus: function (event, ui) {
          setQueryInput(ui.item.query);
          return false;
        },

        minLength: 0,
        delay: 0,
        select: function (event, ui) {
          setQueryInput(ui.item.query);
          verifyFormState();
          return false;
        }
      }).data("ui-autocomplete");

    widget._renderItem = function (ul, item) {
      return $("<li>").append("<a>" + item.title + "</a>").appendTo(ul);
    };

    widget._renderMenu = function (ul, items) {
      var that = this, currentCategory = "";
      $.each(items, function (index, item) {
        if (item.category != currentCategory) {
          ul.append("<li class='ui-autocomplete-category'>"
            + item.category + "</li>");
          currentCategory = item.category;
        }
        that._renderItemData(ul, item);
      });
    }
  }


  export function showQueryError(show) {
    SidebarView.loading(false);
    if (show) {
      view.queryError.show();
    } else {
      view.queryError.hide();
    }
  }

  export function getForm(): google.script.FetchStatement {
    var form = SidebarView.getForm() as google.script.FetchStatement;
    form.query = getQueryInput();
    form.fetchType = getFetchType();
    form.balanceType = getBalanceType();
    form.expanded = getExpanded();
    form.transposed = getTransposed();
    form.groups = getGroups();
    form.properties = getProperties();
    form.ids = getIds();
    return form;
  }

};
