/**
 * Agrocare API Client - Professional Version
 * Features: Interceptors, retry logic, error handling, loading states
 */

const API_BASE_URL = '/api';
const AUTH_TOKEN_KEY = 'authToken';
const CURRENT_USER_KEY = 'currentUser';

// ==================== CONFIG ====================
const API_CONFIG = {
    baseURL: API_BASE_URL,
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
};

// ==================== REQUEST INTERCEPTOR ====================
function createRequestHeaders(includeAuth = true) {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (includeAuth) {
        const token = getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    
    return headers;
}

// ==================== RESPONSE HANDLER ====================
async function handleResponse(response) {
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
        const error = new Error(data.message || data.error || `HTTP ${response.status}`);
        error.status = response.status;
        error.data = data;
        error.code = data.errorCode;
        throw error;
    }
    
    return data;
}

// ==================== RETRY LOGIC ====================
async function fetchWithRetry(url, options, attempts = API_CONFIG.retryAttempts) {
    for (let i = 0; i < attempts; i++) {
        try {
            const response = await fetch(url, options);
            return { response, ok: response.ok };
        } catch (error) {
            if (i === attempts - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * (i + 1)));
        }
    }
}

// ==================== CORE API FUNCTION ====================
async function apiRequest(endpoint, options = {}) {
    const {
        method = 'GET',
        body = null,
        includeAuth = true,
        retry = false
    } = options;
    
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    
    const fetchOptions = {
        method,
        headers: createRequestHeaders(includeAuth)
    };
    
    if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(url, fetchOptions);
        return await handleResponse(response);
    } catch (error) {
        console.error(`API Error [${method} ${endpoint}]:`, error);
        throw error;
    }
}

// ==================== AUTH API ====================
const AuthAPI = {
    register: async (data) => {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: {
                username: data.username,
                email: data.email,
                password: data.password,
                name: data.name,
                role: data.role || 'PATIENT'
            },
            includeAuth: false
        });
    },
    
    login: async (username, password) => {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: { username, password },
            includeAuth: false
        });
        
        // Handle both response formats: response.data.token or response.token
        const token = response.data?.token || response.token;
        const user = response.data?.user || response.user;
        
        if (token) {
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        }
        
        return response;
    },
    
    getCurrentUser: async () => {
        return apiRequest('/auth/me');
    },
    
    getUserById: async (userId) => {
        return apiRequest(`/auth/me/${userId}`);
    },
    
    updateProfile: async (userId, data) => {
        return apiRequest(`/auth/update/${userId}`, {
            method: 'PUT',
            body: data
        });
    },
    
    changePassword: async (userId, oldPassword, newPassword) => {
        return apiRequest(`/auth/change-password/${userId}`, {
            method: 'POST',
            body: { oldPassword, newPassword }
        });
    },
    
    getUsersByRole: async (role) => {
        return apiRequest(`/auth/users/${role}`);
    },
    
    // OAuth login methods - Modern token-based flow
    // Frontend gets token from provider SDK, sends to backend for verification
    oauthGoogle: async () => {
        window.location.href = `${API_CONFIG.baseURL}/auth/oauth/google`;
    },
    
    oauthFacebook: async () => {
        window.location.href = `${API_CONFIG.baseURL}/auth/oauth/facebook`;
    },
    
    oauthApple: async () => {
        window.location.href = `${API_CONFIG.baseURL}/auth/oauth/apple`;
    },

    /**
     * Send a provider token to the backend for verification and login/signup
     * @param {string} provider - 'google', 'facebook', or 'apple'
     * @param {object} tokenData - { accessToken, idToken }
     */
    oauthTokenLogin: async (provider, tokenData) => {
        const response = await apiRequest(`/auth/oauth/${provider}/token`, {
            method: 'POST',
            body: tokenData,
            includeAuth: false
        });
        
        const token = response.token;
        const user = response.user;
        
        if (token) {
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        }
        
        return response;
    },
    
    // Handle OAuth callback (called from callback page)
    handleOAuthCallback: async (provider, code, state) => {
        const response = await apiRequest(`/auth/oauth/${provider}/callback?code=${code}&state=${state || ''}`, {
            method: 'GET',
            includeAuth: false
        });
        
        const token = response.data?.token || response.token;
        const user = response.data?.user || response.user;
        
        if (token) {
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        }
        
        return response;
    }
};

