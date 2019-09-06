
var DEV_MODE = false;

$(function () {
  AutoRecordView.init();
  AutoRecordActivity.init();
});

namespace AutoRecordView {

  var view;

  export function init () {
    
    view = {
      onOffLabel: $('#onOffLabel'),
      waiting: $('#waiting'),
      onOffButton: $('#onOffButton'),
      bookName: $('#bookName'),
    }

    bindUIActions();
  }

  function bindUIActions() {
    view.onOffButton.change(autoRecordChanged);
  }

  function autoRecordChanged(event, detail, sender) {
    AutoRecordActivity.toggle();
  }

  export function setEnabled(enabled, bookName) {
    view.onOffLabel.show();
    view.onOffButton.show();
    view.onOffButton.attr("checked", enabled);
    setBookName(bookName);

    if (enabled) {
      setOnOffLabel("YES");
    } else {
      setOnOffLabel("NO");
    }
  }

  export function setOnOffLabel(text) {
    view.onOffLabel.text(text);
  }

  function setBookName(bookName) {
    view.bookName.text(bookName);
  }

  export function waiting(waiting) {

    if (waiting) {
      view.waiting.show();
      view.onOffLabel.hide();
    } else {
      view.waiting.hide();
      view.onOffLabel.show();
    }
  }

};


