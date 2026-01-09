// State
let currentTab = 'login';
let selectedRole = 'community';

function switchTab(tab) {
    currentTab = tab;
    
    // Update Tabs UI
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.target === tab) {
            btn.classList.add('active');
        }
    });

    // Update Form Visibility
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(`${tab}-form`).classList.add('active');

    // Update Subtitle text
    const subtitle = document.getElementById('header-subtitle');
    if (tab === 'login') {
        subtitle.textContent = 'Welcome back! Please login to your account.';
    } else {
        subtitle.textContent = 'Join our community of doctors and patients.';
    }
}

function selectRole(role, element) {
    selectedRole = role;
    
    // Update Role UI
    document.querySelectorAll('.role-option').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    
    // Update Hidden Input
    document.getElementById('signup-role').value = role;

    // Show/Hide Health Worker fields
    const hwFields = document.getElementById('health-worker-fields');
    if (role === 'health_worker') {
        hwFields.classList.remove('hidden');
    } else {
        hwFields.classList.add('hidden');
    }
}

function validateEmail(email) {
    // Simple regex for email validation
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// function handleLogin(e) {
//     e.preventDefault();
//     const username = document.getElementById('login-username').value;
//     const password = document.getElementById('login-password').value;

//     // No email validation needed for username login
//     if (!username || username.trim() === "") {
//         alert("Please enter your username.");
//         return;
//     }

//     console.log("Login Attempt:", { username, password });
    
//     const btn = e.target.querySelector('button');
//     const originalText = btn.textContent;
//     btn.textContent = "Signing In...";
//     btn.disabled = true;

//     // Call API to login
//     apiLogin(username, password).then(response => {
//         if (response.token && response.user) {
//             // User logged in successfully
//             setUserRole(response.user.role);
//             btn.textContent = originalText;
//             btn.disabled = false;
//             navigateToDashboard();
//         } else {
//             alert(response.error || "Login failed. Please try again.");
//             btn.textContent = originalText;
//             btn.disabled = false;
//         }
//     }).catch(error => {
//         console.error("Login error:", error);
//         alert("Login failed. Please check your credentials and try again.");
//         btn.textContent = originalText;
//         btn.disabled = false;
//     });
// }

// function handleSignup(e) {
//     e.preventDefault();
//     const name = document.getElementById('signup-name').value;
//     const username = document.getElementById('signup-username').value;
//     const email = document.getElementById('signup-email').value;
//     const password = document.getElementById('signup-password').value;
//     const confirmPassword = document.getElementById('signup-confirm-password').value;
//     const role = document.getElementById('signup-role').value;
    
//     const hwTitle = document.getElementById('hw-title').value;
//     const hwFacility = document.getElementById('hw-facility').value;

//     // Validation
//     if (!validateEmail(email)) {
//         alert("Please enter a valid email address.");
//         return;
//     }

//     if (password !== confirmPassword) {
//         alert("Passwords do not match. Please try again.");
//         return;
//     }

//     const btn = e.target.querySelector('button');
//     const originalText = btn.textContent;
//     btn.textContent = "Creating Account...";
//     btn.disabled = true;

//     // Call API to register
//     apiRegister(username, email, password, name, role).then(response => {
//         if (response.user && response.user.id) {
//             // User registered successfully
//             localStorage.setItem('currentUser', JSON.stringify(response.user));
//             setUserRole(response.user.role);
            
//             // Now login with the credentials
//             return apiLogin(username, password);
//         } else {
//             throw new Error(response.error || "Registration failed");
//         }
//     }).then(loginResponse => {
//         if (loginResponse.token && loginResponse.user) {
//             btn.textContent = originalText;
//             btn.disabled = false;
//             navigateToDashboard();
//         } else {
//             throw new Error(loginResponse.error || "Login failed after registration");
//         }
//     }).catch(error => {
//         console.error("Signup error:", error);
//         alert("Registration failed: " + error.message);
//         btn.textContent = originalText;
//         btn.disabled = false;
//     });
// }

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Ensure default state is set
    const hwFields = document.getElementById('health-worker-fields');
    if (hwFields) hwFields.classList.add('hidden');

    // Handle role parameter from URL (from index.html)
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    
    if (roleParam) {
        // Pre-select the role based on URL parameter
        const roleElements = document.querySelectorAll('.role-option');
        roleElements.forEach(el => {
            const isHealthWorker = el.textContent.toLowerCase().includes('health');
            if ((roleParam === 'doctor' || roleParam === 'health_worker') && isHealthWorker) {
                selectRole('health_worker', el);
            } else if (roleParam === 'community' && !isHealthWorker) {
                selectRole('community', el);
            }
        });
    }
});