// ==================== QUESTIONS API ====================
const QuestionsAPI = {
    create: async (data) => {
        const params = new URLSearchParams();
        if (data.userId) params.append('userId', data.userId);
        params.append('title', data.title);
        params.append('content', data.content || '');
        params.append('category', data.category);
        return apiRequest('/questions/create?' + params.toString(), {
            method: 'POST'
        });
    },
    
    getAll: async () => {
        return apiRequest('/questions/approved', { includeAuth: false });
    },
    
    getApproved: async () => {
        return apiRequest('/questions/approved', { includeAuth: false });
    },
    
    getById: async (id) => {
        return apiRequest(`/questions/${id}`, { includeAuth: false });
    },
    
    getByCategory: async (category) => {
        return apiRequest(`/questions/category/${category}`, { includeAuth: false });
    },
    
    search: async (keyword) => {
        return apiRequest(`/questions/search?keyword=${encodeURIComponent(keyword)}`, { includeAuth: false });
    },
    
    upvote: async (questionId, userId) => {
        return apiRequest(`/questions/${questionId}/upvote?userId=${userId}`, {
            method: 'POST'
        });
    },

    downvote: async (questionId, userId) => {
        return apiRequest(`/questions/${questionId}/downvote?userId=${userId}`, {
            method: 'POST'
        });
    },

    getVoteStatus: async (questionId, userId) => {
        return apiRequest(`/questions/${questionId}/vote-status?userId=${userId}`);
    },
    
    getUnresolved: async () => {
        return apiRequest('/questions/unresolved', { includeAuth: false });
    }
};

// ==================== ANSWERS API ====================
const AnswersAPI = {
    create: async (data) => {
        const params = new URLSearchParams();
        params.append('questionId', data.questionId);
        params.append('userId', data.userId);
        params.append('content', data.content);
        return apiRequest('/answers/create?' + params.toString(), {
            method: 'POST'
        });
    },
    
    getByQuestion: async (questionId) => {
        return apiRequest(`/answers/question/${questionId}`, { includeAuth: false });
    },
    
    getById: async (id) => {
        return apiRequest(`/answers/${id}`, { includeAuth: false });
    },
    
    upvote: async (id) => {
        return apiRequest(`/answers/${id}/upvote`, { method: 'POST' });
    },
    
    downvote: async (id) => {
        return apiRequest(`/answers/${id}/downvote`, { method: 'POST' });
    },
    
    markHelpful: async (id) => {
        return apiRequest(`/answers/${id}/helpful`, { method: 'POST' });
    },
    
    addComment: async (answerId, data) => {
        const params = new URLSearchParams();
        params.append('userId', data.userId);
        params.append('content', data.content);
        return apiRequest(`/answers/${answerId}/comment?${params.toString()}`, {
            method: 'POST'
        });
    },
    
    addReply: async (answerId, commentId, data) => {
        const params = new URLSearchParams();
        params.append('userId', data.userId);
        params.append('content', data.content);
        return apiRequest(`/answers/${answerId}/comments/${commentId}/reply?${params.toString()}`, {
            method: 'POST'
        });
    }
};

// ==================== DOCTORS API ====================
const DoctorsAPI = {
    getAvailable: async () => {
        return apiRequest('/doctors/available', { includeAuth: false });
    },
    
    getBySpecialization: async (specialization) => {
        return apiRequest(`/doctors/specialization/${specialization}`, { includeAuth: false });
    },
    
    getProfile: async (userId) => {
        return apiRequest(`/doctors/profile/${userId}`, { includeAuth: false });
    },
    
    createProfile: async (data) => {
        return apiRequest('/doctors/profile/create', {
            method: 'POST',
            body: data
        });
    },
    
    updateProfile: async (userId, data) => {
        const params = new URLSearchParams();
        if (data.specialization) params.append('specialization', data.specialization);
        if (data.hospitalAffiliation) params.append('hospitalAffiliation', data.hospitalAffiliation);
        if (data.yearsOfExperience) params.append('yearsOfExperience', data.yearsOfExperience);
        if (data.consultationFee) params.append('consultationFee', data.consultationFee);
        const query = params.toString() ? `?${params.toString()}` : '';
        return apiRequest(`/doctors/profile/${userId}${query}`, {
            method: 'PUT'
        });
    },

    updateAvailability: async (userId, isAvailable) => {
        const params = new URLSearchParams();
        params.append('isAvailable', isAvailable);
        return apiRequest(`/doctors/${userId}/availability?${params.toString()}`, {
            method: 'PUT'
        });
    }
};

