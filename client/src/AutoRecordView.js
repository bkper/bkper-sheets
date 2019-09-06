
var DEV_MODE = false;


$(function () {
  AutoRecordView.init();
  AutoRecordActivity.init();
});


var view;

var AutoRecordView = {

  view: {
    onOffLabel: $('#onOffLabel'),
    waiting: $('#waiting'),
    onOffButton: $('#onOffButton'),
    bookName: $('#bookName'),
  },

  init: function () {
    view = this.view;
    AutoRecordView.bindUIActions();
  },

  bindUIActions: function () {
    view.onOffButton.change(AutoRecordView.autoRecordChanged);
  },

  autoRecordChanged: function (event, detail, sender) {
    AutoRecordActivity.toggle();
  },

  setEnabled: function (enabled, bookName) {
    view.onOffLabel.show();
    view.onOffButton.show();
    view.onOffButton.attr("checked", enabled);
    AutoRecordView.setBookName(bookName);

    if (enabled) {
      AutoRecordView.setOnOffLabel("YES");
    } else {
      AutoRecordView.setOnOffLabel("NO");
    }
  },

  setOnOffLabel: function (text) {
    view.onOffLabel.text(text);
  },

  setBookName: function (bookName) {
    view.bookName.text(bookName);
  },

  waiting: function (waiting) {

    if (waiting) {
      view.waiting.show();
      view.onOffLabel.hide();
    } else {
      view.waiting.hide();
      view.onOffLabel.show();
    }
  },

};


