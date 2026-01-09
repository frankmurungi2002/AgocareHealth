
// Mobile menu toggle
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
    }
}

function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && overlay) {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
    }
}

// Run DOM-dependent wiring after the page has loaded
window.addEventListener('DOMContentLoaded', () => {
    // Search functionality (filter by simple text in dashboard)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.card, .flagged-item, .trending-item').forEach(el => {
                const text = el.textContent.toLowerCase();
                el.style.display = term && !text.includes(term) ? 'none' : '';
            });
        });
    }

    // Smooth card click feedback + scroll to relevant section
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('click', function () {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);

            const target = this.getAttribute('data-target');
            if (!target) return;

            let section = null;
            if (target === 'users' || target === 'doctors') {
                // Pending doctor verifications block
                section = document.querySelector('.card .card-title');
            } else if (target === 'questions') {
                // Trending + contributor area
                section = document.querySelector('.trending-section');
            } else if (target === 'reports') {
                // Flagged content card
                section = document.querySelector('.card .card-title:nth-of-type(2)');
            }

            if (section && section.scrollIntoView) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Sync initial pending doctors counters
    updatePendingDoctorsCounters();
});

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Update pending doctor counts in header + stats
function updatePendingDoctorsCounters() {
    const doctorItems = document.querySelectorAll('.doctor-item');
    const pendingCount = doctorItems.length;

    const pendingBadge = document.querySelector('.pending-badge');
    if (pendingBadge) {
        pendingBadge.textContent = pendingCount > 0 ? `${pendingCount} Pending` : 'No Pending';
    }

    const doctorStatChange = document.querySelector('.stat-card[data-target="doctors"] .stat-change');
    if (doctorStatChange) {
        doctorStatChange.textContent = pendingCount > 0
            ? `${pendingCount} Pending Verification`
            : 'All verified';
    }
}

// Increase total doctors stat when approvals happen
function incrementDoctorsTotal(by = 1) {
    const doctorStatValue = document.querySelector('.stat-card[data-target="doctors"] .stat-value');
    if (!doctorStatValue) return;
    const current = parseInt(doctorStatValue.textContent.replace(/[^0-9]/g, ''), 10) || 0;
    doctorStatValue.textContent = String(current + by);
}

// Approve doctor
function approveDoctor(doctorName) {
    showToast(`✅ ${doctorName} has been approved!`, 'success');
    const item = event.currentTarget.closest('.doctor-item');
    if (item) {
        item.style.transition = 'opacity 0.3s, transform 0.3s';
        item.style.opacity = '0';
        item.style.transform = 'translateX(10px)';
        setTimeout(() => {
            item.remove();
            updatePendingDoctorsCounters();
            incrementDoctorsTotal(1);
        }, 300);
    } else {
        updatePendingDoctorsCounters();
        incrementDoctorsTotal(1);
    }
}

// Delete content
function deleteContent(content) {
    if (confirm(`Are you sure you want to delete this ${content}?`)) {
        const item = event.currentTarget.closest('.flagged-item');
        if (item) {
            item.style.transition = 'opacity 0.3s, transform 0.3s';
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                item.remove();
            }, 300);
        }
        showToast(`❌ Content deleted successfully`, 'error');
    }
}