// ==================== MEDICAL CENTERS API ====================
const MedicalCentersAPI = {
    getVerified: async () => {
        return apiRequest('/medical-centers/verified', { includeAuth: false });
    },
    
    getByCity: async (city) => {
        return apiRequest(`/medical-centers/verified/city/${encodeURIComponent(city)}`, { includeAuth: false });
    },
    
    search: async (name) => {
        return apiRequest(`/medical-centers/search?name=${encodeURIComponent(name)}`, { includeAuth: false });
    },
    
    getById: async (id) => {
        return apiRequest(`/medical-centers/${id}`, { includeAuth: false });
    },
    
    create: async (data) => {
        return apiRequest('/medical-centers/create', {
            method: 'POST',
            body: data
        });
    }
};

// ==================== APPOINTMENTS API ====================
const AppointmentsAPI = {
    create: async (data) => {
        const params = new URLSearchParams();
        params.append('patientId', data.patientId);
        params.append('doctorId', data.doctorId);
        params.append('appointmentDate', data.appointmentDate);
        params.append('reason', data.reason || 'General Consultation');
        if (data.durationMinutes) params.append('durationMinutes', data.durationMinutes);
        
        return apiRequest('/appointments/create?' + params.toString(), {
            method: 'POST'
        });
    },
    
    getById: async (id) => {
        return apiRequest(`/appointments/${id}`);
    },
    
    getByPatient: async (patientId) => {
        return apiRequest(`/appointments/patient/${patientId}`);
    },
    
    getByDoctor: async (doctorId) => {
        return apiRequest(`/appointments/doctor/${doctorId}`);
    },
    
    getPending: async (doctorId) => {
        return apiRequest(`/appointments/doctor/${doctorId}/pending`);
    },

    getScheduledForPatient: async (patientId) => {
        return apiRequest(`/appointments/patient/${patientId}/scheduled`);
    },
    
    updateStatus: async (id, status) => {
        return apiRequest(`/appointments/${id}/status?status=${encodeURIComponent(status)}`, {
            method: 'PUT'
        });
    },

    approve: async (id) => {
        return apiRequest(`/appointments/${id}/status?status=CONFIRMED`, {
            method: 'PUT'
        });
    },

    reschedule: async (id, newDate, notes) => {
        const params = new URLSearchParams();
        params.append('appointmentDate', newDate);
        params.append('status', 'CONFIRMED');
        if (notes) params.append('notes', notes);
        return apiRequest(`/appointments/${id}?${params.toString()}`, {
            method: 'PUT'
        });
    },

    decline: async (id) => {
        return apiRequest(`/appointments/${id}/status?status=CANCELLED`, {
            method: 'PUT'
        });
    },
    
    cancel: async (id) => {
        return apiRequest(`/appointments/${id}/cancel`, { method: 'POST' });
    },
    
    complete: async (id) => {
        return apiRequest(`/appointments/${id}/complete`, { method: 'POST' });
    }
};

