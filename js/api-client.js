/**
 * Agrocare API Client
 * This file contains all API calls to the backend
 * Base URL: http://localhost:8080/api
 */

const API_BASE_URL = 'http://localhost:8080/api';
const AUTH_TOKEN_KEY = 'authToken';
const CURRENT_USER_KEY = 'currentUser';

// ==================== AUTH API ====================

/**
 * Register a new user
 */
async function apiRegister(username, email, password, name, role = 'PATIENT') {
    try {
        const params = new URLSearchParams({
            username,
            email,
            password,
            name,
            role
        });
        
        const response = await fetch(`${API_BASE_URL}/auth/register?${params}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        
        return await response.json();
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

/**
 * Login user and get JWT token
 */
async function apiLogin(username, password) {
    try {
        const params = new URLSearchParams({ username, password });
        
        const response = await fetch(`${API_BASE_URL}/auth/login?${params}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        
        const data = await response.json();
        
        if (data.token) {
            localStorage.setItem(AUTH_TOKEN_KEY, data.token);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
        }
        
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

/**
 * Get current user profile
 */
async function apiGetCurrentUser(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me/${userId}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Get user error:', error);
        throw error;
    }
}

/**
 * Update user profile
 */
async function apiUpdateProfile(userId, name, bio, profilePicture) {
    try {
        const params = new URLSearchParams();
        if (name) params.append('name', name);
        if (bio) params.append('bio', bio);
        if (profilePicture) params.append('profilePicture', profilePicture);
        
        const response = await fetch(`${API_BASE_URL}/auth/update/${userId}?${params}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        return await response.json();
    } catch (error) {
        console.error('Update profile error:', error);
        throw error;
    }
}

/**
 * Change password
 */
async function apiChangePassword(userId, oldPassword, newPassword) {
    try {
        const params = new URLSearchParams({ oldPassword, newPassword });
        
        const response = await fetch(`${API_BASE_URL}/auth/change-password/${userId}?${params}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        return await response.json();
    } catch (error) {
        console.error('Change password error:', error);
        throw error;
    }
}

// ==================== QUESTIONS API ====================

/**
 * Create a new question
 */
async function apiCreateQuestion(userId, title, content, category) {
    try {
        const params = new URLSearchParams({
            userId,
            title,
            content,
            category
        });
        
        const response = await fetch(`${API_BASE_URL}/questions/create?${params}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        return await response.json();
    } catch (error) {
        console.error('Create question error:', error);
        throw error;
    }
}

/**
 * Get question by ID
 */
async function apiGetQuestion(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/questions/${id}`);
        return await response.json();
    } catch (error) {
        console.error('Get question error:', error);
        throw error;
    }
}

/**
 * Get questions by category
 */
async function apiGetQuestionsByCategory(category) {
    try {
        const response = await fetch(`${API_BASE_URL}/questions/category/${category}`);
        return await response.json();
    } catch (error) {
        console.error('Get questions by category error:', error);
        throw error;
    }
}

/**
 * Search questions
 */
async function apiSearchQuestions(keyword) {
    try {
        const response = await fetch(`${API_BASE_URL}/questions/search?keyword=${encodeURIComponent(keyword)}`);
        return await response.json();
    } catch (error) {
        console.error('Search questions error:', error);
        throw error;
    }
}

/**
 * Upvote question
 */
async function apiUpvoteQuestion(questionId, userId) {
    try {
        const params = new URLSearchParams({ userId });
        
        const response = await fetch(`${API_BASE_URL}/questions/${questionId}/upvote?${params}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        return await response.json();
    } catch (error) {
        console.error('Upvote question error:', error);
        throw error;
    }
}

/**
 * Get unresolved questions
 */
async function apiGetUnresolvedQuestions() {
    try {
        const response = await fetch(`${API_BASE_URL}/questions/unresolved`);
        return await response.json();
    } catch (error) {
        console.error('Get unresolved questions error:', error);
        throw error;
    }
}

// ==================== ANSWERS API ====================

/**
 * Create answer
 */
async function apiCreateAnswer(questionId, userId, content) {
    try {
        const params = new URLSearchParams({
            questionId,
            userId,
            content
        });
        
        const response = await fetch(`${API_BASE_URL}/answers/create?${params}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        return await response.json();
    } catch (error) {
        console.error('Create answer error:', error);
        throw error;
    }
}

/**
 * Get answers for question
 */
async function apiGetAnswersForQuestion(questionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/answers/question/${questionId}`);
        return await response.json();
    } catch (error) {
        console.error('Get answers error:', error);
        throw error;
    }
}

/**
 * Upvote answer
 */
async function apiUpvoteAnswer(answerId) {
    try {
        const response = await fetch(`${API_BASE_URL}/answers/${answerId}/upvote`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        return await response.json();
    } catch (error) {
        console.error('Upvote answer error:', error);
        throw error;
    }
}

// ==================== DOCTORS API ====================

/**
 * Get available doctors
 */
async function apiGetAvailableDoctors() {
    try {
        const response = await fetch(`${API_BASE_URL}/doctors/available`);
        return await response.json();
    } catch (error) {
        console.error('Get available doctors error:', error);
        throw error;
    }
}

/**
 * Get doctors by specialization
 */
async function apiGetDoctorsBySpecialization(specialization) {
    try {
        const response = await fetch(`${API_BASE_URL}/doctors/specialization/${specialization}`);
        return await response.json();
    } catch (error) {
        console.error('Get doctors by specialization error:', error);
        throw error;
    }
}

/**
 * Get doctor profile
 */
async function apiGetDoctorProfile(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/doctors/profile/${userId}`);
        return await response.json();
    } catch (error) {
        console.error('Get doctor profile error:', error);
        throw error;
    }
}

// ==================== MEDICAL CENTERS API ====================

/**
 * Get all verified medical centers
 */
async function apiGetVerifiedMedicalCenters() {
    try {
        const response = await fetch(`${API_BASE_URL}/medical-centers/verified`);
        return await response.json();
    } catch (error) {
        console.error('Get medical centers error:', error);
        throw error;
    }
}

/**
 * Get medical centers by city
 */
async function apiGetMedicalCentersByCity(city) {
    try {
        const response = await fetch(`${API_BASE_URL}/medical-centers/verified/city/${encodeURIComponent(city)}`);
        return await response.json();
    } catch (error) {
        console.error('Get medical centers by city error:', error);
        throw error;
    }
}

/**
 * Search medical centers
 */
async function apiSearchMedicalCenters(name) {
    try {
        const response = await fetch(`${API_BASE_URL}/medical-centers/search?name=${encodeURIComponent(name)}`);
        return await response.json();
    } catch (error) {
        console.error('Search medical centers error:', error);
        throw error;
    }
}

// ==================== APPOINTMENTS API ====================

/**
 * Create appointment
 */
async function apiCreateAppointment(patientId, doctorId, appointmentDate, durationMinutes, reason) {
    try {
        const params = new URLSearchParams({
            patientId,
            doctorId,
            appointmentDate,
            durationMinutes: durationMinutes || 30,
            reason
        });
        
        const response = await fetch(`${API_BASE_URL}/appointments/create?${params}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        return await response.json();
    } catch (error) {
        console.error('Create appointment error:', error);
        throw error;
    }
}

/**
 * Get patient appointments
 */
async function apiGetPatientAppointments(patientId) {
    try {
        const response = await fetch(`${API_BASE_URL}/appointments/patient/${patientId}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        return await response.json();
    } catch (error) {
        console.error('Get appointments error:', error);
        throw error;
    }
}

/**
 * Get doctor appointments
 */
async function apiGetDoctorAppointments(doctorId) {
    try {
        const response = await fetch(`${API_BASE_URL}/appointments/doctor/${doctorId}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        return await response.json();
    } catch (error) {
        console.error('Get doctor appointments error:', error);
        throw error;
    }
}

/**
 * Cancel appointment
 */
async function apiCancelAppointment(appointmentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        return await response.json();
    } catch (error) {
        console.error('Cancel appointment error:', error);
        throw error;
    }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get stored auth token
 */
function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return !!getAuthToken();
}

/**
 * Get current user from localStorage
 */
function getCurrentUser() {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Logout user
 */
function logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = '/html/index.html';
}

/**
 * Check backend health
 */
async function apiHealthCheck() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return await response.json();
    } catch (error) {
        console.error('Health check error:', error);
        return { status: 'DOWN' };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        apiRegister,
        apiLogin,
        apiGetCurrentUser,
        apiUpdateProfile,
        apiChangePassword,
        apiCreateQuestion,
        apiGetQuestion,
        apiGetQuestionsByCategory,
        apiSearchQuestions,
        apiUpvoteQuestion,
        apiGetUnresolvedQuestions,
        apiCreateAnswer,
        apiGetAnswersForQuestion,
        apiUpvoteAnswer,
        apiGetAvailableDoctors,
        apiGetDoctorsBySpecialization,
        apiGetDoctorProfile,
        apiGetVerifiedMedicalCenters,
        apiGetMedicalCentersByCity,
        apiSearchMedicalCenters,
        apiCreateAppointment,
        apiGetPatientAppointments,
        apiGetDoctorAppointments,
        apiCancelAppointment,
        getAuthToken,
        isAuthenticated,
        getCurrentUser,
        logout,
        apiHealthCheck
    };
}
