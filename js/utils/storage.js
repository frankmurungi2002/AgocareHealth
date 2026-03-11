/**
 * Agrocare Utilities - Storage Manager
 * Handles localStorage with error handling and type safety
 */

const Storage = {
    KEYS: {
        AUTH_TOKEN: 'authToken',
        CURRENT_USER: 'currentUser',
        USER_ROLE: 'userRole',
        THEME: 'theme',
        LANGUAGE: 'language'
    },
    
    set(key, value) {
        try {
            const serialized = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;
            try {
                return JSON.parse(item);
            } catch {
                return item;
            }
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    },
    
    has(key) {
        return localStorage.getItem(key) !== null;
    },
    
    // Auth-specific methods
    setAuth(token, user) {
        this.set(this.KEYS.AUTH_TOKEN, token);
        this.set(this.KEYS.CURRENT_USER, user);
    },
    
    getAuth() {
        return {
            token: this.get(this.KEYS.AUTH_TOKEN),
            user: this.get(this.KEYS.CURRENT_USER)
        };
    },
    
    clearAuth() {
        this.remove(this.KEYS.AUTH_TOKEN);
        this.remove(this.KEYS.CURRENT_USER);
        this.remove(this.KEYS.USER_ROLE);
    }
};

// Export to window
window.Storage = Storage;