// ==================== CONSULTATIONS API ====================
const ConsultationsAPI = {
    create: async (data) => {
        return apiRequest('/consultations/create', {
            method: 'POST',
            body: null,
            retry: false
        });
    },
    
    createWithParams: async (patientId, doctorId, appointmentId, symptoms) => {
        const params = new URLSearchParams();
        params.append('patientId', patientId);
        params.append('doctorId', doctorId);
        if (appointmentId) params.append('appointmentId', appointmentId);
        if (symptoms) params.append('symptoms', symptoms);
        
        return apiRequest('/consultations/create?' + params.toString(), {
            method: 'POST'
        });
    },
    
    getByDoctor: async (doctorId) => {
        return apiRequest(`/consultations/doctor/${doctorId}`);
    },
    
    getByPatient: async (patientId) => {
        return apiRequest(`/consultations/patient/${patientId}`);
    },
    
    getPending: async (doctorId) => {
        return apiRequest(`/consultations/doctor/${doctorId}/pending`);
    },
    
    getById: async (id) => {
        return apiRequest(`/consultations/${id}`);
    },
    
    update: async (id, data) => {
        const params = new URLSearchParams();
        if (data.symptoms) params.append('symptoms', data.symptoms);
        if (data.diagnosis) params.append('diagnosis', data.diagnosis);
        if (data.notes) params.append('notes', data.notes);
        if (data.status) params.append('status', data.status);
        
        return apiRequest(`/consultations/${id}?${params.toString()}`, {
            method: 'PUT'
        });
    },
    
    complete: async (id) => {
        return apiRequest(`/consultations/${id}/complete`, { method: 'POST' });
    },
    
    saveDraft: async (id) => {
        return apiRequest(`/consultations/${id}/draft`, { method: 'POST' });
    }
};

// ==================== PRESCRIPTIONS API ====================
const PrescriptionsAPI = {
    create: async (data) => {
        const params = new URLSearchParams();
        params.append('patientId', data.patientId);
        params.append('doctorId', data.doctorId);
        params.append('medicationName', data.medicationName);
        params.append('dosage', data.dosage);
        params.append('frequency', data.frequency);
        params.append('duration', data.duration);
        if (data.consultationId) params.append('consultationId', data.consultationId);
        if (data.instructions) params.append('instructions', data.instructions);
        
        return apiRequest('/prescriptions/create?' + params.toString(), {
            method: 'POST'
        });
    },
    
    getByDoctor: async (doctorId) => {
        return apiRequest(`/prescriptions/doctor/${doctorId}`);
    },
    
    getByPatient: async (patientId) => {
        return apiRequest(`/prescriptions/patient/${patientId}`);
    },
    
    getActive: async (doctorId) => {
        return apiRequest(`/prescriptions/doctor/${doctorId}/active`);
    },
    
    getById: async (id) => {
        return apiRequest(`/prescriptions/${id}`);
    },
    
    updateStatus: async (id, status) => {
        return apiRequest(`/prescriptions/${id}/status?status=${status}`, {
            method: 'PUT'
        });
    },
    
    complete: async (id) => {
        return apiRequest(`/prescriptions/${id}/complete`, { method: 'POST' });
    }
};

// ==================== LAB RESULTS API ====================
const LabResultsAPI = {
    create: async (data) => {
        const params = new URLSearchParams();
        params.append('patientId', data.patientId);
        if (data.doctorId) params.append('doctorId', data.doctorId);
        params.append('testName', data.testName);
        if (data.testResults) params.append('testResults', data.testResults);
        if (data.normalRange) params.append('normalRange', data.normalRange);
        if (data.units) params.append('units', data.units);
        if (data.findings) params.append('findings', data.findings);
        
        return apiRequest('/lab-results/create?' + params.toString(), {
            method: 'POST'
        });
    },
    
    getByPatient: async (patientId) => {
        return apiRequest(`/lab-results/patient/${patientId}`);
    },
    
    getPending: async (doctorId) => {
        return apiRequest(`/lab-results/doctor/${doctorId}/pending`);
    },
    
    getAbnormal: async (doctorId) => {
        return apiRequest(`/lab-results/doctor/${doctorId}/abnormal`);
    },
    
    getAllPending: async () => {
        return apiRequest('/lab-results/pending');
    },
    
    getById: async (id) => {
        return apiRequest(`/lab-results/${id}`);
    },
    
    review: async (id, doctorId, findings, status) => {
        const params = new URLSearchParams();
        params.append('doctorId', doctorId);
        if (findings) params.append('findings', findings);
        if (status) params.append('status', status);
        
        return apiRequest(`/lab-results/${id}/review?${params.toString()}`, {
            method: 'POST'
        });
    },
    
    markReviewed: async (id) => {
        return apiRequest(`/lab-results/${id}/mark-reviewed`, { method: 'POST' });
    },
    
    flag: async (id, flag) => {
        return apiRequest(`/lab-results/${id}/flag?flag=${flag}`, {
            method: 'PUT'
        });
    }
};

