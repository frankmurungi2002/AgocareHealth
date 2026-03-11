/**
 * OAuth Configuration for Agocare Health
 * 
 * IMPORTANT: Replace these placeholder values with your actual OAuth credentials.
 * 
 * To set up OAuth providers:
 * 
 * 1. GOOGLE:
 *    - Go to https://console.cloud.google.com/apis/credentials
 *    - Create an OAuth 2.0 Client ID (Web application)
 *    - Add http://localhost:8000 to "Authorized JavaScript origins"
 *    - Add http://localhost:8000/html/oauth-callback.html to "Authorized redirect URIs"
 *    - Copy the Client ID below
 * 
 * 2. FACEBOOK:
 *    - Go to https://developers.facebook.com/apps
 *    - Create a new app (Consumer type)
 *    - Add Facebook Login product
 *    - Set Valid OAuth Redirect URIs to http://localhost:8000/html/oauth-callback.html
 *    - Copy the App ID below
 * 
 * 3. APPLE:
 *    - Go to https://developer.apple.com/account
 *    - Register a Services ID
 *    - Configure Sign In with Apple
 *    - Set Return URLs to http://localhost:8000/html/oauth-callback.html
 *    - Copy the Services ID below
 */

// Google OAuth Client ID
window.GOOGLE_CLIENT_ID = '763802061227-ul45ph8qbvmcllvvtgdhqm9dlb6nk95s.apps.googleusercontent.com';

// Facebook App ID
window.FACEBOOK_APP_ID = '';

// Apple Sign-In Client ID (Services ID)
window.APPLE_CLIENT_ID = '';

// Initialize Facebook SDK when loaded
window.fbAsyncInit = function() {
    if (window.FACEBOOK_APP_ID) {
        FB.init({
            appId: window.FACEBOOK_APP_ID,
            cookie: true,
            xfbml: false,
            version: 'v18.0'
        });
    }
};

// Load Facebook SDK
(function(d, s, id) {
    if (!window.FACEBOOK_APP_ID) return;
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    js.async = true;
    js.defer = true;
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
