var AUTO_RECORD_BINDER_PREFIX = "bkper_autoRecord_";

function AutoRecordSheetBindingDAO(properties) {
  
  this.properties = properties;

  AutoRecordSheetBindingDAO.prototype.saveBinding = function(binding) {
    var bindingKey = this.getKey(binding.sheetId);
    var bindingJSON = JSON.stringify(binding);
    this.properties.setProperty(bindingKey, bindingJSON);    
  }
  
  AutoRecordSheetBindingDAO.prototype.getKey = function(sheetId) {
    var userEmail = Session.getEffectiveUser().getEmail();
    var bindingKey = AUTO_RECORD_BINDER_PREFIX + userEmail + sheetId;
    return bindingKey;
  }
  
  AutoRecordSheetBindingDAO.prototype.deleteBinding = function(sheetId) {
    var bindingKey = this.getKey(sheetId);
    this.properties.deleteProperty(bindingKey);    
  }
  
  AutoRecordSheetBindingDAO.prototype.loadBinding = function(sheetId) {
    var bindingKey = this.getKey(sheetId);
    var bindingJSON = properties.getProperty(bindingKey);    
    if (bindingJSON != null) {
      return JSON.parse(bindingJSON);
    } else {
      return null;
    }
  }  
  
  AutoRecordSheetBindingDAO.prototype.getBindings = function() {
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
  
    AutoRecordSheetBindingDAO.prototype.getBindingsForSheet = function(sheetId) {
    var properties = this.properties.getProperties();
    var bindings = new Array();
    
    for (var property in properties) {
      if (property.indexOf(sheetId) > 0) {
        var bindingJSON = properties[property];
        var binding = JSON.parse(bindingJSON);
        bindings.push(binding);
      }
    }
    return bindings;
  }
  
  
}