// ==================== MESSAGING API ====================
const MessagingAPI = {
    getConversations: async (userId) => {
        return apiRequest(`/messages/conversations?userId=${userId}`);
    },

    getMessages: async (conversationId, userId) => {
        return apiRequest(`/messages/${conversationId}?userId=${userId}`);
    },

    sendMessage: async (conversationId, senderId, content, messageType = 'TEXT') => {
        return apiRequest('/messages/send', {
            method: 'POST',
            body: { conversationId, senderId, content, messageType }
        });
    },

    startConversation: async (senderId, recipientId, message = null) => {
        return apiRequest('/messages/conversations/start', {
            method: 'POST',
            body: { senderId, recipientId, message }
        });
    },

    getUnreadCount: async (userId) => {
        return apiRequest(`/messages/unread/count?userId=${userId}`);
    }
};

// ==================== DYNAMIC Q&A API ====================
// New endpoints for the fully dynamic Q&A system (replaces hardcoded content)
const QaAPI = {
    // ---- Questions ----
    listQuestions: async (page = 0, size = 10, sort = 'newest') => {
        return apiRequest(`/qa/questions?page=${page}&size=${size}&sort=${sort}`, { includeAuth: false });
    },

    getQuestion: async (id) => {
        return apiRequest(`/qa/questions/${id}`);
    },

    createQuestion: async (data) => {
        return apiRequest('/qa/questions', {
            method: 'POST',
            body: {
                title: data.title,
                content: data.content,
                categorySlug: data.categorySlug,
                category: data.category,
                anonymous: data.anonymous || false
            }
        });
    },

    updateQuestion: async (id, data) => {
        return apiRequest(`/qa/questions/${id}`, {
            method: 'PUT',
            body: data
        });
    },

    deleteQuestion: async (id) => {
        return apiRequest(`/qa/questions/${id}`, { method: 'DELETE' });
    },

    getQuestionsByCategory: async (categorySlug, page = 0, size = 10, sort = 'newest') => {
        return apiRequest(`/qa/questions/category/${categorySlug}?page=${page}&size=${size}&sort=${sort}`, { includeAuth: false });
    },

    getQuestionsByUser: async (userId, page = 0, size = 10) => {
        return apiRequest(`/qa/questions/user/${userId}?page=${page}&size=${size}`, { includeAuth: false });
    },

    getUnanswered: async (page = 0, size = 10) => {
        return apiRequest(`/qa/questions/unanswered?page=${page}&size=${size}`, { includeAuth: false });
    },

    searchQuestions: async (query, page = 0, size = 10) => {
        return apiRequest(`/qa/questions/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`, { includeAuth: false });
    },

    resolveQuestion: async (id) => {
        return apiRequest(`/qa/questions/${id}/resolve`, { method: 'PATCH' });
    },

    // ---- Answers ----
    getAnswers: async (questionId) => {
        return apiRequest(`/qa/questions/${questionId}/answers`);
    },

    createAnswer: async (questionId, content) => {
        return apiRequest(`/qa/questions/${questionId}/answers`, {
            method: 'POST',
            body: { content }
        });
    },

    acceptAnswer: async (questionId, answerId) => {
        return apiRequest(`/qa/questions/${questionId}/answers/${answerId}/accept`, { method: 'PATCH' });
    },

    updateAnswer: async (questionId, answerId, content) => {
        return apiRequest(`/qa/questions/${questionId}/answers/${answerId}`, {
            method: 'PUT',
            body: { content }
        });
    },

    deleteAnswer: async (questionId, answerId) => {
        return apiRequest(`/qa/questions/${questionId}/answers/${answerId}`, { method: 'DELETE' });
    },

    // ---- Voting ----
    vote: async (votableType, votableId, voteType) => {
        return apiRequest('/qa/votes', {
            method: 'POST',
            body: { votableType, votableId, voteType }
        });
    },

    upvoteQuestion: async (questionId) => {
        return apiRequest('/qa/votes', {
            method: 'POST',
            body: { votableType: 'QUESTION', votableId: questionId, voteType: 'UPVOTE' }
        });
    },

    downvoteQuestion: async (questionId) => {
        return apiRequest('/qa/votes', {
            method: 'POST',
            body: { votableType: 'QUESTION', votableId: questionId, voteType: 'DOWNVOTE' }
        });
    },

    upvoteAnswer: async (answerId) => {
        return apiRequest('/qa/votes', {
            method: 'POST',
            body: { votableType: 'ANSWER', votableId: answerId, voteType: 'UPVOTE' }
        });
    },

    downvoteAnswer: async (answerId) => {
        return apiRequest('/qa/votes', {
            method: 'POST',
            body: { votableType: 'ANSWER', votableId: answerId, voteType: 'DOWNVOTE' }
        });
    },

    // ---- Following ----
    toggleFollow: async (followableType, followableId) => {
        return apiRequest(`/qa/follow/${followableType}/${followableId}`, { method: 'POST' });
    },

    checkFollowing: async (followableType, followableId) => {
        return apiRequest(`/qa/follow/${followableType}/${followableId}`);
    },

    followQuestion: async (questionId) => {
        return apiRequest(`/qa/follow/QUESTION/${questionId}`, { method: 'POST' });
    },

    followUser: async (userId) => {
        return apiRequest(`/qa/follow/USER/${userId}`, { method: 'POST' });
    },

    followCategory: async (categoryId) => {
        return apiRequest(`/qa/follow/CATEGORY/${categoryId}`, { method: 'POST' });
    },

    // ---- Comments ----
    getComments: async (commentableType, commentableId) => {
        return apiRequest(`/qa/comments/${commentableType}/${commentableId}`, { includeAuth: false });
    },

    createComment: async (commentableType, commentableId, content, parentCommentId = null) => {
        const body = { content };
        if (parentCommentId) body.parentCommentId = parentCommentId;
        return apiRequest(`/qa/comments/${commentableType}/${commentableId}`, {
            method: 'POST',
            body
        });
    },

    likeComment: async (commentId) => {
        return apiRequest(`/qa/comments/${commentId}/like`, { method: 'POST' });
    },

    deleteComment: async (commentId) => {
        return apiRequest(`/qa/comments/${commentId}`, { method: 'DELETE' });
    },

    // ---- Categories ----
    getCategories: async () => {
        return apiRequest('/qa/categories', { includeAuth: false });
    },

    getCategoryBySlug: async (slug) => {
        return apiRequest(`/qa/categories/${slug}`, { includeAuth: false });
    },

    // ---- Notifications ----
    getNotifications: async () => {
        return apiRequest('/qa/notifications');
    },

    getUnreadNotifications: async () => {
        return apiRequest('/qa/notifications/unread');
    },

    getUnreadCount: async () => {
        return apiRequest('/qa/notifications/unread/count');
    },

    markNotificationRead: async (notificationId) => {
        return apiRequest(`/qa/notifications/${notificationId}/read`, { method: 'PATCH' });
    },

    markAllNotificationsRead: async () => {
        return apiRequest('/qa/notifications/read-all', { method: 'PATCH' });
    }
};

