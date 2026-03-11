// Navigation utilities for Agocare application

// Helper function to normalize role names from backend to frontend format
function normalizeRole(role) {
    if (!role) return 'patient';
    const r = role.toUpperCase();
    // All medical professional roles route to the doctor dashboard
    if (r === 'DOCTOR' || r === 'NURSE' || r === 'PROFESSOR' || r === 'HEALTH_WORKER') {
        return 'doctor';
    }
    if (r === 'PATIENT') {
        return 'patient';
    }
    if (r === 'ADMIN') {
        return 'admin';
    }
    return 'patient';
}

// User roles
const USER_ROLES = {
    PATIENT: 'patient',
    DOCTOR: 'doctor',
    NURSE: 'doctor',
    PROFESSOR: 'doctor',
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
        appointments: 'doctor-appointments.html',
        myPatients: 'doctor-patients.html',
        consultations: 'doctor-consultations.html',
        prescriptions: 'doctor-prescriptions.html',
        labResults: 'doctor-lab-results.html',
        messages: 'doctor-messages.html',
        schedule: 'doctor-schedule.html',
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

function navigateToDashboard(role) {
    // const role = getUserRole();
    const userRole = role || getUserRole();
    
    if (!userRole) {
        console.warn('No user role found, redirecting to login');
        navigateTo(ROUTES.auth.login);
        return;
    }
    
    switch(userRole) {
        case USER_ROLES.DOCTOR:
        case 'doctor':
        case 'health_worker':
            navigateTo(ROUTES.doctor.dashboard);
            break;
        case USER_ROLES.ADMIN:
        case 'admin':
            navigateTo(ROUTES.admin.dashboard);
            break;
        case USER_ROLES.PATIENT:
        case 'patient':
            navigateTo(ROUTES.patient.dashboard);
            break;
        default:
            console.warn('Unknown role:', userRole, 'defaulting to patient dashboard');
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

function requireRole(requiredRole) {
    if (!isAuthenticated()) {
        navigateTo(ROUTES.auth.login);
        return false;
    }
    
    const userRole = getUserRole();
    
    // Normalize comparison for doctor/health_worker role
    if (requiredRole === 'doctor' || requiredRole === USER_ROLES.DOCTOR || requiredRole === 'health_worker') {
        if (!(userRole === USER_ROLES.DOCTOR || userRole === 'health_worker')) {
            navigateToDashboard();
            return false;
        }
    } else if (userRole !== requiredRole && userRole !== normalizeRole(requiredRole)) {
        navigateToDashboard();
        return false;
    }
    
    return true;
}
