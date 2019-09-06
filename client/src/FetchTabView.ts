
namespace FetchTabView {

  var view;

  export function init() {
    view = {
      fetchButton: $('#fetchButton'),
      queryInput: $('#queryInput'),
      queryError: $('#queryError'),
      fetchTypeRadioGroup: $('#fetch-type-radio-group'),
      balanceTypeRadioGroup: $('#balance-type-radio-group'),
    }
    bindUIActions();
  }

  function bindUIActions() {

    view.fetchButton.click(onClickFetchButton);
    view.queryInput.click(showQueries);
    view.queryInput.change(verifyFormState);
    $('input[name=fetch-type-radio]', view.fetchTypeRadioGroup).change(verifyFormState);
    $('input[name=balance-type-radio]', view.balanceTypeRadioGroup).change(verifyFormState);
  }

  function onClickFetchButton() {
    FetchTabActivity.fetchQuery();
  }

  export function disableFetchButton(disable) {
    view.fetchButton.attr('disabled', disable);
  }

  export function verifyFormState() {

    SidebarView.configureOpenCreateButton();

    var form: any = getForm();
    if (form.query == null || form.query.trim() == "") {
      disableFetchType(true);
      disableBalanceType(true);
      disableFetchButton(true);
      return;
    } else {
      disableFetchType(false);
    }


    if (form.fetchType == "transactions") {
      disableFetchButton(false);
      disableBalanceType(true);
      return;
    }

    if (form.fetchType == "balances") {
      disableBalanceType(false);
    }

    if (form.balanceType != null) {
      disableFetchButton(false);
    } else {
      disableFetchButton(true);
    }

  }

  export function isFetchVisible() {
    return view.queryInput.is(":visible");
  }


  //fetch type
  function getFetchType() {
    return $("input[name=fetch-type-radio]:checked", view.fetchTypeRadioGroup).val();
  }

  function disableFetchType(disable) {
    $("input[name=fetch-type-radio]", view.fetchTypeRadioGroup).attr('disabled', disable);
  }


  //balance type
  function getBalanceType() {
    return $("input[name=balance-type-radio]:checked", view.balanceTypeRadioGroup).val();
  }

  function disableBalanceType(disable) {
    $("input[name=balance-type-radio]", view.balanceTypeRadioGroup).attr('disabled', disable);
  }


  //query
  export function setQueryInput(query) {
    view.queryInput.val(query);
  }

  function getQueryInput() {
    return view.queryInput.val();
  }

  export function disableQueryInput(disable) {
    view.queryInput.attr('disabled', disable);
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

  function isQueryFilled() {
    return getQueryInput() != null && getQueryInput().length > 1
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
          var matching = $.grep(queries, function (value: any) {
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

  export function getForm() {
    var form = SidebarView.getForm();
    form.query = getQueryInput();
    form.fetchType = getFetchType();
    form.balanceType = getBalanceType();
    return form;
  }

};