// ==================== UTILITY FUNCTIONS ====================
function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

function isAuthenticated() {
    return !!getAuthToken();
}

function getCurrentUser() {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
}

function setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('userRole');
    window.location.href = 'index.html';
}

async function healthCheck() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return await response.json();
    } catch {
        return { status: 'DOWN' };
    }
}

// ==================== EXPORTS ====================
window.API = {
    config: API_CONFIG,
    auth: AuthAPI,
    questions: QuestionsAPI,
    answers: AnswersAPI,
    doctors: DoctorsAPI,
    medicalCenters: MedicalCentersAPI,
    appointments: AppointmentsAPI,
    consultations: ConsultationsAPI,
    prescriptions: PrescriptionsAPI,
    labResults: LabResultsAPI,
    messaging: MessagingAPI,
    qa: QaAPI,
    getAuthToken,
    isAuthenticated,
    getCurrentUser,
    setCurrentUser,
    logout,
    healthCheck
};

// Legacy support
window.apiRegister = (username, email, password, name, role) => 
    AuthAPI.register({ username, email, password, name, role });
window.apiLogin = (username, password) => AuthAPI.login(username, password);
window.apiGetCurrentUser = (userId) => AuthAPI.getUserById(userId);
window.apiUpdateProfile = (userId, name, bio, profilePicture) => 
    AuthAPI.updateProfile(userId, { name, bio, profilePicture });
