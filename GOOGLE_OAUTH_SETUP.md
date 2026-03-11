# Google OAuth Setup Guide for Agocare

This document provides step-by-step instructions to set up Google Sign-In for your Agocare application.

## Prerequisites
- A Google Account
- Access to Google Cloud Console (https://console.cloud.google.com)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top and select "New Project"
3. Enter a name for your project (e.g., "Agocare App")
4. Click "Create"

## Step 2: Enable Google+ API / People API

1. In the Google Cloud Console, navigate to **APIs & Services** > **Library**
2. Search for "Google+ API" or "People API"
3. Click on the API and click "Enable"

**Note:** Google deprecated Google+ API. Use the **Google People API** instead, which provides access to user profile information including email and basic profile data.

## Step 3: Configure OAuth Consent Screen

1. Navigate to **APIs & Services** > **OAuth consent screen**
2. Choose **External** (for production) or **Internal** (for G Suite users only)
3. Fill in the required information:
   - **App name**: Agocare
   - **User support email**: Your email address
   - **Developer contact email**: Your email address
4. Click "Save and Continue"
5. On the "Scopes" page, click "Add or remove scopes"
6. Select the following scopes:
   - `.../auth/userinfo.email` - See your primary email address
   - `.../auth/userinfo.profile` - See your personal info
   - `openid` - Authenticate using OpenID Connect
7. Click "Save and Continue"
8. (For External) Add your email as a test user:
   - Navigate to "Test users"
   - Click "Add users"
   - Enter your email address
9. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click "Create Credentials" and select **OAuth client ID**
3. Select **Web application** as the application type
4. Configure the following:

### Authorized JavaScript Origins
For local development:
- `http://localhost:8080`

For production, add your domain:
- `https://yourdomain.com`

### Authorized Redirect URIs
For local development:
- `http://localhost:8080/api/auth/oauth/google/callback`

For production:
- `https://yourdomain.com/api/auth/oauth/google/callback`

5. Click "Create"
6. Copy the **Client ID** and **Client Secret** - you'll need these for your `.env` file

## Step 5: Configure Your Application

1. Open the `.env` file in your project root
2. Add your Google OAuth credentials:

```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/oauth/google/callback
```

**Note:** For local development, you may need to update `APP_BASE_URL`:
```env
APP_BASE_URL=http://localhost:8080
```

## Step 6: Test the Setup

1. Start your backend server:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. Start your frontend server (if separate):
   ```bash
   # Your frontend startup command
   ```

3. Navigate to the Login page: `http://localhost:your-port/html/Login.html`

4. Click the "Continue with Google" button

5. You should be redirected to Google's sign-in page

6. After signing in with your Google account, you should be redirected back and logged in

## Step 7: Production Deployment Considerations

### 1. Update Authorized Domains
When deploying to production:
- Add your production domain to Authorized JavaScript Origins
- Add your production callback URL to Authorized Redirect URIs

### 2. Verify Your App
Before going live:
- Complete the OAuth verification process (required by Google for apps with >100 users)
- Or restrict to internal users only (G Suite)

### 3. Security Best Practices
- Always use HTTPS in production
- Store credentials in environment variables (never commit to version control)
- Implement rate limiting on auth endpoints
- Validate the state parameter to prevent CSRF attacks

## Troubleshooting Common Issues

### Error: "redirect_uri_mismatch"
This means the redirect URI in your code doesn't match what's configured in Google Console.
- Double-check the redirect URI in `.env` matches exactly
- Make sure there are no trailing slashes
- Verify the domain matches exactly (including www vs non-www)

### Error: "access_denied"
The user denied access or the app is not properly configured.
- Check that your email is added as a test user (for unverified apps)
- Verify OAuth consent screen is properly configured

### Error: "id_token error"
Token validation failed.
- Ensure your client secret is correct
- Check that system time is accurate (OAuth requires correct time)

### User created but not redirected properly
- Check the callback endpoint is accessible
- Verify the JWT secret is configured
- Check browser console for JavaScript errors

## API Endpoints

The implementation provides the following endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/oauth/google` | GET | Initiates Google OAuth flow |
| `/api/auth/oauth/google/callback` | GET | Handles Google callback |

## Database Schema Changes

The following new fields were added to the User entity:
- `googleId` - Google's unique user ID
- `authProvider` - Tracks which provider was used (LOCAL, GOOGLE, etc.)
- `profilePicture` - Stores profile picture URL from social provider

These fields are automatically managed by the OAuth service.

## Security Implementation

The implementation includes:
- CSRF protection via state parameter
- Server-side token validation
- Secure JWT session tokens
- Automatic account linking for existing users
- Email verification from OAuth provider
