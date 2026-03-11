/**
 * Agrocare Utilities - UI Components
 * Loading spinners, modals, and other UI helpers
 */

const UI = {
    // Full page loader
    showLoader(message = 'Loading...') {
        let loader = document.getElementById('global-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.innerHTML = `
                <style>
                    #global-loader {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.7);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 99999;
                        backdrop-filter: blur(4px);
                    }
                    .loader-content {
                        text-align: center;
                        color: white;
                    }
                    .loader-spinner {
                        width: 50px;
                        height: 50px;
                        border: 4px solid rgba(255,255,255,0.3);
                        border-top-color: white;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 20px;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                </style>
                <div class="loader-content">
                    <div class="loader-spinner"></div>
                    <p>${message}</p>
                </div>
            `;
            document.body.appendChild(loader);
        } else {
            loader.querySelector('p').textContent = message;
            loader.style.display = 'flex';
        }
    },
    
    hideLoader() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    },
    
    // Button loading state
    setButtonLoading(button, loading = true) {
        if (!button) return;
        
        if (loading) {
            button.dataset.originalText = button.textContent;
            button.disabled = true;
            button.classList.add('is-loading');
            button.innerHTML = '<span class="btn-spinner"></span> Loading...';
        } else {
            button.disabled = false;
            button.classList.remove('is-loading');
            button.textContent = button.dataset.originalText || button.textContent;
        }
    },
    
    // Confirm dialog
    confirm(options) {
        return new Promise((resolve) => {
            const {
                title = 'Confirm',
                message = 'Are you sure?',
                confirmText = 'Confirm',
                cancelText = 'Cancel',
                type = 'warning'
            } = options;
            
            const modal = document.createElement('div');
            modal.className = 'confirm-modal';
            modal.innerHTML = `
                <style>
                    .confirm-modal {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.5);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 99999;
                    }
                    .confirm-dialog {
                        background: white;
                        border-radius: 12px;
                        padding: 24px;
                        max-width: 400px;
                        width: 90%;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    }
                    .confirm-title {
                        font-size: 18px;
                        font-weight: 600;
                        margin-bottom: 12px;
                        color: #333;
                    }
                    .confirm-message {
                        color: #666;
                        margin-bottom: 24px;
                        line-height: 1.5;
                    }
                    .confirm-actions {
                        display: flex;
                        gap: 12px;
                        justify-content: flex-end;
                    }
                    .confirm-btn {
                        padding: 10px 20px;
                        border-radius: 6px;
                        border: none;
                        cursor: pointer;
                        font-weight: 500;
                        transition: all 0.2s;
                    }
                    .confirm-btn-cancel {
                        background: #f0f0f0;
                        color: #333;
                    }
                    .confirm-btn-cancel:hover {
                        background: #e0e0e0;
                    }
                    .confirm-btn-confirm {
                        background: #ef4444;
                        color: white;
                    }
                    .confirm-btn-confirm:hover {
                        background: #dc2626;
                    }
                </style>
                <div class="confirm-dialog">
                    <div class="confirm-title">${title}</div>
                    <div class="confirm-message">${message}</div>
                    <div class="confirm-actions">
                        <button class="confirm-btn confirm-btn-cancel">${cancelText}</button>
                        <button class="confirm-btn confirm-btn-confirm">${confirmText}</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const handleResolve = (value) => {
                document.body.removeChild(modal);
                resolve(value);
            };
            
            modal.querySelector('.confirm-btn-cancel').onclick = () => handleResolve(false);
            modal.querySelector('.confirm-btn-confirm').onclick = () => handleResolve(true);
            modal.onclick = (e) => {
                if (e.target === modal) handleResolve(false);
            };
        });
    },
    
    // Format date
    formatDate(dateString, options = {}) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const defaultOptions = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
    },
    
    // Relative time
    timeAgo(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };
        
        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }
        return 'Just now';
    },
    
    // Truncate text
    truncate(text, maxLength = 100) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
};

// Export to window
window.UI = UI;
