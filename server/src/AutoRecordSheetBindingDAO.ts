var AUTO_RECORD_BINDER_PREFIX = "bkper_autoRecord_";

interface AutorecordBinding {
id?: string,
  sheetId: number
  bookId: string,
  currentRow: number,
  retries: number
}

class AutoRecordSheetBindingDAO {

  private properties: GoogleAppsScript.Properties.Properties;

  constructor(properties: GoogleAppsScript.Properties.Properties) {
    this.properties = properties;
  }

  saveBinding(binding: AutorecordBinding) {
    if (binding.id == null) {
      binding.id = Utilities_.generateUID();
    }
    var bindingKey = this.getKey(binding.sheetId);
    var bindingJSON = JSON.stringify(binding);
    this.properties.setProperty(bindingKey, bindingJSON);    
  }
  
  getKey(sheetId: number) {
    var userEmail = Session.getEffectiveUser().getEmail();
    var bindingKey = AUTO_RECORD_BINDER_PREFIX + userEmail + sheetId;
    return bindingKey;
  }
  
  deleteBinding(sheetId: number) {
    var bindingKey = this.getKey(sheetId);
    this.properties.deleteProperty(bindingKey);    
  }
  
  loadBinding(sheetId: number) {
    var bindingKey = this.getKey(sheetId);
    var bindingJSON = this.properties.getProperty(bindingKey);    
    if (bindingJSON != null) {
      return JSON.parse(bindingJSON);
    } else {
      return null;
    }
  }  
  
  getBindings() {
    var properties = this.properties.getProperties();
    var bindings = new Array();
    var userEmail = Session.getEffectiveUser().getEmail();
    
    for (var property in properties) {
      if (property.indexOf(AUTO_RECORD_BINDER_PREFIX + userEmail) == 0) {
        var bindingJSON = properties[property];
        var binding = JSON.parse(bindingJSON);
        bindings.push(binding);
      }
    }
    return bindings;
  }
  
    getBindingsForSheet(sheetId: number) {
    var properties = this.properties.getProperties();
    var bindings = new Array();
    
    for (var property in properties) {
      if (property.indexOf(sheetId+"") > 0) {
        var bindingJSON = properties[property];
        var binding = JSON.parse(bindingJSON);
        bindings.push(binding);
      }
    }
    return bindings;
  }
  
  
}
