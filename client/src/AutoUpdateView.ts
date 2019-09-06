
var DEV_MODE = false;

$(function () {
  AutoUpdateView.init();
  AutoUpdateActivity.init();
});

namespace AutoUpdateView {

  var view = {
    onOffLabel: $('#onOffLabel'),
    waiting: $('#waiting'),
    onOffButton: $('#onOffButton'),
    statusPanel: $('#statusPanel'),
    statusText: $('#statusText'),
  }

  export function init() {
    bindUIActions();
  }

  function bindUIActions() {
    view.onOffButton.change(autoUpdateChanged);
  }

  function autoUpdateChanged(event, detail, sender) {
    AutoUpdateActivity.toggle();
  }

  export function setEnabled(enabled, statusText) {
    view.onOffLabel.show();
    view.onOffButton.show();
    view.onOffButton.attr("checked", enabled);
    showStatusPanel(true);
    setStatusText(statusText);

    if (enabled) {
      setOnOffLabel("YES");
    } else {
      setOnOffLabel("NO");
    }
  }

  export function setOnOffLabel(text) {
    view.onOffLabel.text(text);
  }

  function setStatusText(text) {
    view.statusText.text(text);
  }

  function showStatusPanel(show) {
    if (show) {
      view.statusPanel.show();
    } else {
      view.statusPanel.hide();
    }
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


