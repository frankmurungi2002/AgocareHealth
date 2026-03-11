/**
 * Agrocare Utilities - Form Validators
 * Reusable validation functions for forms
 */

const Validators = {
    email(value) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) return 'Email is required';
        if (!re.test(value)) return 'Invalid email format';
        return null;
    },
    
    username(value) {
        if (!value) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (value.length > 50) return 'Username must be less than 50 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
        return null;
    },
    
    password(value) {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (value.length > 100) return 'Password must be less than 100 characters';
        return null;
    },
    
    required(value, fieldName = 'Field') {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return `${fieldName} is required`;
        }
        return null;
    },
    
    minLength(value, min, fieldName = 'Field') {
        if (value && value.length < min) {
            return `${fieldName} must be at least ${min} characters`;
        }
        return null;
    },
    
    maxLength(value, max, fieldName = 'Field') {
        if (value && value.length > max) {
            return `${fieldName} must be less than ${max} characters`;
        }
        return null;
    },
    
    match(value, matchValue, message) {
        if (value !== matchValue) {
            return message || 'Values do not match';
        }
        return null;
    },
    
    phone(value) {
        if (!value) return null;
        const re = /^[\d\s\-\+\(\)]+$/;
        if (!re.test(value)) return 'Invalid phone number format';
        return null;
    },
    
    url(value) {
        if (!value) return null;
        try {
            new URL(value);
            return null;
        } catch {
            return 'Invalid URL format';
        }
    },
    
    date(value) {
        if (!value) return null;
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Invalid date format';
        return null;
    },
    
    futureDate(value) {
        const error = this.date(value);
        if (error) return error;
        const date = new Date(value);
        if (date <= new Date()) return 'Date must be in the future';
        return null;
    },
    
    // Validate entire form
    validateForm(formData, rules) {
        const errors = {};
        let isValid = true;
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = formData[field];
            const error = rule(value);
            if (error) {
                errors[field] = error;
                isValid = false;
            }
        }
        
        return { isValid, errors };
    }
};

// Form helper utilities
const FormUtils = {
    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const errorDiv = document.getElementById(`${elementId}-error`) || 
            document.createElement('div');
        errorDiv.id = `${elementId}-error`;
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        if (!document.getElementById(`${elementId}-error`)) {
            element.parentNode.appendChild(errorDiv);
        }
        
        element.classList.add('input-error');
    },
    
    clearError(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('input-error');
        }
        
        const errorDiv = document.getElementById(`${elementId}-error`);
        if (errorDiv) {
            errorDiv.remove();
        }
    },
    
    clearAllErrors(formId) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        form.querySelectorAll('.error-message').forEach(el => el.remove());
    },
    
    setButtonLoading(buttonId, loading = true) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        if (loading) {
            button.dataset.originalText = button.textContent;
            button.disabled = true;
            button.classList.add('loading');
            button.textContent = 'Loading...';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            button.textContent = button.dataset.originalText || button.textContent;
        }
    }
};

// Export to window
window.Validators = Validators;
window.FormUtils = FormUtils;
