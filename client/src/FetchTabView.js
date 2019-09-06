var fetchTab;

var FetchTabView = {

	view : {
		fetchButton : $('#fetchButton'),
		queryInput : $('#queryInput'),
		queryError : $('#queryError'),
		fetchTypeRadioGroup : $('#fetch-type-radio-group'),
		balanceTypeRadioGroup : $('#balance-type-radio-group'),
	},

	init : function() {
		fetchTab = this.view;
		FetchTabView.bindUIActions();
	},

	bindUIActions : function() {

		fetchTab.fetchButton.click(FetchTabView.onClickFetchButton);
		fetchTab.queryInput.click(FetchTabView.showQueries);
		fetchTab.queryInput.change(FetchTabView.verifyFormState);
		$('input[name=fetch-type-radio]', fetchTab.fetchTypeRadioGroup).change(FetchTabView.verifyFormState);
		$('input[name=balance-type-radio]', fetchTab.balanceTypeRadioGroup).change(FetchTabView.verifyFormState);
	},

	onClickFetchButton : function() {
		FetchTabActivity.fetchQuery();
	},

	disableFetchButton : function(disable) {
		fetchTab.fetchButton.attr('disabled', disable);
	},

	verifyFormState : function() {

		SidebarView.configureOpenCreateButton();

		var form = FetchTabView.getForm();
		if (form.query == null || form.query.trim() == "") {
			FetchTabView.disableFetchType(true);
			FetchTabView.disableBalanceType(true);
			FetchTabView.disableFetchButton(true);
			return;
		} else {
			FetchTabView.disableFetchType(false);
		}


		if (form.fetchType == "transactions") {
			FetchTabView.disableFetchButton(false);
			FetchTabView.disableBalanceType(true);
			return;
		}

		if (form.fetchType == "balances") {
			FetchTabView.disableBalanceType(false);
		}

		if (form.balanceType != null) {
			FetchTabView.disableFetchButton(false);
		} else {
			FetchTabView.disableFetchButton(true);
		}


	},

	isFetchVisible : function() {
		return fetchTab.queryInput.is(":visible");
	},


	//fetch type
	getFetchType : function() {
		return $("input[name=fetch-type-radio]:checked", fetchTab.fetchTypeRadioGroup).val();
	},

	disableFetchType : function(disable) {
		$("input[name=fetch-type-radio]", fetchTab.fetchTypeRadioGroup).attr('disabled', disable);
	},


	//balance type
	getBalanceType : function() {
		return $("input[name=balance-type-radio]:checked", fetchTab.balanceTypeRadioGroup).val();
	},

	disableBalanceType : function(disable) {
		$("input[name=balance-type-radio]", fetchTab.balanceTypeRadioGroup).attr('disabled', disable);
	},


	//query
	setQueryInput : function(query) {
		fetchTab.queryInput.val(query);
	},

	getQueryInput : function() {
		return fetchTab.queryInput.val();
	},

	disableQueryInput : function(disable) {
		fetchTab.queryInput.attr('disabled', disable);
	},

	hideQueryAutocomplete : function() {
		try {
			fetchTab.queryInput.autocomplete("close");
		} catch (e) {
			// If autocomplete component isn't initialized, it cant be closed;
		}
	},

	showQueries : function() {
		fetchTab.queryInput.autocomplete("search", "");
	},

	isQueryFilled : function() {
		return FetchTabView.getQueryInput() != null && FetchTabView.getQueryInput().length > 1
	},


	setQueries : function(queries) {
		if (DEV_MODE) {
			queries = [
			           {title : 'id1', query:'aaaa', category: 'Group'},
			           {title : 'id2', query:'bbbb', category: 'Group'},
			           {title : 'id3', query:'ccccc', category: 'Account'}
			           ];
		}

		$.widget("custom.catcomplete", $.ui.autocomplete, {
			_renderMenu : function(ul, items) {
				var that = this, currentCategory = "";
				$.each(items, function(index, item) {
					if (item.category != currentCategory) {
						ul.append("<li class='ui-autocomplete-category'>"
								+ item.category + "</li>");
						currentCategory = item.category;
					}
					that._renderItemData(ul, item);
				});
			}
		});

		var widget = fetchTab.queryInput.autocomplete(
				{

					source : function(request, response) {
						var matcher = new RegExp($.ui.autocomplete
								.escapeRegex(request.term), "i");
						var matching = $.grep(queries, function(value) {
							var title = value.title;
							return matcher.test(title);
						});
						response(matching);
					},

					focus : function(event, ui) {
						FetchTabView.setQueryInput(ui.item.query);
						return false;
					},

					minLength : 0,
					delay : 0,
					select : function(event, ui) {
						FetchTabView.setQueryInput(ui.item.query);
						FetchTabView.verifyFormState();
						return false;
					}
				}).data("ui-autocomplete");

		widget._renderItem = function(ul, item) {
			return $("<li>").append("<a>" + item.title + "</a>").appendTo(ul);
		};

		widget._renderMenu = function(ul, items) {
			var that = this, currentCategory = "";
			$.each(items, function(index, item) {
				if (item.category != currentCategory) {
					ul.append("<li class='ui-autocomplete-category'>"
							+ item.category + "</li>");
					currentCategory = item.category;
				}
				that._renderItemData(ul, item);
			});
		}
	},


	showQueryError : function(show) {
		SidebarView.loading(false);
		if (show) {
			fetchTab.queryError.show();
		} else {
			fetchTab.queryError.hide();
		}
	},

	getForm : function() {
		var form = SidebarView.getForm();
		form.query = FetchTabView.getQueryInput();
		form.fetchType = FetchTabView.getFetchType();
		form.balanceType = FetchTabView.getBalanceType();
		return form;
	},

};
