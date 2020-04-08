namespace Authorizer {

  const API_UNAUTHORIZED_MSG = 'Click on "Add-ons > Bkper > Open" to Sign in';

  const clientIdKey = "CLIENT_ID"
  const clientSecretKey = "CLIENT_SECRET"  

  export function handleCallback(request: object): boolean {
    return getBkperService().handleCallback(request)
  }

  export function getAccessToken(): string {
    let lock = Utilities_.retry<GoogleAppsScript.Lock.Lock>(() => LockService.getUserLock());
    try {
      Utilities_.retry<void>(() => lock.waitLock(30000));
      return getBkperService().getAccessToken();
    } catch (e) {
      Logger.log('Could not obtain lock after 30 seconds.');
      throw API_UNAUTHORIZED_MSG;
    } finally {
      if (lock != null) {
        Utilities_.retry<void>(() => lock.releaseLock());
      }
    }
  }  
  
  export function getAuthorizationUrl(): string {
    let service = getBkperService();
    service.setParam('login_hint', Session.getEffectiveUser().getEmail())
    return service.getAuthorizationUrl();
  }

  export function isUserAuthorized(): boolean {
    try {
      validateAccessToken();
      return true;
    } catch (error) {
      Logger.log(error);
      return false;
    }
  }

  export function validateAccessToken(): void {
    try {
      var accessToken =  getAccessToken();
      if (accessToken == null || accessToken.trim() == '') {
        throw API_UNAUTHORIZED_MSG;
      }
      var responseJSON = UrlFetchApp.fetch("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" + accessToken).getContentText();
      var tokenInfo = JSON.parse(responseJSON);
      var rightAudience = CachedProperties_.getCachedProperty(CacheService.getScriptCache(), PropertiesService.getScriptProperties(), clientIdKey);
      if (tokenInfo.audience !=  rightAudience) {
        throw API_UNAUTHORIZED_MSG;
      }
    } catch (error) {
      Logger.log(error);
      throw API_UNAUTHORIZED_MSG;
    }
  }

  function getBkperService() {
    // Create a new service with the given name. The name will be used when
    // persisting the authorized token, so ensure it is unique within the
    // scope of the property store.
    return OAuth2.createService('bkper5')
  
        // Set the endpoint URLs, which are the same for all Google services.
        .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
        .setTokenUrl('https://accounts.google.com/o/oauth2/token')
  
        // Set the client ID and secret, from the Google Developers Console.
        .setClientId(CachedProperties_.getCachedProperty(CacheService.getScriptCache(), PropertiesService.getScriptProperties(), clientIdKey))
        .setClientSecret(CachedProperties_.getCachedProperty(CacheService.getScriptCache(), PropertiesService.getScriptProperties(), clientSecretKey))
  
        // Set the name of the callback function in the script referenced
        // above that should be invoked to complete the OAuth flow.
        .setCallbackFunction('authorizationCallback')

        .setCache(CacheService.getUserCache())
  
        // Set the property store where authorized tokens should be persisted.
        .setPropertyStore(PropertiesService.getUserProperties())
  
        // Set the scopes to request (space-separated for Google services).
        .setScope('email')
  
        // Below are Google-specific OAuth2 parameters.
  
        // Requests offline access.
        .setParam('access_type', 'offline')
  
        // Consent prompt is required to ensure a refresh token is always
        // returned when requesting offline access.
        .setParam('prompt', 'consent');
  }  
  
}