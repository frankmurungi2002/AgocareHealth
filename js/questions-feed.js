/**
 * Agrocare Questions Feed - Modern Quora-style
 */

const QuestionsFeed = {
    questions: [],
    currentPage: 0,
    pageSize: 10,
    isLoading: false,
    category: 'all',
    
    async init() {
        console.log('Initializing Questions Feed...');
        await this.loadQuestions();
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        const searchInput = document.getElementById('question-search');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.searchQuestions(e.target.value);
            }, 500));
        }
        
        const categorySelect = document.getElementById('category-filter');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.category = e.target.value;
                this.loadQuestions();
            });
        }
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
                response = await API.questions.getApproved();
            } else {
                response = await API.questions.getByCategory(this.category);
            }
            
            if (response.data || response) {
                this.questions = response.data || response;
                this.renderQuestions();
            } else {
                this.renderEmpty();
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            this.renderError('Failed to load questions');
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
            const response = await API.questions.search(keyword);
            this.questions = response.data || response;
            this.renderQuestions();
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            this.isLoading = false;
            this.hideLoading();
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
        const isHealthWorker = question.authorRole === 'DOCTOR' || question.authorRole === 'HEALTH_WORKER';
        const isVerified = question.authorIsVerified;
        
        return `
            <div class="question-card" data-id="${question.id}">
                <div class="question-header">
                    <div class="author-info">
                        <div class="author-avatar">
                            ${question.authorProfilePicture 
                                ? `<img src="${question.authorProfilePicture}" alt="${question.authorName}">`
                                : `<span class="avatar-initials">${this.getInitials(question.authorName)}</span>`
                            }
                        </div>
                        <div class="author-details">
                            <div class="author-name">
                                ${question.authorName || 'Anonymous'}
                                ${isHealthWorker ? `<span class="verified-badge" title="Verified Health Worker">✓</span>` : ''}
                            </div>
                            <div class="author-meta">
                                ${isHealthWorker ? `<span class="health-worker-label">Health Worker</span>` : 'Community Member'} • ${timeAgo}
                            </div>
                        </div>
                    </div>
                    <div class="question-category">
                        <span class="category-tag">${question.category || 'General'}</span>
                    </div>
                </div>
                
                <div class="question-content">
                    <h3 class="question-title">${this.escapeHtml(question.title)}</h3>
                    <p class="question-text">${this.escapeHtml(question.content)}</p>
                </div>
                
                <div class="question-actions">
                    <button class="action-btn upvote-btn" data-id="${question.id}">
                        <span class="icon">▲</span>
                        <span class="count">${question.upvotes || 0}</span>
                        <span class="label">Upvote</span>
                    </button>
                    <button class="action-btn answer-btn" data-id="${question.id}">
                        <span class="icon">💬</span>
                        <span class="count">${question.answerCount || 0}</span>
                        <span class="label">Answer</span>
                    </button>
                    <button class="action-btn share-btn" data-id="${question.id}">
                        <span class="icon">↗</span>
                        <span class="label">Share</span>
                    </button>
                    <button class="action-btn bookmark-btn" data-id="${question.id}">
                        <span class="icon">🔖</span>
                        <span class="label">Save</span>
                    </button>
                </div>
                
                ${question.isResolved ? '<div class="resolved-badge">✓ Resolved</div>' : ''}
            </div>
        `;
    },
    
    attachQuestionEvents() {
        document.querySelectorAll('.upvote-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleUpvote(btn.dataset.id);
            });
        });
        
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showAnswerForm(btn.dataset.id);
            });
        });
        
        document.querySelectorAll('.question-card').forEach(card => {
            card.addEventListener('click', () => {
                this.showQuestionDetail(card.dataset.id);
            });
        });
    },
    
    async handleUpvote(questionId) {
        const user = API.getCurrentUser();
        if (!user) {
            Toast.error('Please login to upvote');
            return;
        }
        
        try {
            await API.questions.upvote(questionId, user.id);
            Toast.success('Upvoted!');
            this.loadQuestions();
        } catch (error) {
            console.error('Upvote error:', error);
            Toast.error('Failed to upvote');
        }
    },
    
    showAnswerForm(questionId) {
        const modal = document.createElement('div');
        modal.className = 'answer-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Write Your Answer</h3>
                    <button class="close-btn" onclick="this.closest('.answer-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <textarea id="answer-content" placeholder="Share your knowledge..." rows="6"></textarea>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.answer-modal').remove()">Cancel</button>
                    <button class="btn-primary" onclick="QuestionsFeed.submitAnswer(${questionId})">Submit Answer</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    async submitAnswer(questionId) {
        const content = document.getElementById('answer-content')?.value;
        if (!content?.trim()) {
            Toast.error('Please write an answer');
            return;
        }
        
        const user = API.getCurrentUser();
        if (!user) {
            Toast.error('Please login to answer');
            return;
        }
        
        try {
            await API.answers.create({
                questionId: parseInt(questionId),
                userId: user.id,
                content: content
            });
            
            Toast.success('Answer submitted!');
            document.querySelector('.answer-modal')?.remove();
            this.loadQuestions();
        } catch (error) {
            console.error('Submit answer error:', error);
            Toast.error('Failed to submit answer');
        }
    },
    
    showQuestionDetail(questionId) {
        window.location.href = `questions-feed.html?id=${questionId}`;
    },
    
    renderEmpty() {
        const container = document.getElementById('questions-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💭</div>
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
                <div class="error-icon">⚠️</div>
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
        const user = API.getCurrentUser();
        if (!user) {
            Toast.error('Please login to ask a question');
            window.location.href = 'Login.html';
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'ask-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Ask a Question</h3>
                    <button class="close-btn" onclick="this.closest('.ask-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Question Title</label>
                        <input type="text" id="question-title" placeholder="What's your question?" maxlength="200">
                    </div>
                    <div class="form-group">
                        <label>Details (optional)</label>
                        <textarea id="question-content" placeholder="Provide more details..." rows="4"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select id="question-category">
                            <option value="GENERAL">General Health</option>
                            <option value="NUTRITION">Nutrition</option>
                            <option value="MENTAL_HEALTH">Mental Health</option>
                            <option value="PREGNANCY">Pregnancy</option>
                            <option value="PEDIATRICS">Pediatrics</option>
                            <option value="INFECTIOUS_DISEASES">Infectious Diseases</option>
                            <option value="SEXUAL_HEALTH">Sexual Health</option>
                            <option value="CHRONIC_DISEASES">Chronic Diseases</option>
                            <option value="FITNESS">Fitness & Exercise</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.ask-modal').remove()">Cancel</button>
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
            Toast.error('Please enter a question title');
            return;
        }
        
        const user = API.getCurrentUser();
        if (!user) {
            Toast.error('Please login to ask a question');
            return;
        }
        
        try {
            await API.questions.create({
                title,
                content: content || title,
                category
            });
            
            Toast.success('Question posted!');
            document.querySelector('.ask-modal')?.remove();
            this.loadQuestions();
        } catch (error) {
            console.error('Submit question error:', error);
            Toast.error('Failed to post question');
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
    }
};

window.QuestionsFeed = QuestionsFeed;
