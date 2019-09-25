
namespace RecordTabView {

  var view;

  export function init() {
    view = {
      recordButton: $('#recordButton'),
      highlight: $('#highlight'),
      recordedStatus: $('#recordedStatus'),
    }
    bindUIActions();
  }

  function bindUIActions() {
    view.recordButton.click(onClickRecordButton);
  }

  function onClickRecordButton() {
    RecordTabActivity.recordLines();
  }

  function getHighlight() {
    return view.highlight.is(':checked');
  }

  export function disableRecordButton(disable) {
    view.recordButton.attr('disabled', disable);
  }


  export function notifyTransactionsRecorded() {
    highlightRecordedStatus(true);
    setTimeout(function () { highlightRecordedStatus(false) }, 2000);
  }

  function highlightRecordedStatus(highlight) {
    if (highlight) {
      view.recordedStatus.addClass('recordedStatusHighlighted');
    } else {
      view.recordedStatus.removeClass('recordedStatusHighlighted');
    }
  }

  //GENERAL
  export function getForm() {
    var form = SidebarView.getForm() as any;
    form.highlight = getHighlight();
    return form;
  }

};