window.apiChangePassword = (userId, oldPassword, newPassword) => 
    AuthAPI.changePassword(userId, oldPassword, newPassword);
window.apiCreateQuestion = (userId, title, content, category) => 
    QuestionsAPI.create({ userId, title, content, category });
window.apiGetAllQuestions = () => QuestionsAPI.getAll();
window.apiGetApprovedQuestions = () => QuestionsAPI.getApproved();
window.apiGetQuestion = (id) => QuestionsAPI.getById(id);
window.apiGetQuestionsByCategory = (category) => QuestionsAPI.getByCategory(category);
window.apiSearchQuestions = (keyword) => QuestionsAPI.search(keyword);
window.apiUpvoteQuestion = (questionId, userId) => QuestionsAPI.upvote(questionId, userId);
window.apiDownvoteQuestion = (questionId, userId) => QuestionsAPI.downvote(questionId, userId);
window.apiGetVoteStatus = (questionId, userId) => QuestionsAPI.getVoteStatus(questionId, userId);
window.apiGetUnresolvedQuestions = () => QuestionsAPI.getUnresolved();
window.apiCreateAnswer = (questionId, userId, content) => 
    AnswersAPI.create({ questionId, userId, content });
window.apiGetAnswersForQuestion = (questionId) => AnswersAPI.getByQuestion(questionId);
window.apiGetAnswerById = (id) => AnswersAPI.getById(id);
window.apiUpvoteAnswer = (id) => AnswersAPI.upvote(id);
window.apiDownvoteAnswer = (id) => AnswersAPI.downvote(id);
window.apiMarkAnswerAsHelpful = (id) => AnswersAPI.markHelpful(id);
window.apiAddCommentToAnswer = (answerId, userId, content) => 
    AnswersAPI.addComment(answerId, { userId, content });
window.apiAddReplyToComment = (answerId, parentCommentId, userId, content) => 
    AnswersAPI.addReply(answerId, parentCommentId, { userId, content });
window.apiGetAvailableDoctors = () => DoctorsAPI.getAvailable();
window.apiGetDoctorsBySpecialization = (spec) => DoctorsAPI.getBySpecialization(spec);
window.apiGetDoctorProfile = (userId) => DoctorsAPI.getProfile(userId);
window.apiGetVerifiedMedicalCenters = () => MedicalCentersAPI.getVerified();
window.apiGetMedicalCentersByCity = (city) => MedicalCentersAPI.getByCity(city);
window.apiSearchMedicalCenters = (name) => MedicalCentersAPI.search(name);
window.apiCreateAppointment = (patientId, doctorId, appointmentDate, reason) => 
    AppointmentsAPI.create({ patientId, doctorId, appointmentDate, reason });
window.apiGetPatientAppointments = (patientId) => AppointmentsAPI.getByPatient(patientId);
window.apiGetDoctorAppointments = (doctorId) => AppointmentsAPI.getByDoctor(doctorId);
window.apiGetPendingAppointments = (doctorId) => AppointmentsAPI.getPending(doctorId);
window.apiApproveAppointment = (id) => AppointmentsAPI.approve(id);
window.apiDeclineAppointment = (id) => AppointmentsAPI.decline(id);
window.apiRescheduleAppointment = (id, newDate, notes) => AppointmentsAPI.reschedule(id, newDate, notes);
window.apiCancelAppointment = (id) => AppointmentsAPI.cancel(id);
window.apiCompleteAppointment = (id) => AppointmentsAPI.complete(id);
window.apiHealthCheck = healthCheck;