// Top-bar actions
function goHome() {
    // Scroll to top of dashboard
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openMessages() {
    showToast('Messages center coming soon', 'success');
}

function openProfile() {
    const overlay = document.getElementById('profileModalOverlay');
    const modal = document.getElementById('profileModal');
    const nameInput = document.getElementById('profileName');
    const emailInput = document.getElementById('profileEmail');
    const roleInput = document.getElementById('profileRole');
    const avatarPreview = document.getElementById('profileAvatarPreview');
    const avatarFile = document.getElementById('profileAvatarFile');

    if (!overlay || !modal || !nameInput) return;

    // Load existing profile from storage or current UI
    const stored = localStorage.getItem('agocare_admin_profile');
    let profile = stored ? JSON.parse(stored) : {};

    if (!profile.name) {
        const nameSpan = document.getElementById('adminName');
        profile.name = nameSpan ? nameSpan.textContent : 'Admin';
    }

    nameInput.value = profile.name || '';
    if (emailInput) emailInput.value = profile.email || '';
    if (roleInput) roleInput.value = profile.role || '';

    // Reset file input
    if (avatarFile) avatarFile.value = '';

    // Show current avatar preview (photo or initials)
    if (avatarPreview) {
        if (profile.avatarData) {
            avatarPreview.style.backgroundImage = `url(${profile.avatarData})`;
            avatarPreview.classList.add('has-photo');
            avatarPreview.textContent = '';
        } else {
            const initials = (profile.name || 'Admin')
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map(part => part[0].toUpperCase())
                .join('');
            avatarPreview.style.backgroundImage = '';
            avatarPreview.classList.remove('has-photo');
            avatarPreview.textContent = initials || 'AD';
        }
    }

    overlay.classList.add('show');
    modal.classList.add('show');
}

function closeProfile() {
    const overlay = document.getElementById('profileModalOverlay');
    const modal = document.getElementById('profileModal');
    if (overlay) overlay.classList.remove('show');
    if (modal) modal.classList.remove('show');
}

function saveProfile(event) {
    event.preventDefault();

    const nameInput = document.getElementById('profileName');
    const emailInput = document.getElementById('profileEmail');
    const roleInput = document.getElementById('profileRole');
    const nameSpan = document.getElementById('adminName');
    const avatar = document.getElementById('adminAvatar');
    const avatarFile = document.getElementById('profileAvatarFile');
    const avatarPreview = document.getElementById('profileAvatarPreview');

    if (!nameInput || !nameSpan || !avatar) {
        closeProfile();
        return;
    }

    const profile = {
        name: nameInput.value.trim(),
        email: emailInput ? emailInput.value.trim() : '',
        role: roleInput ? roleInput.value.trim() : ''
    };

    const stored = localStorage.getItem('agocare_admin_profile');
    if (stored) {
        try {
            const existing = JSON.parse(stored);
            if (existing.avatarData) {
                profile.avatarData = existing.avatarData;
            }
        } catch (e) {
            // ignore
        }
    }

    const finalizeSave = () => {
        // Update UI name
        nameSpan.textContent = profile.name || 'Admin';

        // Update UI avatar
        if (profile.avatarData) {
            avatar.style.backgroundImage = `url(${profile.avatarData})`;
            avatar.classList.add('has-photo');
            avatar.textContent = '';
        } else {
            avatar.style.backgroundImage = '';
            avatar.classList.remove('has-photo');
            const initials = (profile.name || 'Admin')
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map(part => part[0].toUpperCase())
                .join('');
            avatar.textContent = initials || 'AD';
        }

        // Sync preview in modal
        if (avatarPreview) {
            if (profile.avatarData) {
                avatarPreview.style.backgroundImage = `url(${profile.avatarData})`;
                avatarPreview.classList.add('has-photo');
                avatarPreview.textContent = '';
            } else {
                avatarPreview.style.backgroundImage = '';
                avatarPreview.classList.remove('has-photo');
                avatarPreview.textContent = avatar.textContent || 'AD';
            }
        }

        // Persist
        try {
            localStorage.setItem('agocare_admin_profile', JSON.stringify(profile));
        } catch (e) {
            // ignore storage errors in this simple frontend demo
        }

        closeProfile();
        showToast('Admin profile saved', 'success');
    };

    // If a new file is selected, read it first
    if (avatarFile && avatarFile.files && avatarFile.files[0]) {
        const file = avatarFile.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            profile.avatarData = e.target.result;
            finalizeSave();
        };
        reader.readAsDataURL(file);
    } else {
        finalizeSave();
    }
}

// Load profile on startup
window.addEventListener('DOMContentLoaded', () => {
    const stored = localStorage.getItem('agocare_admin_profile');
    if (!stored) return;

    try {
        const profile = JSON.parse(stored);
        const nameSpan = document.getElementById('adminName');
        const avatar = document.getElementById('adminAvatar');
        if (nameSpan && profile.name) {
            nameSpan.textContent = profile.name;
        }
        if (avatar) {
            if (profile.avatarData) {
                avatar.style.backgroundImage = `url(${profile.avatarData})`;
                avatar.classList.add('has-photo');
                avatar.textContent = '';
            } else if (profile.name) {
                const initials = profile.name
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map(part => part[0].toUpperCase())
                    .join('');
                avatar.textContent = initials || 'AD';
            }
        }
    } catch (e) {
        // ignore malformed data
    }
}, { once: true });

// Ignore report
function ignoreReport(content) {
    showToast(`Report ignored for ${content}`, 'success');
    event.currentTarget.closest('.flagged-item').style.opacity = '0.5';
}

// Export report
function exportReport() {
    showToast('📊 Generating report... Download will start shortly', 'success');
    setTimeout(() => {
        showToast('✅ Report exported successfully!', 'success');
    }, 2000);
}

// Toggle follow
function toggleFollow(btn) {
    if (btn.textContent === 'Follow') {
        btn.textContent = 'Following';
        btn.style.background = '#4a90e2';
        btn.style.color = 'white';
        showToast('✅ Following Dr. Sarah Nabirye', 'success');
    } else {
        btn.textContent = 'Follow';
        btn.style.background = 'white';
        btn.style.color = '#4a90e2';
        showToast('Unfollowed Dr. Sarah Nabirye', 'success');
    }
}

// Auto-close mobile menu on window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 640) {
        closeMobileMenu();
    }
});

// Tab switching (navigate to separate pages for each category)
function switchTab(tab) {
    const items = document.querySelectorAll('.sidebar-item');
    items.forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    // Map each tab to its own moderation page
    const pageMap = {
        'medical-centers': 'medical_centers.html',
        pediatrics: 'pediatrics_moderation.html',
        pregnancy: 'pregnancy_moderation.html',
        infectious: 'infectious_moderation.html',
        sexual: 'sexual_moderation.html',
        mental: 'mental_moderation.html'
    };

    if (pageMap[tab]) {
        window.location.href = pageMap[tab];
    } else {
        showToast(`Switched to ${tab} section`, 'success');
    }
    
    closeMobileMenu();
}