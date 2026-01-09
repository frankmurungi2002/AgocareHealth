// Navigation utilities for Agocare application

// User roles
const USER_ROLES = {
    PATIENT: 'patient',
    DOCTOR: 'doctor',
    ADMIN: 'admin'
};

// Get current user role from localStorage
function getUserRole() {
    return localStorage.getItem('userRole') || null;
}

// Set user role in localStorage
function setUserRole(role) {
    localStorage.setItem('userRole', role);
}

// Get current user from localStorage
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser')) || null;
}

// Navigation routes based on user role
const ROUTES = {
    auth: {
        login: 'Login.html',
        signup: 'Signup.html'
    },
    patient: {
        dashboard: 'patientDashboard.html',
        appointments: 'appointments.html',
        medicalCenters: 'medical_centers.html',
        myPatients: 'my-patients.html',
        medicalLibrary: 'medical-library(1).html',
        settings: 'settings(1).html',
        profile: 'doctor-profile(1).html'
    },
    doctor: {
        dashboard: 'doctor-dashboard.html',
        appointments: 'appointments.html',
        myPatients: 'my-patients.html',
        profile: 'doctor-profile(1).html',
        settings: 'settings(1).html'
    },
    admin: {
        dashboard: 'agocare_admin_exact (1).html',
        medicalCenters: 'medical_centers.html',
        analytics: 'analytics.html',
        questionsFeed: 'questions-feed.html'
    }
};

// Navigation functions
function navigateTo(path) {
    window.location.href = path;
}

function navigateToDashboard() {
    const role = getUserRole();
    switch(role) {
        case USER_ROLES.DOCTOR:
            navigateTo(ROUTES.doctor.dashboard);
            break;
        case USER_ROLES.ADMIN:
            navigateTo(ROUTES.admin.dashboard);
            break;
        case USER_ROLES.PATIENT:
        default:
            navigateTo(ROUTES.patient.dashboard);
    }
}

function logout() {
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    navigateTo('index.html');
}

function isAuthenticated() {
    return !!localStorage.getItem('userRole') && !!localStorage.getItem('currentUser');
}

// Redirect to login if not authenticated (use on protected pages)
function requireAuth() {
    if (!isAuthenticated()) {
        navigateTo(ROUTES.auth.login);
    }
}

// Check if user has required role
function requireRole(role) {
    if (!isAuthenticated()) {
        navigateTo(ROUTES.auth.login);
        return false;
    }
    if (getUserRole() !== role) {
        navigateToDashboard();
        return false;
    }
    return true;
}
