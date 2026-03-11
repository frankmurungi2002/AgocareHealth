/**
 * AGOCARE - Modern Quora-Style Q&A System
 * Features: X/Instagram/Quora best practices
 * - Real user questions from API
 * - Verified health worker badges
 * - Real-time polling
 * - Engagement features
 */

const QuestionsFeed = {
    questions: [],
    currentPage: 0,
    pageSize: 15,
    isLoading: false,
    category: 'all',
    expandedQuestions: new Set(),
    pollingInterval: null,
    lastQuestionCount: 0,

    async init() {
        console.log('Initializing Modern Questions Feed...');
        
        this.setupEventListeners();
        await this.loadQuestions();
        this.startPolling();
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopPolling();
            } else {
                this.startPolling();
            }
        });
    },

    setupEventListeners() {
        const searchInput = document.getElementById('question-search');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.searchQuestions(e.target.value);
            }, 500));
        }

        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.category = btn.dataset.category || 'all';
                this.loadQuestions();
            });
        });
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    async loadQuestions() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();
        
        try {
            let response;
            if (this.category === 'all') {
                response = await apiGetApprovedQuestions();
            } else {
                response = await apiGetQuestionsByCategory(this.category);
            }
            
            const questions = response.data || response || [];
            this.questions = questions;
            
            if (questions.length > this.lastQuestionCount && this.lastQuestionCount > 0) {
                this.showNewQuestionsBanner();
            }
            this.lastQuestionCount = questions.length;
            
            this.renderQuestions();
            this.updateStats();
            
        } catch (error) {
            console.error('Error loading questions:', error);
            this.renderError('Failed to load questions. Please try again.');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    },

    async searchQuestions(keyword) {
        if (!keyword.trim()) {
            this.loadQuestions();
            return;
        }
        
        this.isLoading = true;
        this.showLoading();
        
        try {
            const response = await apiSearchQuestions(keyword);
            this.questions = response.data || response || [];
            this.renderQuestions();
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    },

    startPolling() {
        if (this.pollingInterval) return;
        
        this.pollingInterval = setInterval(() => {
            this.checkForNewQuestions();
        }, 30000);
    },

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    },

    async checkForNewQuestions() {
        try {
            const response = await apiGetApprovedQuestions();
            const questions = response.data || response || [];
            
            if (questions.length > this.questions.length) {
                this.showNewQuestionsBanner();
            }
        } catch (error) {
            console.log('Polling error:', error);
        }
    },

    showNewQuestionsBanner() {
        const banner = document.getElementById('newQuestionsBanner');
        if (banner) {
            banner.classList.add('show');
        }
    },

    renderQuestions() {
        const container = document.getElementById('questions-container');
        if (!container) return;
        
        if (!this.questions || this.questions.length === 0) {
            this.renderEmpty();
            return;
        }
        
        container.innerHTML = this.questions.map(q => this.createQuestionCard(q)).join('');
        this.attachQuestionEvents();
    },

    createQuestionCard(question) {
        const timeAgo = this.formatTimeAgo(question.createdAt);
        const author = question.author || {};
        const isHealthWorker = author.role === 'DOCTOR' || author.role === 'NURSE' || author.role === 'HEALTH_WORKER';
        const isVerified = author.isVerified || author.role === 'DOCTOR';
        
        const badgeType = this.getBadgeType(author);
        const badgeTooltip = this.getBadgeTooltip(author);
        
        return `
            <article class="question-card" data-id="${question.id}">
                <div class="question-header">
                    <div class="author-avatar">
                        ${author.profilePicture 
                            ? `<img src="${author.profilePicture}" alt="${author.name || 'User'}">`
                            : `<span class="initials ${isHealthWorker ? 'medical' : ''}">${this.getInitials(author.name)}</span>`
                        }
                    </div>
                    <div class="author-details">
                        <div class="author-name">
                            <span class="name-text">${author.name || 'Anonymous'}</span>
                            ${isVerified ? `<span class="verified-badge ${badgeType}" data-tooltip="${badgeTooltip}"></span>` : ''}
                        </div>
                        <div class="author-meta">
                            ${isHealthWorker ? `<span class="credential-badge ${author.role.toLowerCase()}"><span class="icon">${this.getRoleIcon(author.role)}</span><span class="title">${this.getRoleLabel(author.role)}</span></span>` : 'Community Member'}
                            <span class="separator">·</span>
                            <span>${timeAgo}</span>
                        </div>
                    </div>
                </div>
                
                <div class="question-content">
                    <h3 class="question-title">${this.escapeHtml(question.title)}</h3>
                    <p class="question-text">${this.escapeHtml(question.content)}</p>
                </div>
                
                <div class="category-tag">${this.formatCategory(question.category)}</div>
                
                <div class="question-actions">
                    <div class="action-group">
                        <button class="action-btn upvote-btn ${this.hasUserUpvoted(question) ? 'active' : ''}" data-id="${question.id}" onclick="QuestionsFeed.handleUpvote(event, '${question.id}')">
                            <span class="icon">▲</span>
                            <span class="count">${question.upvotes || 0}</span>
                            <span>Upvote</span>
                        </button>
                        <button class="action-btn answer-btn" data-id="${question.id}" onclick="QuestionsFeed.toggleAnswers(event, '${question.id}')">
                            <span class="icon">💬</span>
                            <span class="count">${question.answerCount || 0}</span>
                            <span>Answer</span>
                        </button>
                        <button class="action-btn bookmark-btn ${this.hasUserBookmarked(question) ? 'active' : ''}" data-id="${question.id}" onclick="QuestionsFeed.handleBookmark(event, '${question.id}')">
                            <span class="icon">🔖</span>
                            <span>Save</span>
                        </button>
                    </div>
                    <button class="action-btn share-btn" data-id="${question.id}" onclick="QuestionsFeed.handleShare(event, '${question.id}')">
                        <span class="icon">↗</span>
                        <span>Share</span>
                    </button>
                </div>
                
                <div id="answers-${question.id}" class="answers-section" style="display: none;"></div>
            </article>
        `;
    },

    getBadgeType(author) {
        if (author.role === 'DOCTOR') return 'blue';
        if (author.role === 'NURSE') return 'healthworker';
        if (author.isExpert) return 'gold';
        return 'blue';
    },

    getBadgeTooltip(author) {
        if (author.role === 'DOCTOR') return 'Verified Doctor';
        if (author.role === 'NURSE') return 'Verified Nurse';
        if (author.role === 'HEALTH_WORKER') return 'Verified Health Worker';
        return 'Verified User';
    },

    getRoleIcon(role) {
        const icons = {
            'DOCTOR': '⭐',
            'NURSE': '🏥',
            'HEALTH_WORKER': '⚕️',
            'PATIENT': '👤'
        };
        return icons[role] || '👤';
    },

    getRoleLabel(role) {
        const labels = {
            'DOCTOR': 'Doctor',
            'NURSE': 'Nurse',
            'HEALTH_WORKER': 'Health Worker',
            'PATIENT': 'Patient'
        };
        return labels[role] || 'User';
    },

    formatCategory(category) {
        const categories = {
            'PEDIATRICS': '👶 Pediatrics',
            'PREGNANCY': '🤰 Pregnancy',
            'INFECTIOUS': '🦠 Infectious Diseases',
            'INFECTIOUS_DISEASES': '🦠 Infectious Diseases',
            'SEXUAL_HEALTH': '❤️ Sexual Health',
            'MENTAL_HEALTH': '🧠 Mental Health',
            'GENERAL': '💊 General Health',
            'NUTRITION': '🥗 Nutrition',
            'CHRONIC_DISEASES': '🏥 Chronic Diseases',
            'FITNESS': '💪 Fitness'
        };
        return categories[category] || '💊 General Health';
    },

    attachQuestionEvents() {
        document.querySelectorAll('.bookmark-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleBookmark(e, btn.dataset.id);
            });
        });

        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleShare(e, btn.dataset.id);
            });
        });
    },

    async handleUpvote(event, questionId) {
        event.stopPropagation();
        
        const user = getCurrentUser();
        if (!user) {
            this.showToast('Please login to upvote', 'error');
            return;
        }
        
        const btn = event.currentTarget;
        const isActive = btn.classList.contains('active');
        
        try {
            if (!isActive) {
                await apiUpvoteQuestion(questionId, user.id);
                btn.classList.add('active');
                const count = btn.querySelector('.count');
                count.textContent = parseInt(count.textContent) + 1;
                this.showToast('Upvoted!', 'success');
            }
        } catch (error) {
            console.error('Upvote error:', error);
            this.showToast('Failed to upvote', 'error');
        }
    },

    async handleBookmark(event, questionId) {
        event.stopPropagation();
        
        const user = getCurrentUser();
        if (!user) {
            this.showToast('Please login to save', 'error');
            return;
        }
        
        const btn = event.currentTarget;
        const isActive = btn.classList.contains('active');
        
        let bookmarks = JSON.parse(localStorage.getItem('bookmarkedQuestions') || '[]');
        
        if (isActive) {
            bookmarks = bookmarks.filter(id => id !== questionId);
            btn.classList.remove('active');
            this.showToast('Removed from saved', 'info');
        } else {
            bookmarks.push(questionId);
            btn.classList.add('active');
            this.showToast('Saved for later!', 'success');
        }
        
        localStorage.setItem('bookmarkedQuestions', JSON.stringify(bookmarks));
    },

    handleShare(event, questionId) {
        event.stopPropagation();
        
        const question = this.questions.find(q => q.id == questionId);
        if (!question) return;
        
        const shareData = {
            title: question.title,
            text: question.content.substring(0, 100) + '...',
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData).catch(() => {});
        } else {
            const url = `${window.location.origin}/html/questions-feed.html?id=${questionId}`;
            navigator.clipboard.writeText(url).then(() => {
                this.showToast('Link copied to clipboard!', 'success');
            });
        }
    },

    hasUserUpvoted(question) {
        const user = getCurrentUser();
        if (!user) return false;
        return question.upvotedBy?.includes(user.id);
    },

    hasUserBookmarked(question) {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedQuestions') || '[]');
        return bookmarks.includes(question.id);
    },

    async toggleAnswers(event, questionId) {
        event.stopPropagation();
        
        const wrapper = document.getElementById(`answers-${questionId}`);
        if (!wrapper) return;
        
        if (this.expandedQuestions.has(questionId)) {
            wrapper.style.display = 'none';
            this.expandedQuestions.delete(questionId);
        } else {
            wrapper.style.display = 'block';
            wrapper.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading answers...</p></div>';
            
            try {
                const answers = await apiGetAnswersForQuestion(questionId);
                this.displayAnswers(questionId, answers);
                this.expandedQuestions.add(questionId);
            } catch (error) {
                wrapper.innerHTML = '<div class="error-state"><p>Failed to load answers</p></div>';
            }
        }
    },

    displayAnswers(questionId, answers) {
        const wrapper = document.getElementById(`answers-${questionId}`);
        if (!wrapper) return;
        
        const sortedAnswers = (answers || []).sort((a, b) => {
            if (a.isAccepted) return -1;
            if (b.isAccepted) return 1;
            return (b.helpfulCount || 0) - (a.helpfulCount || 0);
        });
        
        if (sortedAnswers.length === 0) {
            wrapper.innerHTML = `
                <div class="no-answers">
                    <div class="no-answers-icon">💭</div>
                    <div class="no-answers-title">No answers yet</div>
                    <div class="no-answers-desc">Be the first to help!</div>
                </div>
                ${this.canAnswer() ? this.getAnswerForm(questionId) : ''}
            `;
            return;
        }
        
        let html = `<div class="answers-header"><span class="answers-count">${sortedAnswers.length} <span>Answer${sortedAnswers.length !== 1 ? 's' : ''}</span></span></div>`;
        
        sortedAnswers.forEach(answer => {
            const author = answer.author || {};
            const isHealthWorker = author.role === 'DOCTOR' || author.role === 'NURSE' || author.role === 'HEALTH_WORKER';
            const isVerified = author.isVerified || author.role === 'DOCTOR';
            const timeAgo = this.formatTimeAgo(answer.createdAt);
            
            html += `
                <div class="answer-card ${answer.isAccepted ? 'accepted' : ''} ${isHealthWorker ? 'healthworker-answer' : ''}" data-answer-id="${answer.id}">
                    ${answer.isAccepted ? '<div class="accepted-badge">Accepted Answer</div>' : ''}
                    
                    <div class="answer-author">
                        <div class="answer-author-avatar">
                            ${author.profilePicture 
                                ? `<img src="${author.profilePicture}" alt="${author.name}">`
                                : `<span class="initials ${isHealthWorker ? 'doctor' : ''}">${this.getInitials(author.name)}</span>`
                            }
                        </div>
                        <div>
                            <div class="answer-author-name">
                                ${author.name || 'Anonymous'}
                                ${isVerified ? `<span class="verified-badge blue" data-tooltip="${this.getBadgeTooltip(author)}"></span>` : ''}
                            </div>
                            <div class="answer-author-credentials">
                                ${isHealthWorker ? `${this.getRoleIcon(author.role)} ${this.getRoleLabel(author.role)}` : 'Community Member'} · ${timeAgo}
                            </div>
                        </div>
                    </div>
                    
                    <div class="answer-text">${this.escapeHtml(answer.content)}</div>
                    
                    <div class="answer-actions">
                        <div class="action-group">
                            <button class="action-btn upvote-btn" onclick="QuestionsFeed.voteAnswer('${answer.id}', 'up')">
                                <span class="icon">▲</span>
                                <span class="count">${answer.upvotes || 0}</span>
                            </button>
                            <button class="action-btn" onclick="QuestionsFeed.markHelpful('${answer.id}')">
                                <span class="icon">✓</span>
                                <span>Helpful (${answer.helpfulCount || 0})</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        if (this.canAnswer()) {
            html += this.getAnswerForm(questionId);
        }
        
        wrapper.innerHTML = html;
    },

    canAnswer() {
        const user = getCurrentUser();
        if (!user) return false;
        return user.role === 'DOCTOR' || user.role === 'NURSE' || user.role === 'HEALTH_WORKER';
    },

    getAnswerForm(questionId) {
        return `
            <div class="answer-form" style="margin-top: 16px; padding: 16px; background: #f7f9f9; border-radius: 12px;">
                <textarea id="answer-text-${questionId}" placeholder="Write your answer..." rows="4" style="width: 100%; padding: 12px; border: 2px solid #e8eaed; border-radius: 12px; font-size: 14px; resize: vertical; margin-bottom: 12px;"></textarea>
                <button class="btn-answer" onclick="QuestionsFeed.submitAnswer('${questionId}')">Submit Answer</button>
            </div>
        `;
    },

    async submitAnswer(questionId) {
        const textarea = document.getElementById(`answer-text-${questionId}`);
        const content = textarea?.value?.trim();
        
        if (!content) {
            this.showToast('Please write an answer', 'error');
            return;
        }
        
        const user = getCurrentUser();
        if (!user) {
            this.showToast('Please login to answer', 'error');
            return;
        }
        
        try {
            await apiCreateAnswer(questionId, user.id, content);
            this.showToast('Answer submitted!', 'success');
            await this.toggleAnswers({ stopPropagation: () => {} }, questionId);
            await this.toggleAnswers({ stopPropagation: () => {} }, questionId);
        } catch (error) {
            console.error('Submit answer error:', error);
            this.showToast('Failed to submit answer', 'error');
        }
    },

    async voteAnswer(answerId, direction) {
        const user = getCurrentUser();
        if (!user) {
            this.showToast('Please login to vote', 'error');
            return;
        }
        
        try {
            if (direction === 'up') {
                await apiUpvoteAnswer(answerId);
                this.showToast('Vote recorded!', 'success');
            }
        } catch (error) {
            console.error('Vote error:', error);
        }
    },

    async markHelpful(answerId) {
        const user = getCurrentUser();
        if (!user) {
            this.showToast('Please login', 'error');
            return;
        }
        
        try {
            await apiMarkAnswerAsHelpful(answerId);
            this.showToast('Marked as helpful!', 'success');
        } catch (error) {
            console.error('Mark helpful error:', error);
        }
    },

    updateStats() {
        const unanswered = this.questions.filter(q => !q.answerCount || q.answerCount === 0).length;
        const urgent = this.questions.filter(q => q.isUrgent).length;
        const answeredToday = this.questions.filter(q => {
            if (!q.createdAt) return false;
            const created = new Date(q.createdAt);
            const today = new Date();
            return created.toDateString() === today.toDateString() && q.answerCount > 0;
        }).length;
        
        const unansweredEl = document.getElementById('unansweredCount');
        const urgentEl = document.getElementById('urgentCount');
        const answeredEl = document.getElementById('answeredTodayCount');
        
        if (unansweredEl) unansweredEl.textContent = unanswered;
        if (urgentEl) urgentEl.textContent = urgent;
        if (answeredEl) answeredEl.textContent = answeredToday;
        
        // Update sidebar stats
        const sidebarUnanswered = document.getElementById('sidebarUnanswered');
        const sidebarUrgent = document.getElementById('sidebarUrgent');
        const sidebarAnswered = document.getElementById('sidebarAnswered');
        
        if (sidebarUnanswered) sidebarUnanswered.textContent = unanswered;
        if (sidebarUrgent) sidebarUrgent.textContent = urgent;
        if (sidebarAnswered) sidebarAnswered.textContent = answeredToday;
    },

    renderEmpty() {
        const container = document.getElementById('questions-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">💭</div>
                <h3>No questions yet</h3>
                <p>Be the first to ask a question!</p>
                <button class="btn-primary" onclick="QuestionsFeed.showAskModal()">Ask a Question</button>
            </div>
        `;
    },

    renderError(message) {
        const container = document.getElementById('questions-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="error-state">
                <div class="icon">⚠️</div>
                <h3>${message}</h3>
                <button class="btn-primary" onclick="QuestionsFeed.loadQuestions()">Try Again</button>
            </div>
        `;
    },

    showLoading() {
        const container = document.getElementById('questions-container');
        if (!container) return;
        
        if (!container.querySelector('.loading-spinner')) {
            container.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading questions...</p>
                </div>
            `;
        }
    },

    hideLoading() {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) spinner.remove();
    },

    showAskModal() {
        const user = getCurrentUser();
        if (!user) {
            this.showToast('Please login to ask a question', 'error');
            window.location.href = 'Login.html';
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Ask a Question</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Question Title</label>
                        <input type="text" id="question-title" placeholder="What's your health question?" maxlength="200">
                    </div>
                    <div class="form-group">
                        <label>Details (optional)</label>
                        <textarea id="question-content" placeholder="Provide more details about your question..." rows="4"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select id="question-category">
                            <option value="GENERAL">💊 General Health</option>
                            <option value="NUTRITION">🥗 Nutrition</option>
                            <option value="MENTAL_HEALTH">🧠 Mental Health</option>
                            <option value="PREGNANCY">🤰 Pregnancy</option>
                            <option value="PEDIATRICS">👶 Pediatrics</option>
                            <option value="INFECTIOUS_DISEASES">🦠 Infectious Diseases</option>
                            <option value="SEXUAL_HEALTH">❤️ Sexual Health</option>
                            <option value="CHRONIC_DISEASES">🏥 Chronic Diseases</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="btn-primary" onclick="QuestionsFeed.submitQuestion()">Post Question</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    async submitQuestion() {
        const title = document.getElementById('question-title')?.value?.trim();
        const content = document.getElementById('question-content')?.value?.trim();
        const category = document.getElementById('question-category')?.value;
        
        if (!title) {
            this.showToast('Please enter a question title', 'error');
            return;
        }
        
        const user = getCurrentUser();
        if (!user) {
            this.showToast('Please login to ask a question', 'error');
            return;
        }
        
        try {
            await apiCreateQuestion(user.id, title, content || title, category);
            this.showToast('Question posted!', 'success');
            document.querySelector('.modal-overlay')?.remove();
            await this.loadQuestions();
        } catch (error) {
            console.error('Submit question error:', error);
            this.showToast('Failed to post question', 'error');
        }
    },

    formatTimeAgo(dateString) {
        if (!dateString) return 'Just now';
        
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

    getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    showToast(message, type = 'info') {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
};

window.QuestionsFeed = QuestionsFeed;
