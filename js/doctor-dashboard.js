// Doctor Dashboard JavaScript

let currentDoctor = null;
let todayAppointments = [];

async function initDoctorDashboard() {
    if (!isAuthenticated()) {
        window.location.href = 'Login.html';
        return;
    }

    currentDoctor = getCurrentUser();
    if (!currentDoctor) {
        return;
    }

    updateUserInfo();
    await Promise.all([
        loadDashboardStats(),
        loadPendingRequests(),
        loadRecentPatients(),
        loadNotifications(),
        loadPatientQuestions()
    ]);
}

function updateUserInfo() {
    const userNameEl = document.getElementById('user-name');
    const avatarEl = document.getElementById('doctorAvatar');
    
    if (currentDoctor) {
        const name = currentDoctor.name || currentDoctor.username || 'Doctor';
        if (userNameEl) userNameEl.textContent = 'Dr. ' + name;
        if (avatarEl) avatarEl.textContent = getInitials(name);
    }
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

async function loadDashboardStats() {
    try {
        const doctorId = currentDoctor.id;

        // Load appointments (always available)
        try {
            const appointmentsRes = await apiGetDoctorAppointments(doctorId);
            const appointments = appointmentsRes.data || appointmentsRes || [];
            
            const today = new Date().toISOString().split('T')[0];
            todayAppointments = appointments.filter(apt => {
                const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
                return aptDate === today && (apt.status === 'CONFIRMED' || apt.status === 'COMPLETED');
            });
            
            document.getElementById('today-appointments').textContent = todayAppointments.length;

            const uniquePatients = new Set(appointments.map(apt => apt.patientId));
            document.getElementById('total-patients').textContent = uniquePatients.size;

            // Count confirmed upcoming appointments
            const confirmedCount = appointments.filter(a => a.status === 'CONFIRMED').length;
            const confirmedEl = document.getElementById('confirmed-appointments');
            if (confirmedEl) confirmedEl.textContent = confirmedCount;

            renderTodayAppointments();
        } catch (e) { /* appointments API failed silently */ }

        // Load pending consultations
        try {
            const pendingConsultationsRes = await API.consultations.getPending(doctorId);
            const pendingConsultations = pendingConsultationsRes.data || pendingConsultationsRes || [];
            document.getElementById('pending-consultations').textContent = pendingConsultations.length;
        } catch (e) { /* consultations API not available */ }
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

function updateBadges(pendingConsultations) {
    const consultationsBadge = document.getElementById('consultations-badge');
    
    if (pendingConsultations > 0 && consultationsBadge) {
        consultationsBadge.textContent = pendingConsultations;
        consultationsBadge.style.display = 'inline-flex';
    }
}

function renderTodayAppointments() {
    const container = document.getElementById('today-appointments-list');
    
    if (!todayAppointments || todayAppointments.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #6b7280;">
                <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2" width="48" height="48" style="margin: 0 auto 12px;">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <div>No appointments scheduled for today</div>
            </div>
        `;
        return;
    }

    container.innerHTML = todayAppointments.map(apt => {
        const time = new Date(apt.appointmentDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const statusClass = getStatusClass(apt.status);
        const statusLabel = getStatusLabel(apt.status);
        
        return `
            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #f9fafb; border-radius: 8px; border-left: 4px solid ${getStatusColor(apt.status)};">
                <div style="min-width: 60px; text-align: center;">
                    <div style="font-weight: 600; color: #1f2937; font-size: 14px;">${time}</div>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #1f2937; font-size: 14px;">${apt.patientName || 'Patient'}</div>
                    <div style="color: #6b7280; font-size: 12px;">${apt.reason || 'General Consultation'}</div>
                </div>
                <span style="padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: ${getStatusBg(apt.status)}; color: ${getStatusColor(apt.status)};">
                    ${statusLabel}
                </span>
                <div style="display: flex; gap: 8px;">
                    ${apt.status === 'CONFIRMED' ? `
                        <button onclick="startConsultationFromAppointment(${apt.id}, ${apt.patientId})" style="padding: 6px 12px; background: #0d9488; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;">
                            Start
                        </button>
                    ` : ''}
                    ${apt.status === 'CONFIRMED' ? `
                        <button onclick="completeAppointment(${apt.id})" style="padding: 6px 12px; background: #10b981; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;">
                            Complete
                        </button>
                    ` : ''}
                    <button onclick="viewPatientDetails(${apt.patientId})" style="padding: 6px 12px; background: white; color: #4b5563; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;">
                        View
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function getStatusClass(status) {
    const classes = {
        'SCHEDULED': 'status-scheduled',
        'CONFIRMED': 'status-confirmed',
        'COMPLETED': 'status-completed',
        'CANCELLED': 'status-cancelled',
        'NO_SHOW': 'status-no-show'
    };
    return classes[status] || 'status-scheduled';
}

function getStatusLabel(status) {
    const labels = {
        'SCHEDULED': 'Scheduled',
        'CONFIRMED': 'Confirmed',
        'COMPLETED': 'Completed',
        'CANCELLED': 'Cancelled',
        'NO_SHOW': 'No Show'
    };
    return labels[status] || status;
}

function getStatusColor(status) {
    const colors = {
        'SCHEDULED': '#f59e0b',
        'CONFIRMED': '#0d9488',
        'COMPLETED': '#10b981',
        'CANCELLED': '#ef4444',
        'NO_SHOW': '#6b7280'
    };
    return colors[status] || '#6b7280';
}

function getStatusBg(status) {
    const bgs = {
        'SCHEDULED': '#fef3c7',
        'CONFIRMED': '#ccfbf1',
        'COMPLETED': '#d1fae5',
        'CANCELLED': '#fee2e2',
        'NO_SHOW': '#f3f4f6'
    };
    return bgs[status] || '#f3f4f6';
}

async function loadRecentPatients() {
    const container = document.getElementById('recent-patients-list');
    
    try {
        const doctorId = currentDoctor.id;
        const response = await apiGetDoctorAppointments(doctorId);
        const appointments = response.data || response || [];
        
        const uniquePatients = {};
        appointments.slice(0, 10).forEach(apt => {
            if (!uniquePatients[apt.patientId]) {
                uniquePatients[apt.patientId] = {
                    id: apt.patientId,
                    name: apt.patientName,
                    lastVisit: apt.appointmentDate
                };
            }
        });
        
        const patientsList = Object.values(uniquePatients).slice(0, 5);
        
        if (patientsList.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: #6b7280; font-size: 13px;">No recent patients</div>';
            return;
        }
        
        container.innerHTML = patientsList.map(patient => `
            <div style="display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 8px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='transparent'" onclick="viewPatientDetails(${patient.id})">
                <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #0d9488, #14b8a6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 12px;">
                    ${getInitials(patient.name || 'P')}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 500; color: #1f2937; font-size: 13px;">${patient.name || 'Patient'}</div>
                    <div style="color: #9ca3af; font-size: 11px;">Last: ${formatDate(patient.lastVisit)}</div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading recent patients:', error);
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #6b7280; font-size: 13px;">No recent patients</div>';
    }
}

async function loadNotifications() {
    const container = document.getElementById('alerts-list');
    
    try {
        const alerts = [];
        
        // Check for pending appointment requests
        try {
            const pendingRes = await apiGetPendingAppointments(currentDoctor.id);
            const pending = Array.isArray(pendingRes) ? pendingRes : (pendingRes.data || []);
            if (pending.length > 0) {
                alerts.push({
                    type: 'appointment',
                    title: 'Pending Appointment Requests',
                    message: `${pending.length} patient(s) awaiting your approval`,
                    urgent: pending.length >= 3
                });
            }
        } catch (e) { /* silently ignore */ }

        // Check for today's upcoming confirmed appointments
        if (todayAppointments.length > 0) {
            const upcoming = todayAppointments.filter(a => a.status === 'CONFIRMED');
            if (upcoming.length > 0) {
                alerts.push({
                    type: 'today',
                    title: 'Today\'s Schedule',
                    message: `${upcoming.length} confirmed appointment(s) today`,
                    urgent: false
                });
            }
        }
        
        if (alerts.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #10b981; font-size: 14px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32" style="margin: 0 auto 8px;">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>
                    </svg>
                    <div>No alerts at this time</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = alerts.map(alert => `
            <div style="display: flex; gap: 12px; padding: 12px; background: ${alert.urgent ? '#fef2f2' : '#f9fafb'}; border-radius: 8px; border-left: 3px solid ${alert.urgent ? '#ef4444' : '#f59e0b'};">
                <div style="padding-top: 2px;">
                    ${alert.urgent ? 
                        '<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" width="16" height="16"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' :
                        '<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
                    }
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #1f2937; font-size: 13px;">${alert.title}</div>
                    <div style="color: #6b7280; font-size: 12px;">${alert.message}</div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ==================== PENDING APPOINTMENT REQUESTS ====================
async function loadPendingRequests() {
    const container = document.getElementById('pending-requests-list');
    const badge = document.getElementById('pending-count-badge');
    const statEl = document.getElementById('pending-requests');
    if (!container || !currentDoctor) return;

    try {
        const res = await apiGetPendingAppointments(currentDoctor.id);
        const pending = Array.isArray(res) ? res : (res.data || []);

        // Update stat card and badge
        if (statEl) statEl.textContent = pending.length;
        if (badge) {
            if (pending.length > 0) {
                badge.textContent = pending.length;
                badge.style.display = 'inline-flex';
            } else {
                badge.style.display = 'none';
            }
        }

        // Update appointments sidebar badge
        const aptBadge = document.getElementById('appointments-badge');
        if (aptBadge && pending.length > 0) {
            aptBadge.textContent = pending.length;
            aptBadge.style.display = 'inline-flex';
        }

        if (pending.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 30px 20px; color: #6b7280;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" width="40" height="40" style="margin: 0 auto 8px;">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>
                    </svg>
                    <div style="font-size: 14px;">No pending appointment requests</div>
                </div>`;
            return;
        }

        // Sort by requested date (soonest first)
        pending.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

        container.innerHTML = pending.map(apt => {
            const date = new Date(apt.appointmentDate);
            const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            return `
                <div style="display: flex; align-items: center; gap: 12px; padding: 14px; background: #fffbeb; border-radius: 8px; border-left: 4px solid #d97706;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #1f2937; font-size: 14px;">${apt.patientName || 'Patient'}</div>
                        <div style="color: #6b7280; font-size: 12px; margin-top: 2px;">📅 Requested: ${dateStr} at ${timeStr}</div>
                        <div style="color: #6b7280; font-size: 12px; margin-top: 2px;">📋 ${apt.reason || 'General Consultation'}</div>
                    </div>
                    <div style="display: flex; gap: 6px; flex-shrink: 0;">
                        <button onclick="approveAppointment(${apt.id})" style="padding: 6px 14px; background: #059669; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;" title="Approve as-is">
                            ✓ Approve
                        </button>
                        <button onclick="openRescheduleModal(${apt.id}, '${(apt.patientName || 'Patient').replace(/'/g, "\\'")}', '${apt.appointmentDate}', '${(apt.reason || '').replace(/'/g, "\\'")}')" style="padding: 6px 14px; background: #d97706; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;" title="Change date & approve">
                            ✎ Reschedule
                        </button>
                        <button onclick="declineAppointment(${apt.id})" style="padding: 6px 14px; background: #dc2626; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;" title="Decline request">
                            ✕ Decline
                        </button>
                    </div>
                </div>`;
        }).join('');
    } catch (err) {
        console.error('Error loading pending requests:', err);
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">Could not load pending requests</div>';
    }
}

async function approveAppointment(appointmentId) {
    try {
        await apiApproveAppointment(appointmentId);
        showToast('Appointment approved!', 'success');
        loadPendingRequests();
        loadDashboardStats();
    } catch (err) {
        showToast('Failed to approve appointment: ' + (err.message || 'Error'), 'error');
    }
}

async function declineAppointment(appointmentId) {
    if (!confirm('Are you sure you want to decline this appointment request?')) return;
    try {
        await apiDeclineAppointment(appointmentId);
        showToast('Appointment declined', 'success');
        loadPendingRequests();
        loadDashboardStats();
    } catch (err) {
        showToast('Failed to decline appointment: ' + (err.message || 'Error'), 'error');
    }
}

function openRescheduleModal(appointmentId, patientName, originalDate, reason) {
    document.getElementById('reschedule-modal').style.display = 'flex';
    document.getElementById('reschedule-appointment-id').value = appointmentId;
    document.getElementById('reschedule-patient-name').textContent = patientName;
    
    const date = new Date(originalDate);
    document.getElementById('reschedule-original-date').textContent = 
        'Originally requested: ' + date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + 
        ' at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('reschedule-reason').textContent = reason ? 'Reason: ' + reason : '';
    
    // Set minimum date
    const now = new Date();
    now.setHours(now.getHours() + 1);
    document.getElementById('reschedule-date').min = now.toISOString().slice(0, 16);
}

function closeRescheduleModal() {
    document.getElementById('reschedule-modal').style.display = 'none';
    document.getElementById('rescheduleForm').reset();
}

async function handleReschedule(event) {
    event.preventDefault();
    const appointmentId = document.getElementById('reschedule-appointment-id').value;
    const newDate = document.getElementById('reschedule-date').value;
    const notes = document.getElementById('reschedule-notes').value.trim();

    if (!newDate) {
        showToast('Please select a new date', 'error');
        return;
    }

    try {
        const isoDate = new Date(newDate).toISOString().replace('Z', '');
        await apiRescheduleAppointment(appointmentId, isoDate, notes || null);
        showToast('Appointment rescheduled and confirmed!', 'success');
        closeRescheduleModal();
        loadPendingRequests();
        loadDashboardStats();
    } catch (err) {
        showToast('Failed to reschedule: ' + (err.message || 'Error'), 'error');
    }
}

async function completeAppointment(appointmentId) {
    try {
        await apiCompleteAppointment(appointmentId);
        showToast('Appointment marked as completed', 'success');
        loadDashboardStats();
    } catch (err) {
        showToast('Failed to complete appointment: ' + (err.message || 'Error'), 'error');
    }
}

async function startConsultationFromAppointment(appointmentId, patientId) {
    try {
        const response = await API.consultations.createWithParams(patientId, currentDoctor.id, appointmentId, '');
        if (response.data?.consultation) {
            showToast('Consultation started successfully!', 'success');
            window.location.href = `doctor-consultations.html?id=${response.data.consultation.id}`;
        }
    } catch (error) {
        console.error('Error starting consultation:', error);
        showToast('Failed to start consultation', 'error');
    }
}

function viewPatientDetails(patientId) {
    window.location.href = `doctor-patients.html?patient=${patientId}`;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============ PATIENT QUESTIONS / Q&A ============

let allDoctorQuestions = [];
let currentQuestionsFilter = 'unanswered';

async function loadPatientQuestions() {
    const container = document.getElementById('doctor-questions-list');
    if (!container) return;

    container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #6b7280;">
            <div class="loading-spinner" style="width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #0d9488; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px;"></div>
            <div>Loading patient questions...</div>
        </div>
    `;

    try {
        const response = await apiGetApprovedQuestions();
        allDoctorQuestions = response.data || response || [];

        // Update badge count with unanswered questions
        const unanswered = allDoctorQuestions.filter(q => !q.answerCount || q.answerCount === 0);
        const badge = document.getElementById('questions-badge');
        if (badge) {
            if (unanswered.length > 0) {
                badge.textContent = unanswered.length;
                badge.style.display = 'inline-flex';
            } else {
                badge.style.display = 'none';
            }
        }

        renderDoctorQuestions();
    } catch (error) {
        console.error('Error loading patient questions:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #ef4444;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="40" height="40" style="margin: 0 auto 12px;">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <div style="font-weight: 600;">Failed to load questions</div>
                <div style="font-size: 13px; margin-top: 4px;">Please try refreshing the page</div>
                <button onclick="loadPatientQuestions()" style="margin-top: 12px; padding: 8px 16px; background: #0d9488; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">Retry</button>
            </div>
        `;
    }
}

function renderDoctorQuestions() {
    const container = document.getElementById('doctor-questions-list');
    if (!container) return;

    let filtered = allDoctorQuestions;
    if (currentQuestionsFilter === 'unanswered') {
        filtered = allDoctorQuestions.filter(q => !q.answerCount || q.answerCount === 0);
    }

    // Update active filter button styling
    document.querySelectorAll('#patient-questions-section .filter-btn, #patient-questions-section button[onclick*="filterDoctorQuestions"]').forEach(btn => {
        btn.style.background = '#f3f4f6';
        btn.style.color = '#4b5563';
    });
    const activeBtn = document.querySelector(`button[onclick*="filterDoctorQuestions('${currentQuestionsFilter}')"]`);
    if (activeBtn) {
        activeBtn.style.background = '#0d9488';
        activeBtn.style.color = 'white';
    }

    if (filtered.length === 0) {
        const emptyMsg = currentQuestionsFilter === 'unanswered'
            ? 'All patient questions have been answered!'
            : 'No patient questions yet.';
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #6b7280;">
                <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" width="48" height="48" style="margin: 0 auto 12px;">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>
                </svg>
                <div style="font-weight: 600; color: #10b981;">${emptyMsg}</div>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(q => renderDoctorQuestionCard(q)).join('');
}

function renderDoctorQuestionCard(question) {
    const categoryColors = {
        'GENERAL': { bg: '#dbeafe', text: '#1e40af' },
        'CARDIOLOGY': { bg: '#fce7f3', text: '#be185d' },
        'DERMATOLOGY': { bg: '#fef3c7', text: '#92400e' },
        'PEDIATRICS': { bg: '#d1fae5', text: '#065f46' },
        'NEUROLOGY': { bg: '#ede9fe', text: '#5b21b6' },
        'ORTHOPEDICS': { bg: '#ffedd5', text: '#9a3412' },
        'MENTAL_HEALTH': { bg: '#e0e7ff', text: '#3730a3' },
        'NUTRITION': { bg: '#ccfbf1', text: '#115e59' },
        'PREGNANCY': { bg: '#fce7f3', text: '#9d174d' },
        'INFECTIOUS': { bg: '#fee2e2', text: '#991b1b' }
    };
    const catStyle = categoryColors[question.category] || { bg: '#f3f4f6', text: '#374151' };
    const timeAgo = getTimeAgo(question.createdAt);
    const isUnanswered = !question.answerCount || question.answerCount === 0;

    return `
        <div style="background: white; border: 1px solid ${isUnanswered ? '#fbbf24' : '#e5e7eb'}; border-radius: 12px; padding: 20px; margin-bottom: 16px; ${isUnanswered ? 'border-left: 4px solid #f59e0b;' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 13px;">
                        ${getInitials(question.authorName || 'Patient')}
                    </div>
                    <div>
                        <div style="font-weight: 600; color: #1f2937; font-size: 14px;">${question.authorName || 'Anonymous Patient'}</div>
                        <div style="font-size: 12px; color: #9ca3af;">${timeAgo}</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: ${catStyle.bg}; color: ${catStyle.text};">${(question.category || 'General').replace('_', ' ')}</span>
                    ${isUnanswered ? '<span style="padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: #fef3c7; color: #92400e;">Needs Answer</span>' : `<span style="padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: #d1fae5; color: #065f46;">${question.answerCount} Answer${question.answerCount > 1 ? 's' : ''}</span>`}
                </div>
            </div>
            <h4 style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 8px;">${question.title || 'Untitled Question'}</h4>
            <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin-bottom: 16px;">${question.content || ''}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 16px; font-size: 12px; color: #9ca3af;">
                    <span>👁 ${question.viewCount || 0} views</span>
                    <span>👍 ${question.upvotes || 0} upvotes</span>
                </div>
                <button onclick="openDoctorAnswerModal(${question.id}, '${(question.title || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')}', '${(question.content || '').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ')}', '${question.category || 'GENERAL'}', '${(question.authorName || 'Patient').replace(/'/g, "\\'")}')"
                    style="padding: 8px 20px; background: ${isUnanswered ? '#0d9488' : '#f3f4f6'}; color: ${isUnanswered ? 'white' : '#374151'}; border: none; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;"
                    onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                    ${isUnanswered ? 'Write Answer' : 'Add Answer'}
                </button>
            </div>
        </div>
    `;
}

function getTimeAgo(dateString) {
    if (!dateString) return 'Unknown';
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function filterDoctorQuestions(filter) {
    currentQuestionsFilter = filter;
    renderDoctorQuestions();
}

function showPatientQuestions() {
    const section = document.getElementById('patient-questions-section');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function openDoctorAnswerModal(questionId, title, content, category, authorName) {
    document.getElementById('answer-question-id').value = questionId;
    document.getElementById('answer-question-title').textContent = title;
    document.getElementById('answer-question-content').textContent = content;
    document.getElementById('answer-question-category').textContent = (category || 'General').replace('_', ' ');
    document.getElementById('answer-question-meta').textContent = 'Asked by ' + authorName;
    document.getElementById('doctor-answer-content').value = '';
    document.getElementById('submit-answer-btn').disabled = false;
    document.getElementById('submit-answer-btn').textContent = 'Submit Answer';
    document.getElementById('doctor-answer-modal').style.display = 'flex';
}

function closeDoctorAnswerModal() {
    document.getElementById('doctor-answer-modal').style.display = 'none';
}

async function submitDoctorAnswer(event) {
    event.preventDefault();

    const questionId = document.getElementById('answer-question-id').value;
    const content = document.getElementById('doctor-answer-content').value.trim();
    const submitBtn = document.getElementById('submit-answer-btn');

    if (!content) {
        showToast('Please enter your answer', 'warning');
        return;
    }

    if (!currentDoctor || !currentDoctor.id) {
        showToast('You must be logged in to answer', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        const response = await apiCreateAnswer(questionId, currentDoctor.id, content);

        showToast('Answer submitted successfully! Patients can now see your response.', 'success');
        closeDoctorAnswerModal();

        // Reload questions to update answer counts
        await loadPatientQuestions();
    } catch (error) {
        console.error('Error submitting answer:', error);
        showToast('Failed to submit answer. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Answer';
    }
}

// Close modal when clicking overlay
document.addEventListener('click', function(e) {
    if (e.target.id === 'doctor-answer-modal') {
        closeDoctorAnswerModal();
    }
});

// ============ END Q&A ============

document.addEventListener('DOMContentLoaded', initDoctorDashboard);
