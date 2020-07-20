namespace Utilities_ {

  export function generateUID(): string {
    return s4_() + s4_() + '_' + s4_() + '_' + s4_() + '_' + s4_() + '_' + s4_() + s4_() + s4_();
  }

  function s4_(): string {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  export function getRangeForTable(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, table: any[][], range: GoogleAppsScript.Spreadsheet.Range): GoogleAppsScript.Spreadsheet.Range {
    var row = range.getRow();
    var firstColumn = range.getColumn();
    var sheet = range.getSheet();
    var numOfColums = 0;
    var range = sheet.getRange(row, firstColumn, table.length, table[0].length);
    return range;
  }

  export function getNumberFormatPattern(fractionDigits: number): string {
    var numberFormatPattern = "0";
    if (fractionDigits > 0) {
      numberFormatPattern += ".";
    }
    for (var i = 0; i < fractionDigits; i++) {
      numberFormatPattern += "0";
    }

    return numberFormatPattern;
  }

  export function logError(error: Error): string {
    var message = error + "\n" + error["stack"];
    Logger.log(message)
    return message;
  }

  export function retry<R>(func: Function): R {
    
    let sleepTimeMinMs=300; 
    let sleepTimeMaxMs=1500;  
    let rumpUp = 1;     
    let maxRetries = 20;

    var retries = 0;
    while (true) {
      try {
        return func();
      } catch (e) {
        Logger.log("Failed to execute: " + retries);
        if (retries > maxRetries) {
          throw e;
        } else {
          let sleepTimeMs = Math.random() * (+sleepTimeMaxMs - +sleepTimeMinMs) + +sleepTimeMinMs;
          Logger.log("Retrying in " + (sleepTimeMs / 1000) + " secs...");
          Utilities.sleep(sleepTimeMs);
          sleepTimeMaxMs = sleepTimeMaxMs * rumpUp;
          sleepTimeMinMs = sleepTimeMinMs * rumpUp;
          retries++;
        }
      }
    }
  }    


  export function formatDateRelativeTo(date: Date, realtiveTo: Date, timeZone: string): string {

    if (timeZone == null) {
      timeZone = Session.getScriptTimeZone();
    }

    var delta = realtiveTo.getTime() - date.getTime();
    Logger.log(delta);

    var minutes = delta / 1000 / 60;

    if (minutes <= 2) {
      return "seconds ago";
    }

    if (minutes < 60) {
      return minutes.toFixed(0) + " minutes ago";
    }

    var hours = minutes / 60;

    if (hours < 1.5) {
      return hours.toFixed(0) + " hour ago";
    }

    if (hours < 6) {
      return hours.toFixed(0) + " hours ago";
    }

    timeZone = timeZone + "";

    if (realtiveTo.getFullYear() == date.getFullYear() && realtiveTo.getMonth() == date.getMonth() && realtiveTo.getDate() == date.getDate()) {
      return "today, " + Utilities.formatDate(date, timeZone, "h:mm a");
    }

    var years = hours / 24 / 365;

    if (years > 50) {
      return "unknown";
    }

    return Utilities.formatDate(date, timeZone, "MMMMM, d h:mm a");

  }


  export function removeEmptyRowsAtEnd(matrix: any[][], isRowEmptyFunc?: Function): any[][] {
  
    var lastRowIndex = matrix.length - 1;
    var isFirstRowEmpty = true;  
    for(var i = lastRowIndex; i >= 0; i--) {
      var row = matrix[i];
      lastRowIndex = i;
      if (isRowEmptyFunc != null) {
        if (!isRowEmptyFunc(row)) {
          isFirstRowEmpty = false;
          break;
        }
      } else {
        var rowStr = row.join("").trim();
        //Default
        if (rowStr != "") {
          isFirstRowEmpty = false;
          break;
        }
      }
      
    }
    if (lastRowIndex == 0 && isFirstRowEmpty) {
      return [];
    }  
    var result = matrix.splice(0,lastRowIndex+1);
    return result;
  
  }  

}

class Stopwatch {
  
  startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  start() {
    this.startTime = Date.now();
  };

  stop(log: string) {
    var elapsed = (Date.now() - this.startTime);
    Logger.log(log + " [time: " + elapsed + "ms]");
    return elapsed;
  };
  

  elapsed(log: string) {
    var elapsed = (Date.now() - this.startTime);
    Logger.log(log + " [time: " + elapsed + "ms]");
    this.start();
    return elapsed;
  };  

}

