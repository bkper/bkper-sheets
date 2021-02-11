namespace Authorizer {

  const API_UNAUTHORIZED_MSG = 'Click on "Add-ons > Bkper > Open" to Sign in';

  const clientIdKey = "CLIENT_ID"
  const clientSecretKey = "CLIENT_SECRET"  

  export function initAuth() {
    try {
      BkperApp.setApiKey(CachedProperties_.getCachedProperty(CacheService.getScriptCache(), PropertiesService.getScriptProperties(), 'API_KEY'));
      BkperApp.setOAuthTokenProvider({
        getOAuthToken: () => Authorizer.getAccessToken()
      })
    } catch (error) {
      //OK
    }
  }  

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

  function getBkperService(): GoogleAppsScriptOAuth2.OAuth2Service {
      return OAuth2.createService('bkperauth')
      .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
      .setTokenUrl('https://accounts.google.com/o/oauth2/token')
      .setClientId(CachedProperties_.getCachedProperty(CacheService.getScriptCache(), PropertiesService.getScriptProperties(), clientIdKey))
      .setClientSecret(CachedProperties_.getCachedProperty(CacheService.getScriptCache(), PropertiesService.getScriptProperties(), clientSecretKey))
      .setCallbackFunction('authorizationCallback')
      .setCache(CacheService.getUserCache())
      .setPropertyStore(PropertiesService.getUserProperties())
      .setScope('email')
      .setParam('access_type', 'offline')
      .setParam('prompt', 'consent');     
  }  
  
}