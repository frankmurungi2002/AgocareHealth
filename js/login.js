// Agrocare Login/Signup - Professional Version
// Uses new API client with JSON body support

// State
let currentTab = 'login';
let selectedRole = 'PATIENT';

function switchTab(tab) {
    currentTab = tab;
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.target === tab) {
            btn.classList.add('active');
        }
    });

    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(`${tab}-form`).classList.add('active');

    const subtitle = document.getElementById('header-subtitle');
    if (tab === 'login') {
        subtitle.textContent = 'Welcome back! Please login to your account.';
    } else {
        subtitle.textContent = 'Join our community of doctors and patients.';
    }
}

function selectRole(role, element) {
    selectedRole = role;
    
    document.querySelectorAll('.role-option').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    
    document.getElementById('signup-role').value = role;

    // Show facility field for medical professionals
    const hwFields = document.getElementById('health-worker-fields');
    if (role === 'DOCTOR' || role === 'NURSE' || role === 'PROFESSOR') {
        hwFields.classList.remove('hidden');
    } else {
        hwFields.classList.add('hidden');
    }
}

function normalizeRole(role) {
    if (!role) return 'patient';
    const r = role.toUpperCase();
    if (r === 'DOCTOR' || r === 'NURSE' || r === 'PROFESSOR' || r === 'HEALTH_WORKER') {
        return 'doctor';
    }
    if (r === 'ADMIN') {
        return 'admin';
    }
    return 'patient';
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    // Client-side validation
    if (!username) {
        Toast.error('Please enter your username');
        return;
    }
    if (!password) {
        Toast.error('Please enter your password');
        return;
    }

    const btn = e.target.querySelector('button');
    UI.setButtonLoading(btn, true);

    try {
        const response = await API.auth.login(username, password);
        
        // Handle both response formats: response.data.token or response.token
        const token = response.data?.token || response.token;
        const user = response.data?.user || response.user;
        
        if (response.success && token) {
            const userRole = normalizeRole(user.role);
            localStorage.setItem('userRole', userRole);
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            Toast.success('Login successful! Redirecting...');
            
            setTimeout(() => {
                navigateToDashboard(userRole);
            }, 500);
        } else {
            Toast.error(response.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        Toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
        UI.setButtonLoading(btn, false);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value.trim();
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const role = document.getElementById('signup-role').value;
    
    // Client-side validation
    const validation = Validators.validateForm({
        name, username, email, password, confirmPassword
    }, {
        name: (v) => Validators.required(v, 'Name') || Validators.minLength(v, 2, 'Name'),
        username: Validators.username,
        email: Validators.email,
        password: Validators.password,
        confirmPassword: (v) => Validators.required(v, 'Confirmation') || 
            Validators.match(v, password, 'Passwords do not match')
    });

    if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        Toast.error(firstError);
        return;
    }

    const btn = e.target.querySelector('button');
    UI.setButtonLoading(btn, true);

    try {
        // Send the exact role selected (PATIENT, DOCTOR, NURSE, PROFESSOR)
        const backendRole = role.toUpperCase();
        
        // Register user
        const registerResponse = await API.auth.register({
            username,
            email,
            password,
            name,
            role: backendRole
        });

        if (registerResponse.success) {
            // Auto-login after registration
            const loginResponse = await API.auth.login(username, password);
            
            // Handle both response formats: flat or nested under data
            const token = loginResponse.data?.token || loginResponse.token;
            const user = loginResponse.data?.user || loginResponse.user;
            
            if (loginResponse.success && token) {
                const userRole = normalizeRole(user.role);
                localStorage.setItem('userRole', userRole);
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                Toast.success('Welcome to Agocare! Redirecting...');
                
                setTimeout(() => {
                    navigateToDashboard(userRole);
                }, 800);
            } else {
                Toast.error('Account created but auto-login failed. Please login manually.');
                setTimeout(() => { window.location.href = 'Login.html'; }, 1500);
            }
        } else {
            Toast.error(registerResponse.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Signup error:', error);
        Toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
        UI.setButtonLoading(btn, false);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    if (API.isAuthenticated()) {
        const user = API.getCurrentUser();
        if (user) {
            const role = normalizeRole(user.role);
            navigateToDashboard(role);
            return;
        }
    }

    // Initialize UI elements
    const hwFields = document.getElementById('health-worker-fields');
    if (hwFields) hwFields.classList.add('hidden');

    // Handle role parameter from URL
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    
    if (roleParam) {
        const roleUpper = roleParam.toUpperCase();
        const roleElements = document.querySelectorAll('.role-option');
        roleElements.forEach(el => {
            const label = el.querySelector('.role-label')?.textContent?.toUpperCase() || '';
            if (label === roleUpper || (roleUpper === 'COMMUNITY' && label === 'PATIENT')) {
                selectRole(roleUpper === 'COMMUNITY' ? 'PATIENT' : roleUpper, el);
            }
        });
    }

    // Add real-time validation
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
});

// Social login handlers
let isOAuthInProgress = false;

/**
 * Process OAuth response from any provider
 * Saves token, sets role, and redirects to appropriate dashboard
 */
async function processOAuthResponse(response, provider) {
    const token = response.token;
    const user = response.user;
    
    if (response.success && token && user) {
        const userRole = normalizeRole(user.role);
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('authToken', token);
        
        Toast.success('Welcome to Agocare! Redirecting...');
        
        setTimeout(() => {
            navigateToDashboard(userRole);
        }, 800);
    } else {
        Toast.error(response.message || `${provider} sign-in failed. Please try again.`);
    }
}

// ==================== GOOGLE SIGN-IN ====================
function handleGoogleLogin() {
    if (isOAuthInProgress) return;
    isOAuthInProgress = true;
    setSocialButtonLoading('google', true);
    
    // Use Google Sign-In popup via Google Identity Services
    const googleClientId = window.GOOGLE_CLIENT_ID;
    
    if (googleClientId && typeof google !== 'undefined') {
        // Use Google Identity Services (GIS) - modern approach
        const client = google.accounts.oauth2.initTokenClient({
            client_id: googleClientId,
            scope: 'email profile openid',
            callback: async (tokenResponse) => {
                try {
                    if (tokenResponse.error) {
                        throw new Error(tokenResponse.error);
                    }
                    const response = await API.auth.oauthTokenLogin('google', {
                        accessToken: tokenResponse.access_token
                    });
                    await processOAuthResponse(response, 'Google');
                } catch (error) {
                    console.error('Google login error:', error);
                    Toast.error(error.message || 'Google sign-in failed. Please try again.');
                } finally {
                    isOAuthInProgress = false;
                    setSocialButtonLoading('google', false);
                }
            },
            error_callback: (error) => {
                // User closed the popup or consent was denied
                console.log('Google sign-in cancelled or failed:', error);
                isOAuthInProgress = false;
                setSocialButtonLoading('google', false);
            }
        });
        client.requestAccessToken();
    } else {
        // Fallback: Open Google sign-in in popup window
        openOAuthPopup('google', 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
            client_id: 'YOUR_GOOGLE_CLIENT_ID',
            redirect_uri: window.location.origin + '/html/oauth-callback.html',
            response_type: 'token',
            scope: 'email profile openid',
            prompt: 'select_account'
        }).toString());
    }
}

// ==================== FACEBOOK SIGN-IN ====================
function handleFacebookLogin() {
    if (isOAuthInProgress) return;
    isOAuthInProgress = true;
    setSocialButtonLoading('facebook', true);
    
    // Use Facebook SDK if loaded
    if (typeof FB !== 'undefined') {
        FB.login(async function(fbResponse) {
            try {
                if (fbResponse.authResponse) {
                    const response = await API.auth.oauthTokenLogin('facebook', {
                        accessToken: fbResponse.authResponse.accessToken
                    });
                    await processOAuthResponse(response, 'Facebook');
                } else {
                    Toast.error('Facebook sign-in was cancelled.');
                }
            } catch (error) {
                console.error('Facebook login error:', error);
                Toast.error(error.message || 'Facebook sign-in failed. Please try again.');
            } finally {
                isOAuthInProgress = false;
                setSocialButtonLoading('facebook', false);
            }
        }, { scope: 'email,public_profile' });
    } else {
        // Fallback: Open Facebook sign-in in popup window
        const fbAppId = window.FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID';
        openOAuthPopup('facebook', 'https://www.facebook.com/v18.0/dialog/oauth?' + new URLSearchParams({
            client_id: fbAppId,
            redirect_uri: window.location.origin + '/html/oauth-callback.html',
            response_type: 'token',
            scope: 'email,public_profile'
        }).toString());
    }
}

// ==================== APPLE SIGN-IN ====================
function handleAppleLogin() {
    if (isOAuthInProgress) return;
    isOAuthInProgress = true;
    setSocialButtonLoading('apple', true);
    
    // Use Apple Sign-In JS if loaded
    if (typeof AppleID !== 'undefined') {
        AppleID.auth.init({
            clientId: window.APPLE_CLIENT_ID || 'YOUR_APPLE_CLIENT_ID',
            scope: 'name email',
            redirectURI: window.location.origin + '/html/oauth-callback.html',
            usePopup: true
        });
        
        AppleID.auth.signIn().then(async (appleResponse) => {
            try {
                const response = await API.auth.oauthTokenLogin('apple', {
                    idToken: appleResponse.authorization.id_token,
                    accessToken: appleResponse.authorization.code
                });
                await processOAuthResponse(response, 'Apple');
            } catch (error) {
                console.error('Apple login error:', error);
                Toast.error(error.message || 'Apple sign-in failed. Please try again.');
            } finally {
                isOAuthInProgress = false;
                setSocialButtonLoading('apple', false);
            }
        }).catch((error) => {
            console.error('Apple login error:', error);
            if (error.error !== 'popup_closed_by_user') {
                Toast.error('Apple sign-in failed. Please try again.');
            }
            isOAuthInProgress = false;
            setSocialButtonLoading('apple', false);
        });
    } else {
        // Fallback: Show info about Apple Sign-In requirements
        Toast.info('Apple Sign-In requires an Apple Developer account to be configured.');
        isOAuthInProgress = false;
        setSocialButtonLoading('apple', false);
    }
}

// ==================== OAUTH POPUP HELPER ====================
function openOAuthPopup(provider, url) {
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const popup = window.open(url, `${provider}_oauth`, 
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`);
    
    if (!popup) {
        Toast.error('Popup was blocked. Please allow popups for this site.');
        isOAuthInProgress = false;
        setSocialButtonLoading(provider, false);
        return;
    }
    
    // Listen for messages from the popup callback page
    window.addEventListener('message', async function oauthHandler(event) {
        if (event.origin !== window.location.origin) return;
        if (!event.data || event.data.type !== 'oauth_callback') return;
        
        window.removeEventListener('message', oauthHandler);
        
        try {
            const { provider: callbackProvider, accessToken, idToken } = event.data;
            const response = await API.auth.oauthTokenLogin(callbackProvider, { accessToken, idToken });
            await processOAuthResponse(response, callbackProvider);
        } catch (error) {
            console.error('OAuth popup error:', error);
            Toast.error(error.message || 'Sign-in failed. Please try again.');
        } finally {
            isOAuthInProgress = false;
            setSocialButtonLoading(provider, false);
        }
    });
    
    // Check if popup was closed without completing
    const checkClosed = setInterval(() => {
        if (popup && popup.closed) {
            clearInterval(checkClosed);
            if (isOAuthInProgress) {
                isOAuthInProgress = false;
                setSocialButtonLoading(provider, false);
            }
        }
    }, 1000);
}

function setSocialButtonLoading(provider, loading) {
    const buttonMap = {
        'google': 'google-btn',
        'facebook': 'facebook-btn',
        'apple': 'apple-btn'
    };
    
    const button = document.querySelector(`.${buttonMap[provider]}`);
    if (button) {
        if (loading) {
            button.disabled = true;
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = `<span class="btn-spinner"></span> Connecting...`;
        } else {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText || getDefaultButtonText(provider);
        }
    }
}

function getDefaultButtonText(provider) {
    const texts = {
        'google': `<svg class="social-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg> Continue with Google`,
        'facebook': `<svg class="social-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg> Continue with Facebook`,
        'apple': `<svg class="social-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#000000" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg> Continue with Apple`
    };
    return texts[provider] || '';
}
