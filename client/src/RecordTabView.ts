
namespace RecordTabView {

  var view;

  export function init() {
    view = {
      recordButton: $('#recordButton'),
      highlight: $('#highlight'),
      recordedStatus: $('#recordedStatus'),
      recordTypeRadioGroup: $('#record-type-radio-group'),
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


  //fetch type
  function getRecordType(): "transactions" | "accounts" {
    //@ts-ignore
    return $("input[name=record-type-radio]:checked", view.recordTypeRadioGroup).val();
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
  export function getForm(): google.script.SaveStatement {
    var form = SidebarView.getForm() as google.script.SaveStatement;
    form.highlight = getHighlight();
    form.recordType = getRecordType();
    return form;
  }

};
